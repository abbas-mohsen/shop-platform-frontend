import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate, useNavigate } from "react-router-dom";

const API_BASE = process.env.REACT_APP_API_BASE_URL;

function AdminOrdersPage() {
  const { isAdmin } = useAuth();
  const [orders, setOrders] = useState([]);
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
        // API may return an array or {orders: [...]}
        setOrders(Array.isArray(data) ? data : data.orders || []);
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

  const handleOpenOrder = (order) => {
    // Go to React admin order details page, passing the full order in state
    navigate(`/admin/orders/${order.id}`, { state: { order } });
  };

  if (loading) {
    return <div className="home-root">Loading orders...</div>;
  }

  if (error) {
    return (
      <div className="home-root" style={{ color: "red" }}>
        {error}
      </div>
    );
  }

  return (
    <div className="home-root">
      <h1 className="page-title">Manage Orders</h1>

      <div className="table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Email</th>
              <th>Total</th>
              <th>Status</th>
              <th>Placed At</th>
              <th>Items</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>#{order.id}</td>
                <td>{order.user ? order.user.name : "Guest"}</td>
                <td>{order.user ? order.user.email : "-"}</td>
                <td>${Number(order.total || 0).toFixed(2)}</td>
                <td>{order.status}</td>
                <td>{new Date(order.created_at).toLocaleString()}</td>
                <td style={{ fontSize: 12 }}>
                  {order.items && order.items.length > 0
                    ? order.items
                        .map(
                          (i) =>
                            `${i.quantity}x ${
                              i.product ? i.product.name : "Product"
                            }`
                        )
                        .join(", ")
                    : "—"}
                </td>
                <td>
                  <button
                    type="button"
                    onClick={() => handleOpenOrder(order)}
                    className="btn-outline"
                    style={{ fontSize: 12, padding: "4px 10px" }}
                  >
                    Open
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminOrdersPage;
