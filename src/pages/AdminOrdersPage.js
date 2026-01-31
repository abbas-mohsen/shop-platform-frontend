import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate, useNavigate } from "react-router-dom";

const API_BASE = process.env.REACT_APP_API_BASE_URL;

const STATUS_OPTIONS = ["pending", "paid", "shipped", "cancelled"];

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
        // assuming API returns an array; if it returns {orders: [...]}, adjust to data.orders
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

  const handleStatusChange = async (orderId, newStatus) => {
    const token = localStorage.getItem("auth_token");
    try {
      const res = await fetch(`${API_BASE}/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update status");
      const updated = await res.json();

      setOrders((prev) =>
        prev.map((o) => (o.id === updated.id ? updated : o))
      );
    } catch (e) {
      alert(e.message || "Error updating status");
    }
  };

  const handleOpenOrder = (order) => {
    // 👉 go to React admin order details page, passing the full order in state
    navigate(`/admin/orders/${order.id}`, { state: { order } });
  };

  if (loading) return <div className="home-root">Loading orders...</div>;
  if (error)
    return (
      <div className="home-root" style={{ color: "red" }}>
        {error}
      </div>
    );

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
                <td>${Number(order.total).toFixed(2)}</td>
                <td>
                  <select
                    value={order.status}
                    onChange={(e) =>
                      handleStatusChange(order.id, e.target.value)
                    }
                    className="text-input"
                    style={{ padding: "4px 6px", fontSize: 12 }}
                  >
                    {STATUS_OPTIONS.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </td>
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
