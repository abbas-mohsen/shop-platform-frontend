import React from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

const STORAGE_URL =
  process.env.REACT_APP_STORAGE_URL;

function CartPage() {
  const { cartItems, updateItem, removeFromCart } = useCart();
  const navigate = useNavigate(); 

  const items = Array.isArray(cartItems) ? cartItems : [];

  const total = items.reduce(
    (sum, item) => sum + Number(item.price) * (item.quantity || 0),
    0
  );

  const handleCheckout = () => {
     const missingSize = items.some((item) => {
      const availableSizes = Array.isArray(item.product?.sizes)
        ? item.product.sizes
        : Array.isArray(item.sizes)
        ? item.sizes
        : [];

      return availableSizes.length > 0 && !item.size;
    });

    if (missingSize) {
      alert("Please choose a size for all products before checkout.");
      return;
    }

    navigate("/checkout");
  };

  const handleQtyChange = (item, value) => {
    const qty = Math.max(1, Number(value) || 1);
    updateItem(item.id, item.size || null, qty);
  };

  const handleSizeChange = (item, newSize) => {
    updateItem(item.id, newSize || null, item.quantity || 1);
  };

  if (!items.length) {
    return (
      <div className="cart-page">
        <h1 className="page-title">Your Cart</h1>
        <p>Your cart is empty.</p>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1 className="page-title">Your Cart</h1>

      <div className="cart-table-wrapper">
        <table className="cart-table">
          <thead>
            <tr>
              <th className="cart-col-product">Product</th>
              <th className="cart-col-size">Size</th>
              <th className="cart-col-price">Price</th>
              <th className="cart-col-qty">Qty</th>
              <th className="cart-col-subtotal">Subtotal</th>
              <th className="cart-col-actions" />
            </tr>
          </thead>

          <tbody>
            {items.map((item) => {
              const availableSizes = Array.isArray(item.product?.sizes)
                ? item.product.sizes
                : Array.isArray(item.sizes)
                ? item.sizes
                : [];

              const imgPath = item.image || item.product?.image || null;
              const imgUrl =
                imgPath && imgPath.startsWith("http")
                  ? imgPath
                  : imgPath
                  ? `${STORAGE_URL}/${imgPath}`
                  : null;

              const subtotal =
                Number(item.price) * (Number(item.quantity) || 0);

              return (
                <tr key={`${item.id}-${item.size || "no-size"}`}>
                  <td className="cart-cell-product">
                    <div className="cart-product">
                      {imgUrl ? (
                        <img
                          src={imgUrl}
                          alt={item.name}
                          className="cart-product-thumb"
                        />
                      ) : (
                        <div className="cart-product-thumb cart-product-thumb--empty">
                          No image
                        </div>
                      )}
                      <div className="cart-product-info">
                        <div className="cart-product-name">{item.name}</div>
                        {item.product?.category?.name && (
                          <div className="cart-product-category">
                            {item.product.category.name}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="cart-cell-size">
                    {availableSizes.length ? (
                      <select
                        value={item.size || ""}
                        onChange={(e) =>
                          handleSizeChange(item, e.target.value || null)
                        }
                        className="cart-select"
                      >
                        <option value="">Select</option>
                        {availableSizes.map((sizeVal) => (
                          <option key={sizeVal} value={sizeVal}>
                            {sizeVal}
                          </option>
                        ))}
                      </select>
                    ) : (
                      "N/A"
                    )}
                  </td>
                  <td className="cart-cell-price">
                    ${Number(item.price).toFixed(2)}
                  </td>
                  <td className="cart-cell-qty">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity || 1}
                      onChange={(e) => handleQtyChange(item, e.target.value)}
                      className="cart-qty-input"
                    />
                  </td>
                  <td className="cart-cell-subtotal">
                    ${subtotal.toFixed(2)}
                  </td>
                  <td className="cart-cell-actions">
                    <button
                      className="btn-remove"
                      onClick={() => removeFromCart(item.id, item.size || null)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="cart-total-row">
        <span>Total:</span>
        <span>${total.toFixed(2)}</span>
      </div>
      <div className="cart-actions-row">
      <button className="btn-primary" onClick={handleCheckout}>
        Checkout
      </button>
    </div>
  </div>
  );
}

export default CartPage;
