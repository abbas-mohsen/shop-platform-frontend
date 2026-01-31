import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const API_BASE =
  process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000";
const STORAGE_URL = process.env.REACT_APP_STORAGE_URL;

function MyOrderDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

        const res = await fetch(`${API_BASE}/api/my-orders/${id}`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to load order.");
        }

        setOrder(data.order || null);
      } catch (e) {
        console.error(e);
        setError(e.message || "Error loading order.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchOrder();
  }, [id]);

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
      <div className="order-details-page">
        <div className="orders-container">
          <p className="orders-loading">Loading order...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="order-details-page">
        <div className="orders-container">
          <div className="orders-error-card">
            <p className="orders-error-text">
              {error || "Order not found."}
            </p>
            <button
              className="btn-outline"
              onClick={() => navigate("/my-orders")}
            >
              Back to My Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  const items = Array.isArray(order.items) ? order.items : [];

  return (
    <div className="order-details-page">
      <div className="orders-container">
        <button
          className="back-link"
          onClick={() => navigate("/my-orders")}
        >
          ← Back to My Orders
        </button>

        {/* Header */}
        <div className="order-details-header">
          <div>
            <h1 className="orders-title">Order #{order.id}</h1>
            <p className="orders-subtitle">
              Placed on {formatDate(order.created_at)}
            </p>
          </div>
          <div className="order-header-right">
            <span className={getStatusClass(order.status)}>
              {formatStatus(order.status)}
            </span>
            <span className="order-header-items">
              {items.length} item{items.length === 1 ? "" : "s"}
            </span>
          </div>
        </div>

        {/* Info + Summary */}
        <div className="order-info-grid">
          <div className="order-card-block">
            <h2 className="card-title">Order Information</h2>
            <div className="card-body">
              <p>
                <span className="field-label">Date:</span>{" "}
                {formatDate(order.created_at)}
              </p>
              <p>
                <span className="field-label">Status:</span>{" "}
                {formatStatus(order.status)}
              </p>
              <p>
                <span className="field-label">Payment:</span>{" "}
                {formatPayment(order.payment_method)}
              </p>
              {order.address && (
                <div className="field-block">
                  <div className="field-label">Shipping address</div>
                  <div className="field-address">
                    {order.address}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="order-card-block">
            <h2 className="card-title">Summary</h2>
            <div className="card-body">
              <p className="summary-row">
                <span>Items total</span>
                <span>
                  ${Number(order.total || 0).toFixed(2)}
                </span>
              </p>
              <p className="summary-row">
                <span>Shipping</span>
                <span>To be confirmed</span>
              </p>
              <div className="summary-divider" />
              <p className="summary-row summary-row-total">
                <span>Grand Total</span>
                <span>
                  ${Number(order.total || 0).toFixed(2)}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="order-card-block">
          <h2 className="card-title">Items in this Order</h2>
          <div className="card-body">
            {items.length === 0 ? (
              <p className="empty-text">
                No items in this order.
              </p>
            ) : (
              <div className="order-items-list">
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
                      className="order-item-row"
                    >
                      <div className="order-item-left">
                        {imgUrl ? (
                          <img
                            src={imgUrl}
                            alt={product.name}
                            className="order-item-image"
                          />
                        ) : (
                          <div className="order-item-image placeholder">
                            No Image
                          </div>
                        )}
                        <div>
                          <div className="order-item-name">
                            {product.name || "Product"}
                          </div>
                          <div className="order-item-meta">
                            Qty: {item.quantity} • Unit: $
                            {Number(
                              item.unit_price || 0
                            ).toFixed(2)}
                          </div>
                        </div>
                      </div>
                      <div className="order-item-total">
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
    </div>
  );
}

export default MyOrderDetailsPage;
