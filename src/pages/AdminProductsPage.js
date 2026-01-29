import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import { Link } from "react-router-dom";

const API_BASE = process.env.REACT_APP_API_BASE_URL;
const STORAGE_URL = process.env.REACT_APP_STORAGE_URL;

function AdminProductsPage() {
  const { isAdmin } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");

  useEffect(() => {
    const token = localStorage.getItem("auth_token");

    fetch(`${API_BASE}/api/products`, {
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load products");
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

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return <div className="home-root">Loading products...</div>;
  }

  if (error) {
    return (
      <div className="home-root" style={{ color: "red" }}>
        {error}
      </div>
    );
  }

  return (
    <div className="home-root">
      <div className="section-header">
        <h1 className="page-title">Manage Products</h1>
        <Link to="/admin/products/new" className="btn-primary">
          + New Product
        </Link>
      </div>

      <div className="table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Sizes</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const sizes = Array.isArray(p.sizes)
                ? p.sizes.join(", ")
                : (p.sizes || "").toString();

              return (
                <tr key={p.id}>
                  <td>
                    {p.image ? (
                      <img
                        src={`${STORAGE_URL}/${p.image}`}
                        alt={p.name}
                        style={{
                          width: 60,
                          height: 60,
                          objectFit: "cover",
                          borderRadius: 8,
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 60,
                          height: 60,
                          borderRadius: 8,
                          background: "#222",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 10,
                          color: "#777",
                        }}
                      >
                        No image
                      </div>
                    )}
                  </td>
                  <td>{p.name}</td>
                  <td>{p.category ? p.category.name : "Other"}</td>
                  <td>${Number(p.price).toFixed(2)}</td>
                  <td>{p.stock}</td>
                  <td style={{ fontSize: 12 }}>{sizes || "N/A"}</td>
                  <td>
                    <Link
                      to={`/admin/products/${p.id}/edit`}
                      className="btn-outline"
                      style={{ fontSize: 12, padding: "4px 10px" }}
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminProductsPage;
