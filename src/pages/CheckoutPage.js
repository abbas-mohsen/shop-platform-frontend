import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const CheckoutPage = () => {
  const { cartItems, clearCart, removeFromCart } = useCart();
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const apiBaseUrl =
    process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000";

  const items = Array.isArray(cartItems) ? cartItems : [];

  // ✅ Compute total safely (instead of relying on cartTotal from context)
  const cartTotal = items.reduce((sum, item) => {
    const price = Number(
      item.price ??
        item.product?.price ??
        0
    );
    const qty = item.quantity || 0;
    return sum + price * qty;
  }, 0);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">You need to be logged in</h1>
          <button
            onClick={() => navigate("/login")}
            className="border border-white px-4 py-2 rounded-md hover:bg-white hover:text-black transition"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
          <button
            onClick={() => navigate("/products")}
            className="border border-white px-4 py-2 rounded-md hover:bg-white hover:text-black transition"
          >
            Shop Now
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setSuccessMessage("");
  setLoading(true);

  try {
    const token = localStorage.getItem("auth_token");
    console.log("🔑 Auth token:", token);

    if (!token) {
      setError("You are not authenticated. Please login again.");
      setLoading(false);
      return;
    }

    const items = Array.isArray(cartItems) ? cartItems : [];

    const payload = {
      address,
      payment_method: paymentMethod,
      items: items.map((item) => ({
        product_id: item.product?.id ?? item.id,
        size: item.size,
        quantity: item.quantity || 1,
      })),
    };

    console.log("📦 Checkout payload being sent:", payload);

    const url = `${apiBaseUrl}/api/checkout`;
    console.log("🌍 Checkout URL:", url);

    const response = await fetch(url, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",         // ✅ add this
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify(payload),
});


    console.log("📥 Raw response:", response);
    const data = await response.json().catch((err) => {
      console.log("⚠️ Error parsing JSON response:", err);
      return null;
    });

    console.log("📨 Parsed response JSON:", data);

    if (!response.ok) {
      // Laravel validation errors
      if (data && data.errors) {
        const firstKey = Object.keys(data.errors)[0];
        const firstMsg = data.errors[firstKey][0];
        console.log("❌ Validation error:", data.errors);
        throw new Error(firstMsg);
      }

      const msg =
        (data && (data.message || data.error)) ||
        `Request failed with status ${response.status}`;
      console.log("❌ Non-OK response:", msg);
      throw new Error(msg);
    }

    console.log("✅ Checkout success, data:", data);

    setSuccessMessage("Order placed successfully!");

    if (typeof clearCart === "function") {
      console.log("🧹 Clearing cart with clearCart()");
      clearCart();
    } else if (typeof removeFromCart === "function") {
      console.log("🧹 Clearing cart by removing each item");
      items.forEach((item) => {
        removeFromCart(item.id, item.size || null);
      });
    }

    setTimeout(() => {
      console.log("➡️ Navigating to /my-orders");
      navigate("/my-orders"); // or "/" if My Orders not done yet
    }, 800);
  } catch (err) {
    console.error("🔥 Checkout error caught in catch:", err);
    setError(err.message || "Something went wrong. Please try again.");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="min-h-screen bg-black text-white px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 tracking-wide">Checkout</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* LEFT: FORM */}
          <div className="md:col-span-2 bg-zinc-900 rounded-xl p-6 border border-zinc-700">
            <h2 className="text-xl font-semibold mb-4">Shipping Details</h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm mb-1 text-zinc-300">Name</label>
                <input
                  type="text"
                  value={user?.name || ""}
                  disabled
                  className="w-full px-3 py-2 rounded-md bg-zinc-800 border border-zinc-700 text-zinc-300 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm mb-1 text-zinc-300">
                  Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={3}
                  placeholder="Street, building, floor, city, phone number..."
                  className="w-full px-3 py-2 rounded-md bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm mb-2 text-zinc-300">
                  Payment Method
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="payment_method"
                      value="cod"
                      checked={paymentMethod === "cod"}
                      onChange={() => setPaymentMethod("cod")}
                    />
                    <span>Cash on Delivery</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer opacity-60">
                    <input
                      type="radio"
                      name="payment_method"
                      value="card"
                      checked={paymentMethod === "card"}
                      onChange={() => setPaymentMethod("card")}
                    />
                    <span>Card (coming soon)</span>
                  </label>
                </div>
              </div>

              {error && (
                <div className="text-red-400 text-sm border border-red-500 rounded-md px-3 py-2">
                  {error}
                </div>
              )}

              {successMessage && (
                <div className="text-green-400 text-sm border border-green-500 rounded-md px-3 py-2">
                  {successMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full md:w-auto px-6 py-2 rounded-md border border-white font-semibold tracking-wide hover:bg-white hover:text-black transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Placing order..." : "Place Order"}
              </button>
            </form>
          </div>

          {/* RIGHT: SUMMARY */}
          <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-700">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
              {items.map((item) => {
                const price = Number(
                  item.price ??
                    item.product?.price ??
                    0
                );
                const qty = item.quantity || 0;
                const lineTotal = price * qty;

                return (
                  <div
                    key={`${item.id}-${item.size || "no-size"}`}
                    className="flex justify-between text-sm border-b border-zinc-800 pb-2"
                  >
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs text-zinc-400">
                        Size: {item.size || "N/A"} • Qty: {qty}
                      </div>
                    </div>
                    <div className="font-medium">
                      ${lineTotal.toFixed(2)}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 border-t border-zinc-800 pt-4 flex justify-between items-center">
              <span className="text-sm text-zinc-400">Total</span>
              <span className="text-xl font-bold">
                ${cartTotal.toFixed(2)}
              </span>
            </div>

            <p className="mt-3 text-xs text-zinc-500">
              Shipping cost & delivery time will be confirmed via WhatsApp / call
              after you place the order.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
