import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const apiBaseUrl =
  process.env.REACT_APP_API_BASE_URL;

const MyOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError("");

      try {
        const token = localStorage.getItem("auth_token");
        if (!token) {
          setError("You are not authenticated.");
          setLoading(false);
          return;
        }

        const response = await fetch(`${apiBaseUrl}/api/my-orders`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load your orders."
          );
        }

        setOrders(Array.isArray(data.orders) ? data.orders : []);
      } catch (err) {
        console.error(err);
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const formatDate = (isoString) => {
    if (!isoString) return "";
    return new Date(isoString).toLocaleString();
  };

  const formatPaymentMethod = (pm) => {
    // backend stores: "cash" or "card"
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
        <p>Loading your orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-red-400">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="border border-white px-4 py-2 rounded-md hover:bg-white hover:text-black transition"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-3 tracking-wide">
            My Orders
          </h1>
          <p className="mb-4 text-zinc-400">
            You don&apos;t have any orders yet.
          </p>
          <button
            onClick={() => navigate("/products")}
            className="border border-white px-4 py-2 rounded-md hover:bg-white hover:text-black transition"
          >
            Start Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 tracking-wide">
          My Orders
        </h1>

        <div className="space-y-4">
          {orders.map((order) => (
            <button
              key={order.id}
              onClick={() => navigate(`/my-orders/${order.id}`)}
              className="w-full text-left bg-zinc-900 border border-zinc-700 rounded-xl p-4 hover:border-white transition flex justify-between items-center"
            >
              <div>
                <div className="text-sm text-zinc-400">
                  Order #{order.id}
                </div>
                <div className="text-xs text-zinc-500">
                  {formatDate(order.created_at)}
                </div>
                <div className="mt-1 text-xs text-zinc-400">
                  Status:{" "}
                  <span className="font-semibold">
                    {formatStatus(order.status)}
                  </span>
                  {" • "}
                  Payment:{" "}
                  <span className="font-semibold">
                    {formatPaymentMethod(order.payment_method)}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs uppercase text-zinc-500">
                  Total
                </div>
                <div className="text-xl font-bold">
                  ${Number(order.total || 0).toFixed(2)}
                </div>
                <div className="mt-1 text-xs text-zinc-500">
                  {Array.isArray(order.items)
                    ? `${order.items.length} item${
                        order.items.length === 1 ? "" : "s"
                      }`
                    : ""}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyOrdersPage;
