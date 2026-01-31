// src/pages/CheckoutPage.js
import React, { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const API_BASE =
  process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000";

function CheckoutPage() {
  const { cartItems, clearCart, removeFromCart } = useCart();
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const items = Array.isArray(cartItems) ? cartItems : [];

  const { cartTotal, itemsCount } = useMemo(() => {
    let sum = 0;
    let count = 0;

    for (const item of items) {
      const price = Number(item.price ?? item.product?.price ?? 0);
      const qty = item.quantity || 0;
      count += qty;
      sum += price * qty;
    }

    return { cartTotal: sum, itemsCount: count };
  }, [items]);

  // Require auth
  if (!isLoggedIn) {
    return (
      <div className="checkout-page">
        <div className="orders-container">
          <div className="orders-error-card checkout-center-card">
            <h1 className="page-title">You need to be logged in</h1>
            <p className="orders-subtitle">
              Log in to place your XTREMEFIT order.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="btn-primary"
              style={{ marginTop: 10 }}
            >
              Go to login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Require cart not empty
  if (!items.length) {
    return (
      <div className="checkout-page">
        <div className="orders-container">
          <div className="orders-error-card checkout-center-card">
            <h1 className="page-title">Your cart is empty</h1>
            <p className="orders-subtitle">
              Add items to your cart before checking out.
            </p>
            <button
              onClick={() => navigate("/products")}
              className="btn-primary"
              style={{ marginTop: 10 }}
            >
              Go to products
            </button>
          </div>
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

      if (!token) {
        setError("You are not authenticated. Please login again.");
        setLoading(false);
        return;
      }

      const itemsArray = Array.isArray(cartItems) ? cartItems : [];

      const payload = {
        address,
        payment_method: paymentMethod,
        items: itemsArray.map((item) => ({
          product_id: item.product?.id ?? item.id,
          size: item.size,
          quantity: item.quantity || 1,
        })),
      };

      const response = await fetch(`${API_BASE}/api/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      let data = null;
      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        if (data && data.errors) {
          const firstKey = Object.keys(data.errors)[0];
          const firstMsg = data.errors[firstKey][0];
          throw new Error(firstMsg);
        }

        const msg =
          (data && (data.message || data.error)) ||
          `Request failed with status ${response.status}`;
        throw new Error(msg);
      }

      // Success
      setSuccessMessage("Order placed successfully!");

      if (typeof clearCart === "function") {
        clearCart();
      } else if (typeof removeFromCart === "function") {
        itemsArray.forEach((item) => {
          removeFromCart(item.id, item.size || null);
        });
      }

      setTimeout(() => {
        navigate("/my-orders");
      }, 800);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-page">
      <div className="orders-container">
        {/* Header */}
        <div className="orders-header">
          <div>
            <h1 className="orders-title">Checkout</h1>
            <p className="orders-subtitle">
              {itemsCount} item{itemsCount === 1 ? "" : "s"} in your XTREMEFIT
              order. Confirm your details and place it.
            </p>
          </div>
          <Link to="/cart" className="cart-continue-link">
            ← Back to cart
          </Link>
        </div>

        <div className="checkout-layout">
          {/* LEFT: FORM */}
          <div className="checkout-card">
            <h2 className="card-title">Shipping details</h2>
            <div className="card-body">
              <form onSubmit={handleSubmit} className="checkout-form">
                <div className="form-field">
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    value={user?.name || ""}
                    disabled
                    className="text-input text-input--disabled"
                  />
                </div>

                <div className="form-field">
                  <label className="form-label">
                    Address <span style={{ color: "#f97373" }}>*</span>
                  </label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows={3}
                    placeholder="Street, building, floor, city, phone number..."
                    className="text-input"
                    style={{ resize: "vertical" }}
                    required
                  />
                </div>

                <div className="form-field">
                  <label className="form-label">Payment method</label>
                  <div className="checkout-payment-options">
                    <label className="checkout-payment-option">
                      <input
                        type="radio"
                        name="payment_method"
                        value="cod"
                        checked={paymentMethod === "cod"}
                        onChange={() => setPaymentMethod("cod")}
                      />
                      <span>Cash on delivery</span>
                    </label>
                    <label className="checkout-payment-option disabled">
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
                  <div className="checkout-alert checkout-alert--error">
                    {error}
                  </div>
                )}

                {successMessage && (
                  <div className="checkout-alert checkout-alert--success">
                    {successMessage}
                  </div>
                )}

                <div className="form-actions">
                  <button
                    type="submit"
                    className="btn-primary checkout-submit-btn"
                    disabled={loading}
                  >
                    {loading ? "Placing order..." : "Place order"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* RIGHT: SUMMARY */}
          <div className="checkout-card">
            <h2 className="card-title">Order summary</h2>
            <div className="card-body">
              <div className="checkout-summary-list">
                {items.map((item) => {
                  const price = Number(
                    item.price ?? item.product?.price ?? 0
                  );
                  const qty = item.quantity || 0;
                  const lineTotal = price * qty;

                  return (
                    <div
                      key={`${item.id}-${item.size || "no-size"}`}
                      className="checkout-summary-item"
                    >
                      <div className="checkout-summary-main">
                        <div className="checkout-summary-name">
                          {item.name}
                        </div>
                        <div className="checkout-summary-meta">
                          Size: {item.size || "N/A"} • Qty: {qty}
                        </div>
                      </div>
                      <div className="checkout-summary-price">
                        ${lineTotal.toFixed(2)}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="summary-divider" />

              <div className="checkout-summary-footer">
                <div className="checkout-summary-row">
                  <span>Items total</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
                <div className="checkout-summary-row">
                  <span>Shipping</span>
                  <span>Calculated at delivery</span>
                </div>
                <div className="checkout-summary-row checkout-summary-row--total">
                  <span>Total</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
              </div>

              <p className="checkout-summary-note">
                Shipping cost & delivery time will be confirmed via WhatsApp /
                call after you place the order.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;
