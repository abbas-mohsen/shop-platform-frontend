// src/pages/CartPage.js
import React, { useMemo } from "react";
import { useCart } from "../context/CartContext";
import { useNavigate, Link } from "react-router-dom";

const STORAGE_URL = process.env.REACT_APP_STORAGE_URL;

function CartPage() {
  const { cartItems, updateItem, removeFromCart } = useCart();
  const navigate = useNavigate();

  const items = Array.isArray(cartItems) ? cartItems : [];

  const { total, itemsCount, hasMissingSize } = useMemo(() => {
    let sum = 0;
    let count = 0;
    let missingSize = false;

    for (const item of items) {
      const qty = item.quantity || 0;
      count += qty;
      sum += Number(item.price) * qty;

      const availableSizes = Array.isArray(item.product?.sizes)
        ? item.product.sizes
        : Array.isArray(item.sizes)
        ? item.sizes
        : [];

      if (availableSizes.length > 0 && !item.size) {
        missingSize = true;
      }
    }

    return { total: sum, itemsCount: count, hasMissingSize: missingSize };
  }, [items]);

  const handleCheckout = () => {
    if (hasMissingSize) {
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
        <div className="orders-container">
          <div className="cart-header">
            <div>
              <h1 className="orders-title">Your Cart</h1>
              <p className="orders-subtitle">
                Your XTREMEFIT bag is currently empty. Start building your fit.
              </p>
            </div>
          </div>
          <div className="orders-empty-card">
            <p>Browse the collection and add items to see them here.</p>
            <Link to="/products" className="btn-primary" style={{ marginTop: 8 }}>
              Go to products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="orders-container">
        {/* Header */}
        <div className="cart-header">
          <div>
            <h1 className="orders-title">Your Cart</h1>
            <p className="orders-subtitle">
              {itemsCount} item{itemsCount === 1 ? "" : "s"} ready to go.
              Adjust anything before you check out.
            </p>
          </div>
          <Link to="/products" className="cart-continue-link">
            ← Continue shopping
          </Link>
        </div>

        <div className="cart-layout">
          {/* Left: items */}
          <div className="cart-items-card">
            <h2 className="card-title">Items in your bag</h2>
            <div className="card-body">
              <div className="cart-items-list">
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
                      : imgPath && STORAGE_URL
                      ? `${STORAGE_URL}/${imgPath}`
                      : null;

                  const subtotal =
                    Number(item.price) * (Number(item.quantity) || 0);

                  const sizeMissing =
                    availableSizes.length > 0 && !item.size;

                  return (
                    <div
                      key={`${item.id}-${item.size || "no-size"}`}
                      className="cart-item-row"
                    >
                      <div className="cart-item-left">
                        {imgUrl ? (
                          <img
                            src={imgUrl}
                            alt={item.name}
                            className="cart-item-image"
                          />
                        ) : (
                          <div className="cart-item-image placeholder">
                            No image
                          </div>
                        )}

                        <div className="cart-item-main">
                          <div className="cart-item-topline">
                            <div>
                              <div className="cart-item-name">
                                {item.name}
                              </div>
                              {item.product?.category?.name && (
                                <div className="cart-item-category">
                                  {item.product.category.name}
                                </div>
                              )}
                            </div>
                            <button
                              className="cart-remove-btn desktop-only"
                              onClick={() =>
                                removeFromCart(item.id, item.size || null)
                              }
                            >
                              Remove
                            </button>
                          </div>

                          {/* Size + Qty */}
                          <div className="cart-item-controls">
                            <div className="cart-control-block">
                              <span className="cart-control-label">
                                Size
                              </span>
                              {availableSizes.length ? (
                                <select
                                  value={item.size || ""}
                                  onChange={(e) =>
                                    handleSizeChange(
                                      item,
                                      e.target.value || null
                                    )
                                  }
                                  className={
                                    "cart-select" +
                                    (sizeMissing
                                      ? " cart-select--warning"
                                      : "")
                                  }
                                >
                                  <option value="">Select</option>
                                  {availableSizes.map((sizeVal) => (
                                    <option key={sizeVal} value={sizeVal}>
                                      {sizeVal}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <span className="cart-control-pill">
                                  One size
                                </span>
                              )}
                              {sizeMissing && (
                                <span className="cart-size-warning">
                                  Size required
                                </span>
                              )}
                            </div>

                            <div className="cart-control-block">
                              <span className="cart-control-label">
                                Quantity
                              </span>
                              <div className="cart-qty-wrapper">
                                <button
                                  type="button"
                                  className="cart-qty-btn"
                                  onClick={() =>
                                    handleQtyChange(
                                      item,
                                      (item.quantity || 1) - 1
                                    )
                                  }
                                >
                                  −
                                </button>
                                <input
                                  type="number"
                                  min="1"
                                  value={item.quantity || 1}
                                  onChange={(e) =>
                                    handleQtyChange(
                                      item,
                                      e.target.value
                                    )
                                  }
                                  className="cart-qty-input"
                                />
                                <button
                                  type="button"
                                  className="cart-qty-btn"
                                  onClick={() =>
                                    handleQtyChange(
                                      item,
                                      (item.quantity || 1) + 1
                                    )
                                  }
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="cart-item-right">
                        <div className="cart-item-price">
                          ${Number(item.price).toFixed(2)}
                          <span className="cart-item-price-label">
                            / item
                          </span>
                        </div>
                        <div className="cart-item-subtotal">
                          ${subtotal.toFixed(2)}
                        </div>
                        <button
                          className="cart-remove-btn mobile-only"
                          onClick={() =>
                            removeFromCart(item.id, item.size || null)
                          }
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: summary */}
          <div className="cart-summary-card">
            <h2 className="card-title">Summary</h2>
            <div className="card-body">
              <div className="cart-summary-row">
                <span>Items total</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="cart-summary-row">
                <span>Shipping</span>
                <span>Calculated at delivery</span>
              </div>

              <div className="summary-divider" />

              <div className="cart-summary-row cart-summary-total">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>

              {hasMissingSize && (
                <div className="cart-warning-banner">
                  Please select a size for all items before proceeding.
                </div>
              )}

              <button
                className="btn-primary cart-checkout-btn"
                onClick={handleCheckout}
                disabled={hasMissingSize}
              >
                {hasMissingSize
                  ? "Select sizes to continue"
                  : "Proceed to checkout"}
              </button>

              <p className="cart-summary-note">
                You can still adjust everything on the next step.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CartPage;
