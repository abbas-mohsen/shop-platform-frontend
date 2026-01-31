// src/pages/ProductDetailsPage.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

const API_BASE = process.env.REACT_APP_API_BASE_URL;
const STORAGE_URL = process.env.REACT_APP_STORAGE_URL;

function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);

  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/api/products/${id}`, {
          headers: { Accept: "application/json" },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch product");
        }

        const data = await res.json();
        setProduct(data);

        if (Array.isArray(data.sizes) && data.sizes.length > 0) {
          setSelectedSize(data.sizes[0]);
        }
      } catch (err) {
        console.error(err);
        setError(err.message || "Error loading product.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;

    let sizeToUse = null;

    if (Array.isArray(product.sizes) && product.sizes.length > 0) {
      if (!selectedSize) {
        alert("Please choose a size.");
        return;
      }
      sizeToUse = selectedSize;
    }

    addToCart(product, sizeToUse, Number(quantity) || 1);
    navigate("/cart");
  };

  const getImageUrl = () => {
    if (!product || !product.image) return null;
    if (product.image.startsWith("http")) return product.image;
    if (STORAGE_URL) return `${STORAGE_URL}/${product.image}`;
    return `${API_BASE}/storage/${product.image}`;
  };

  const handleQtyChange = (value) => {
    const num = Number(value);
    if (!num || num < 1) {
      setQuantity(1);
    } else {
      setQuantity(num);
    }
  };

  if (loading) {
    return (
      <div className="product-details-page">
        <div className="orders-container">
          <p className="orders-loading">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-details-page">
        <div className="orders-container">
          <div className="orders-error-card">
            <p className="orders-error-text">
              {error || "Product not found."}
            </p>
            <button
              className="btn-outline"
              onClick={() => navigate("/products")}
            >
              Back to products
            </button>
          </div>
        </div>
      </div>
    );
  }

  const imgUrl = getImageUrl();

  return (
    <div className="product-details-page">
      <div className="orders-container">
        <button
          className="back-link"
          onClick={() => navigate("/products")}
        >
          ← Back to products
        </button>

        <div className="product-details-layout">
          {/* Image card */}
          <div className="product-details-card product-details-image-card">
            {imgUrl ? (
              <img
                src={imgUrl}
                alt={product.name}
                className="product-details-image"
              />
            ) : (
              <div className="product-details-image placeholder">
                No image
              </div>
            )}
          </div>

          {/* Info card */}
          <div className="product-details-card product-details-info-card">
            <div className="product-details-meta">
              <span className="product-category">
                {product.category ? product.category.name : "Other"}
              </span>
            </div>

            <h1 className="product-name">{product.name}</h1>

            <div className="product-price">
              ${Number(product.price).toFixed(2)}
            </div>

            <p className="product-description">
              {product.description || "No description available."}
            </p>

            <div className="product-extra">
              {Array.isArray(product.sizes) &&
              product.sizes.length > 0 ? (
                <p>
                  <span className="field-label">
                    Available sizes:
                  </span>{" "}
                  {product.sizes.join(", ")}
                </p>
              ) : (
                <p>
                  <span className="field-label">
                    Available sizes:
                  </span>{" "}
                  N/A
                </p>
              )}
              <p>
                <span className="field-label">In stock:</span>{" "}
                {product.stock ?? 0}
              </p>
            </div>

            {Array.isArray(product.sizes) &&
              product.sizes.length > 0 && (
                <div className="form-field">
                  <label className="form-label">Choose size</label>
                  <select
                    value={selectedSize}
                    onChange={(e) =>
                      setSelectedSize(e.target.value)
                    }
                    className="text-input"
                    style={{ maxWidth: 160 }}
                  >
                    {product.sizes.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>
              )}

            <div className="form-field">
              <label className="form-label">Quantity</label>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => handleQtyChange(e.target.value)}
                className="text-input"
                style={{ maxWidth: 100 }}
              />
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={handleAddToCart}
                className="btn-primary"
              >
                Add to cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailsPage;
