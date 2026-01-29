import React from "react";
import { Link } from "react-router-dom";

const STORAGE_URL =
  process.env.REACT_APP_STORAGE_URL;

function ProductCard({ product, onQuickAdd }) {
  const handleQuickAddClick = () => {
    if (onQuickAdd) {
      onQuickAdd(product);
    }
  };

  return (
    <div className="product-card">
      {product.image ? (
        <img
          src={`${STORAGE_URL}/${product.image}`}
          alt={product.name}
          className="product-card-image"
        />
      ) : (
        <div className="product-card-image product-card-image--empty">
          No image
        </div>
      )}

      <div className="product-card-body">
        <div className="product-card-category">
          {product.category ? product.category.name : "Other"}
        </div>

        <h3 className="product-card-title">{product.name}</h3>

        <div className="product-card-price">
          ${Number(product.price).toFixed(2)}
        </div>

        <div className="product-card-sizes">
          Sizes:{" "}
          {Array.isArray(product.sizes) && product.sizes.length > 0
            ? product.sizes.join(", ")
            : "N/A"}
        </div>

        <div className="product-card-actions">
          <button
            type="button"
            className="btn-primary"
            onClick={handleQuickAddClick}
          >
            Quick add
          </button>

          <Link to={`/products/${product.id}`} className="btn-outline">
            Details
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
