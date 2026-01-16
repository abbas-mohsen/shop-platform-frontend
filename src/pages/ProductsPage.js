import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

const API_BASE = process.env.REACT_APP_API_BASE_URL;
const STORAGE_URL = process.env.REACT_APP_STORAGE_URL;

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  const { addToCart } = useCart(); // 👈

  useEffect(() => {
    fetch(`${API_BASE}/api/products`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch products");
        }
        return res.json();
      })
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Error");
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading products...</div>;
  if (error)   return <div style={{ color: "red" }}>{error}</div>;

  const handleQuickAdd = (product) => {
    // Choose first available size if exists, otherwise null
    let chosenSize = null;
    if (Array.isArray(product.sizes) && product.sizes.length > 0) {
      chosenSize = product.sizes[0];
    }
    addToCart(product, chosenSize, 1);
  };

  return (
    <div>
      <h1>Products</h1>

      <div
        style={{
          marginTop: 16,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: 16,
        }}
      >
        {products.map((product) => (
          <div
            key={product.id}
            style={{
              border: "1px solid #eee",
              borderRadius: 12,
              padding: 12,
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }}
          >
            {product.image ? (
              <img
                src={`${STORAGE_URL}/${product.image}`}
                alt={product.name}
                style={{
                  width: "100%",
                  height: 150,
                  objectFit: "cover",
                  borderRadius: 8,
                  marginBottom: 8,
                }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: 150,
                  background: "#f3f3f3",
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#999",
                  marginBottom: 8,
                }}
              >
                No image
              </div>
            )}

            <div style={{ fontSize: 13, color: "#666", marginBottom: 4 }}>
              {product.category ? product.category.name : "Other"}
            </div>

            <h3 style={{ fontSize: 16, margin: "0 0 4px" }}>{product.name}</h3>

            <div style={{ fontWeight: "bold", marginBottom: 4 }}>
              ${Number(product.price).toFixed(2)}
            </div>

            <div style={{ fontSize: 12, color: "#555", marginBottom: 8 }}>
              Sizes:{" "}
              {Array.isArray(product.sizes) && product.sizes.length > 0
                ? product.sizes.join(", ")
                : "N/A"}
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => handleQuickAdd(product)}
                style={{
                  flex: 1,
                  padding: "6px 10px",
                  borderRadius: 999,
                  border: "none",
                  background: "#0d6efd",
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: 13,
                }}
              >
                Quick add
              </button>

              <Link
                to={`/products/${product.id}`}
                style={{
                  flex: 1,
                  textAlign: "center",
                  padding: "6px 10px",
                  borderRadius: 999,
                  border: "1px solid #0d6efd",
                  color: "#0d6efd",
                  textDecoration: "none",
                  fontSize: 13,
                }}
              >
                Details
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductsPage;
