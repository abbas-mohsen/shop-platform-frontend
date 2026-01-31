// src/components/ProductCard.js
import React from "react";
import { Link } from "react-router-dom";

const STORAGE_URL = process.env.REACT_APP_STORAGE_URL;

function ProductCard({ product, onQuickAdd }) {
  const handleQuickAddClick = () => {
    if (onQuickAdd) {
      onQuickAdd(product);
    }
  };

  const getImageUrl = () => {
    if (!product?.image) return null;
    if (product.image.startsWith("http")) return product.image;
    if (STORAGE_URL) return `${STORAGE_URL}/${product.image}`;
    return product.image;
  };

  const imgUrl = getImageUrl();
  const categoryName = product.category ? product.category.name : "Other";
  const sizesText =
    Array.isArray(product.sizes) && product.sizes.length > 0
      ? product.sizes.join(", ")
      : "N/A";

  return (
    <div className="product-card">
      <div className="product-card-inner">
        {/* Image */}
        <div className="product-card-image-wrapper">
          {imgUrl ? (
            <img
              src={imgUrl}
              alt={product.name}
              className="product-card-image"
            />
          ) : (
            <div className="product-card-image product-card-image--empty">
              No image
            </div>
          )}

          <span className="product-card-badge">
            {categoryName}
          </span>
        </div>

        {/* Content */}
        <div className="product-card-body">
          <h3 className="product-card-title">{product.name}</h3>

          <div className="product-card-meta">
            <span className="product-card-price">
              ${Number(product.price).toFixed(2)}
            </span>
            <span className="product-card-sizes">
              Sizes: {sizesText}
            </span>
          </div>

          <div className="product-card-actions">
            <button
              type="button"
              className="btn-primary product-card-btn"
              onClick={handleQuickAddClick}
            >
              Quick add
            </button>

            <Link
              to={`/products/${product.id}`}
              className="btn-outline product-card-btn"
            >
              Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
