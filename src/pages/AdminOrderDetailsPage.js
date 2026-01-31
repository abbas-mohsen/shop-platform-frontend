import React from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

const STORAGE_URL = process.env.REACT_APP_STORAGE_URL;

const AdminOrderDetailsPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // We expect the full order object to be passed via location.state
  const order = location.state?.order || null;

  if (!order) {
    return (
      <div className="home-root">
        <h1 className="page-title">Order #{id}</h1>
        <p style={{ color: "red", marginBottom: 16 }}>
          No order data available. Please open this order from the
          &quot;Manage Orders&quot; page.
        </p>
        <button
          className="btn-outline"
          onClick={() => navigate("/admin/orders")}
        >
          Back to Orders
        </button>
      </div>
    );
  }

  const items = Array.isArray(order.items) ? order.items : [];

  const formatDate = (iso) => {
    if (!iso) return "";
    return new Date(iso).toLocaleString();
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

  return (
    <div className="home-root">
      <button
        className="btn-outline"
        style={{ marginBottom: 16, fontSize: 12, padding: "4px 10px" }}
        onClick={() => navigate("/admin/orders")}
      >
        ← Back to Orders
      </button>

      <h1 className="page-title">Order #{order.id}</h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div
          style={{
            backgroundColor: "#111",
            padding: 16,
            borderRadius: 8,
            border: "1px solid #333",
          }}
        >
          <h2 style={{ marginBottom: 8, fontSize: 16 }}>Customer</h2>
          <div style={{ fontSize: 14, color: "#ccc" }}>
            <div>
              <span style={{ color: "#777" }}>Name: </span>
              {order.user ? order.user.name : "Guest"}
            </div>
            <div>
              <span style={{ color: "#777" }}>Email: </span>
              {order.user ? order.user.email : "-"}
            </div>
            {order.address && (
              <div style={{ marginTop: 8 }}>
                <span style={{ color: "#777" }}>Address: </span>
                <div style={{ whiteSpace: "pre-line" }}>
                  {order.address}
                </div>
              </div>
            )}
          </div>
        </div>

        <div
          style={{
            backgroundColor: "#111",
            padding: 16,
            borderRadius: 8,
            border: "1px solid #333",
          }}
        >
          <h2 style={{ marginBottom: 8, fontSize: 16 }}>Order Info</h2>
          <div style={{ fontSize: 14, color: "#ccc" }}>
            <div>
              <span style={{ color: "#777" }}>Placed at: </span>
              {formatDate(order.created_at)}
            </div>
            <div>
              <span style={{ color: "#777" }}>Status: </span>
              {formatStatus(order.status)}
            </div>
            <div>
              <span style={{ color: "#777" }}>Payment: </span>
              {formatPaymentMethod(order.payment_method)}
            </div>
            <div style={{ marginTop: 8 }}>
              <span style={{ color: "#777" }}>Total: </span>
              <strong>${Number(order.total || 0).toFixed(2)}</strong>
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          backgroundColor: "#111",
          padding: 16,
          borderRadius: 8,
          border: "1px solid #333",
        }}
      >
        <h2 style={{ marginBottom: 8, fontSize: 16 }}>Items</h2>

        {items.length === 0 ? (
          <p style={{ fontSize: 14, color: "#aaa" }}>
            No items in this order.
          </p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Image</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Line Total</th>
              </tr>
            </thead>
            <tbody>
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
                  <tr key={item.id}>
                    <td>{product.name || "Product"}</td>
                    <td>
                      {imgUrl ? (
                        <img
                          src={imgUrl}
                          alt={product.name}
                          style={{
                            width: 48,
                            height: 48,
                            objectFit: "cover",
                            borderRadius: 4,
                          }}
                        />
                      ) : (
                        <span style={{ fontSize: 12, color: "#777" }}>
                          No Image
                        </span>
                      )}
                    </td>
                    <td>{item.quantity}</td>
                    <td>${Number(item.unit_price || 0).toFixed(2)}</td>
                    <td>${Number(item.line_total || 0).toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminOrderDetailsPage;
