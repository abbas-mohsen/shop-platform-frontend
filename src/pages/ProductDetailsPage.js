import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useCart } from "../context/CartContext";

const API_BASE = process.env.REACT_APP_API_BASE_URL;
const STORAGE_URL = process.env.REACT_APP_STORAGE_URL;

function ProductDetailsPage() {
  const { id } = useParams();
  const [product, setProduct]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);

  const { addToCart } = useCart();

  useEffect(() => {
    fetch(`${API_BASE}/api/products/${id}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch product");
        }
        return res.json();
      })
      .then((data) => {
        setProduct(data);
        setLoading(false);

        if (Array.isArray(data.sizes) && data.sizes.length > 0) {
          setSelectedSize(data.sizes[0]);
        }
      })
      .catch((err) => {
        setError(err.message || "Error");
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div>Loading product...</div>;
  if (error)   return <div style={{ color: "red" }}>{error}</div>;
  if (!product) return <div>Product not found</div>;

  const handleAddToCart = () => {
    let sizeToUse = null;

    if (Array.isArray(product.sizes) && product.sizes.length > 0) {
      if (!selectedSize) {
        alert("Please choose a size.");
        return;
      }
      sizeToUse = selectedSize;
    }

    addToCart(product, sizeToUse, Number(quantity) || 1);
    alert("Added to cart!");
  };

  return (
    <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
      <div style={{ flex: "0 0 320px" }}>
        {product.image ? (
          <img
            src={`${STORAGE_URL}/${product.image}`}
            alt={product.name}
            style={{
              width: "100%",
              maxWidth: 400,
              height: "auto",
              borderRadius: 12,
              objectFit: "cover",
            }}
          />
        ) : (
          <div
            style={{
              width: 320,
              height: 320,
              background: "#f3f3f3",
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#999",
            }}
          >
            No image
          </div>
        )}
      </div>

      <div style={{ flex: "1 1 300px" }}>
        <div style={{ fontSize: 14, color: "#666", marginBottom: 4 }}>
          {product.category ? product.category.name : "Other"}
        </div>

        <h1 style={{ marginTop: 0 }}>{product.name}</h1>
        <div style={{ fontWeight: "bold", fontSize: 20, marginBottom: 8 }}>
          ${Number(product.price).toFixed(2)}
        </div>

        <p style={{ marginBottom: 12 }}>
          {product.description || "No description."}
        </p>

        <div style={{ marginBottom: 16, fontSize: 14 }}>
          <strong>Available sizes: </strong>
          {Array.isArray(product.sizes) && product.sizes.length > 0
            ? product.sizes.join(", ")
            : "N/A"}
        </div>
        {Array.isArray(product.sizes) && product.sizes.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: "block", marginBottom: 4 }}>
              Choose size:
            </label>
            <select
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              style={{ padding: 6, borderRadius: 6, minWidth: 120 }}
            >
              {product.sizes.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        )}

        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "block", marginBottom: 4 }}>
            Quantity:
          </label>
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            style={{ width: 80, padding: 4, borderRadius: 6 }}
          />
        </div>

        <button
          onClick={handleAddToCart}
          style={{
            padding: "8px 16px",
            borderRadius: 999,
            border: "none",
            background: "#0d6efd",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Add to cart
        </button>
      </div>
    </div>
  );
}

export default ProductDetailsPage;
