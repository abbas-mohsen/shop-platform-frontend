import React from "react";
import { useCart } from "../context/CartContext";
import { API_BASE, STORAGE_URL } from "../config";


function CartPage() {
  const { items, total, updateItem, removeItem, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div>
        <h1>Your Cart</h1>
        <p>Your cart is empty.</p>
      </div>
    );
  }

  return (
    <div>
      <h1>Your Cart</h1>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: 16,
          marginBottom: 16,
        }}
      >
        <thead>
          <tr style={{ borderBottom: "1px solid #eee" }}>
            <th style={{ textAlign: "left", padding: 8 }}>Product</th>
            <th style={{ textAlign: "left", padding: 8 }}>Size</th>
            <th style={{ textAlign: "right", padding: 8 }}>Price</th>
            <th style={{ textAlign: "center", padding: 8 }}>Qty</th>
            <th style={{ textAlign: "right", padding: 8 }}>Subtotal</th>
            <th style={{ padding: 8 }}></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={`${item.id}-${item.size || "no-size"}`}>
              <td style={{ padding: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {item.image ? (
                    <img
                      src={`${STORAGE_URL}/${item.image}`}
                      alt={item.name}
                      style={{
                        width: 50,
                        height: 50,
                        objectFit: "cover",
                        borderRadius: 6,
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 50,
                        height: 50,
                        borderRadius: 6,
                        background: "#f3f3f3",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 11,
                        color: "#999",
                      }}
                    >
                      No image
                    </div>
                  )}
                  <div>
                    <div style={{ fontWeight: 500 }}>{item.name}</div>
                  </div>
                </div>
              </td>

              <td style={{ padding: 8 }}>
                {item.size ? item.size : "N/A"}
              </td>

              <td style={{ padding: 8, textAlign: "right" }}>
                ${item.price.toFixed(2)}
              </td>

              <td style={{ padding: 8, textAlign: "center" }}>
                <input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) =>
                    updateItem(
                      item.id,
                      item.size || null,
                      Number(e.target.value) || 1
                    )
                  }
                  style={{ width: 70, padding: 4, borderRadius: 6 }}
                />
              </td>

              <td style={{ padding: 8, textAlign: "right" }}>
                ${(item.price * item.quantity).toFixed(2)}
              </td>

              <td style={{ padding: 8, textAlign: "center" }}>
                <button
                  onClick={() => removeItem(item.id, item.size || null)}
                  style={{
                    border: "none",
                    background: "transparent",
                    color: "#dc3545",
                    cursor: "pointer",
                  }}
                >
                  ✕
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 8,
        }}
      >
        <button
          onClick={clearCart}
          style={{
            padding: "6px 12px",
            borderRadius: 999,
            border: "1px solid #ccc",
            background: "#f8f9fa",
            cursor: "pointer",
          }}
        >
          Clear cart
        </button>

        <div style={{ fontSize: 18, fontWeight: "bold" }}>
          Total: ${total.toFixed(2)}
        </div>
      </div>

      {/* Later we’ll hook this to Laravel order API */}
      <div style={{ marginTop: 16 }}>
        <button
          style={{
            padding: "8px 16px",
            borderRadius: 999,
            border: "none",
            background: "#198754",
            color: "#fff",
            cursor: "pointer",
          }}
          onClick={() => alert("Checkout with Laravel API coming soon")}
        >
          Checkout
        </button>
      </div>
    </div>
  );
}

export default CartPage;
