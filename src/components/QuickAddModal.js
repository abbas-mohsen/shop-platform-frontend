// src/components/QuickAddModal.js
import React, { useEffect, useState } from "react";

const STORAGE_URL = process.env.REACT_APP_STORAGE_URL;

function QuickAddModal({ product, isOpen, onClose, onConfirm }) {
  const [size, setSize] = useState("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (isOpen && product) {
      if (Array.isArray(product.sizes) && product.sizes.length > 0) {
        setSize(product.sizes[0]);
      } else {
        setSize("");
      }
      setQuantity(1);
    }
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  const getImageUrl = () => {
    if (!product?.image) return null;
    if (product.image.startsWith("http")) return product.image;
    if (STORAGE_URL) return `${STORAGE_URL}/${product.image}`;
    return product.image;
  };

  const imgUrl = getImageUrl();

  const handleSubmit = (e) => {
    e.preventDefault();

    const sizeToUse =
      Array.isArray(product.sizes) && product.sizes.length > 0
        ? size
        : null;

    onConfirm(product, sizeToUse, quantity);
  };

  const handleBackdropClick = () => {
    onClose && onClose();
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div
        className="modal quickadd-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="modal-close"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>

        <div className="modal-main">
          {/* Left: image */}
          <div className="modal-image-wrap">
            {imgUrl ? (
              <img
                src={imgUrl}
                alt={product.name}
                className="modal-image"
              />
            ) : (
              <div className="modal-image modal-image--empty">
                No image
              </div>
            )}
          </div>

          {/* Right: info + form */}
          <div className="modal-info">
            <div className="modal-category">
              {product.category ? product.category.name : "Other"}
            </div>
            <h2 className="modal-title">{product.name}</h2>

            <div className="modal-price">
              ${Number(product.price).toFixed(2)}
            </div>

            {product.description && (
              <p className="modal-description">
                {product.description}
              </p>
            )}

            <form onSubmit={handleSubmit} className="modal-form">
              {Array.isArray(product.sizes) &&
                product.sizes.length > 0 && (
                  <div className="modal-row">
                    <label className="modal-label">Size</label>
                    <select
                      className="modal-select"
                      value={size}
                      onChange={(e) => setSize(e.target.value)}
                      required
                    >
                      {product.sizes.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

              <div className="modal-row">
                <label className="modal-label">Quantity</label>
                <input
                  type="number"
                  className="modal-input"
                  min="1"
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(
                      Math.max(1, Number(e.target.value) || 1)
                    )
                  }
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-outline"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Add to cart
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuickAddModal;
