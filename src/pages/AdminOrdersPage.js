import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate, useNavigate } from "react-router-dom";

const API_BASE = process.env.REACT_APP_API_BASE_URL;
const FILTERS = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Paid", value: "paid" },
  { label: "Shipped", value: "shipped" },
  { label: "Cancelled", value: "cancelled" },
];

function AdminOrdersPage() {
  const { isAdmin } = useAuth();
  const [orders, setOrders] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    const token = localStorage.getItem("auth_token");
    if (!token) {
      setLoading(false);
      return;
    }

    fetch(`${API_BASE}/api/admin/orders`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load orders");
        return res.json();
      })
      .then((data) => {
        const list = Array.isArray(data) ? data : data.orders || [];
        setOrders(list);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Error");
        setLoading(false);
      });
  }, [isAdmin]);

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const formatDate = (iso) =>
    iso ? new Date(iso).toLocaleString() : "";

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

  const formatStatus = (s) =>
    s ? s.charAt(0).toUpperCase() + s.slice(1) : "-";

  const filteredOrders = orders.filter((o) =>
    filterStatus === "all" ? true : o.status === filterStatus
  );

  const handleOpenOrder = (order) => {
    navigate(`/admin/orders/${order.id}`, { state: { order } });
  };

  if (loading) {
    return (
      <div className="my-orders-page">
        <div className="orders-container">
          <p className="orders-loading">Loading orders...</p>
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
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-orders-page">
      <div className="orders-container">
        {/* Header */}
        <div className="orders-header">
          <h1 className="orders-title">Manage Orders</h1>
          <p className="orders-subtitle">
            View, filter and manage all customer orders in one place.
          </p>
        </div>

        {/* Filters */}
        <div className="orders-filters">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              className={
                "filter-chip" +
                (filterStatus === f.value ? " active" : "")
              }
              onClick={() => setFilterStatus(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* List */}
        {filteredOrders.length === 0 ? (
          <div className="orders-empty-card">
            <p>No orders for this filter.</p>
          </div>
        ) : (
          <div className="orders-list">
            {filteredOrders.map((order) => {
              const itemsCount = Array.isArray(order.items)
                ? order.items.length
                : 0;
              const customerName = order.user
                ? order.user.name
                : "Guest";
              const customerEmail = order.user
                ? order.user.email
                : "-";

              return (
                <div
                  key={order.id}
                  className="order-card"
                  onClick={() => handleOpenOrder(order)}
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
                        Customer: <strong>{customerName}</strong>
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "#9ca3af",
                        marginTop: 4,
                      }}
                    >
                      {customerEmail}
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
        )}
      </div>
    </div>
  );
}

export default AdminOrdersPage;
