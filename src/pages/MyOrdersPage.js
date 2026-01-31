import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE =
  process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000";

function MyOrdersPage() {
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

        const res = await fetch(`${API_BASE}/api/my-orders`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to load orders.");
        }

        const list = Array.isArray(data.orders)
          ? data.orders
          : Array.isArray(data)
          ? data
          : [];
        setOrders(list);
      } catch (e) {
        console.error(e);
        setError(e.message || "Error loading orders.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const formatDate = (iso) =>
    iso ? new Date(iso).toLocaleString() : "";

  const formatPayment = (pm) => {
    if (pm === "cash") return "Cash on Delivery";
    if (pm === "card") return "Card";
    return pm || "-";
  };

  const formatStatus = (s) => {
    if (!s) return "-";
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "paid":
        return "status-pill paid";
      case "shipped":
        return "status-pill shipped";
      case "cancelled":
        return "status-pill cancelled";
      case "pending":
      default:
        return "status-pill pending";
    }
  };

  if (loading) {
    return (
      <div className="my-orders-page">
        <div className="orders-container">
          <p className="orders-loading">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-orders-page">
        <div className="orders-container">
          <div className="orders-error-card">
            <p className="orders-error-text">{error}</p>
            <button
              className="btn-outline"
              onClick={() => navigate("/")}
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="my-orders-page">
        <div className="orders-container">
          <div className="orders-header">
            <h1 className="orders-title">My Orders</h1>
            <p className="orders-subtitle">
              Track your recent purchases, order status, and totals in
              one place.
            </p>
          </div>

          <div className="orders-empty-card">
            <p>You haven&apos;t placed any orders yet.</p>
            <button
              className="btn-outline"
              onClick={() => navigate("/products")}
            >
              Start Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-orders-page">
      <div className="orders-container">
        <div className="orders-header">
          <h1 className="orders-title">My Orders</h1>
          <p className="orders-subtitle">
            Track your recent purchases, order status, and totals in
            one place.
          </p>
        </div>

        <div className="orders-list">
          {orders.map((order) => {
            const itemsCount = Array.isArray(order.items)
              ? order.items.length
              : 0;

            return (
              <div
                key={order.id}
                className="order-card"
                onClick={() => navigate(`/my-orders/${order.id}`)}
              >
                <div className="order-card-left">
                  <div className="order-id-row">
                    <span className="order-label">Order</span>
                    <span className="order-id">#{order.id}</span>
                  </div>
                  <div className="order-date">
                    {formatDate(order.created_at)}
                  </div>

                  <div className="order-meta-row">
                    <span className={getStatusClass(order.status)}>
                      {formatStatus(order.status)}
                    </span>
                    <span className="payment-pill">
                      Payment:{" "}
                      <strong>{formatPayment(order.payment_method)}</strong>
                    </span>
                  </div>
                </div>

                <div className="order-card-right">
                  <div className="order-total-label">Total</div>
                  <div className="order-total-value">
                    ${Number(order.total || 0).toFixed(2)}
                  </div>
                  <div className="order-items-count">
                    {itemsCount} item{itemsCount === 1 ? "" : "s"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default MyOrdersPage;
