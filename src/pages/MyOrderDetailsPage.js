import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const apiBaseUrl =
  process.env.REACT_APP_API_BASE_URL;
const STORAGE_URL = process.env.REACT_APP_STORAGE_URL;

const MyOrderDetailsPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      setError("");

      try {
        const token = localStorage.getItem("auth_token");
        if (!token) {
          setError("You are not authenticated.");
          setLoading(false);
          return;
        }

        const response = await fetch(
          `${apiBaseUrl}/api/my-orders/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load order details."
          );
        }

        setOrder(data.order || null);
      } catch (err) {
        console.error(err);
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchOrder();
  }, [id]);

  const formatDate = (isoString) => {
    if (!isoString) return "";
    return new Date(isoString).toLocaleString();
  };

  const formatPaymentMethod = (pm) => {
    if (pm === "cash") return "Cash on Delivery";
    if (pm === "card") return "Card";
    return pm || "-";
  };

  const formatStatus = (s) => {
    if (!s) return "-";
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p>Loading order...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-red-400">
            {error || "Order not found."}
          </p>
          <button
            onClick={() => navigate("/my-orders")}
            className="border border-white px-4 py-2 rounded-md hover:bg-white hover:text-black transition"
          >
            Back to My Orders
          </button>
        </div>
      </div>
    );
  }

  const items = Array.isArray(order.items) ? order.items : [];

  return (
    <div className="min-h-screen bg-black text-white px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => navigate("/my-orders")}
          className="text-sm text-zinc-400 hover:text-white mb-4"
        >
          ← Back to My Orders
        </button>

        <h1 className="text-3xl font-bold mb-4 tracking-wide">
          Order #{order.id}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4 md:col-span-2">
            <h2 className="text-lg font-semibold mb-3">
              Order Info
            </h2>
            <div className="text-sm text-zinc-300 space-y-1">
              <div>
                <span className="text-zinc-500">Date: </span>
                {formatDate(order.created_at)}
              </div>
              <div>
                <span className="text-zinc-500">Status: </span>
                {formatStatus(order.status)}
              </div>
              <div>
                <span className="text-zinc-500">Payment: </span>
                {formatPaymentMethod(order.payment_method)}
              </div>
              {order.address && (
                <div className="mt-2">
                  <span className="text-zinc-500">
                    Shipping address:
                  </span>
                  <div className="mt-1 text-zinc-300 whitespace-pre-line">
                    {order.address}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4">
            <h2 className="text-lg font-semibold mb-3">
              Summary
            </h2>
            <div className="flex justify-between text-sm text-zinc-300 mb-2">
              <span>Items total</span>
              <span>
                ${Number(order.total || 0).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm text-zinc-500 mb-2">
              <span>Shipping</span>
              <span>To be confirmed</span>
            </div>
            <div className="border-t border-zinc-700 mt-3 pt-3 flex justify-between items-center">
              <span className="text-sm text-zinc-400">
                Grand Total
              </span>
              <span className="text-xl font-bold">
                ${Number(order.total || 0).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4">
          <h2 className="text-lg font-semibold mb-3">
            Items
          </h2>

          {items.length === 0 ? (
            <p className="text-sm text-zinc-400">
              No items in this order.
            </p>
          ) : (
            <div className="space-y-3">
              {items.map((item) => {
                const product = item.product || {};
                const imgPath = product.image || null;
                const imgUrl =
                  imgPath && imgPath.startsWith("http")
                    ? imgPath
                    : imgPath && STORAGE_URL
                    ? `${STORAGE_URL}/${imgPath}`
                    : null;

                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between border-b border-zinc-800 pb-3 last:border-b-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3">
                      {imgUrl ? (
                        <img
                          src={imgUrl}
                          alt={product.name}
                          className="w-14 h-14 object-cover rounded-md bg-zinc-800"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-md bg-zinc-800 flex items-center justify-center text-xs text-zinc-500">
                          No Image
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-sm">
                          {product.name || "Product"}
                        </div>
                        <div className="text-xs text-zinc-500">
                          Qty: {item.quantity} • Unit: $
                          {Number(item.unit_price || 0).toFixed(2)}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm font-semibold">
                      ${Number(item.line_total || 0).toFixed(2)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyOrderDetailsPage;
