import React, { useEffect, useState } from "react";

const STORAGE_URL =
  process.env.REACT_APP_STORAGE_URL;

function QuickAddModal({ product, isOpen, onClose, onConfirm }) {
  const [size, setSize] = useState("");
  const [quantity, setQuantity] = useState(1);

  // Reset fields whenever we open on a new product
  useEffect(() => {
    if (isOpen && product) {
      if (Array.isArray(product.sizes) && product.sizes.length > 0) {
        setSize(product.sizes[0]); // default first size
      } else {
        setSize("");
      }
      setQuantity(1);
    }
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    const sizeToUse =
      Array.isArray(product.sizes) && product.sizes.length > 0
        ? size
        : null;

    onConfirm(product, sizeToUse, quantity);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="modal-close"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>

        <div className="modal-main">
          {/* LEFT: image */}
          <div className="modal-image-wrap">
            {product.image ? (
              <img
                src={`${STORAGE_URL}/${product.image}`}
                alt={product.name}
                className="modal-image"
              />
            ) : (
              <div className="modal-image modal-image--empty">No image</div>
            )}
          </div>

          {/* RIGHT: full info */}
          <div className="modal-info">
            <h2 className="modal-title">{product.name}</h2>

            {product.category && (
              <div className="modal-category">
                {product.category.name}
              </div>
            )}

            <div className="modal-price">
              ${Number(product.price).toFixed(2)}
            </div>

            {product.description && (
              <p className="modal-description">{product.description}</p>
            )}

            <form onSubmit={handleSubmit}>
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
                    setQuantity(Math.max(1, Number(e.target.value) || 1))
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
