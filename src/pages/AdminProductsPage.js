// src/pages/AdminProductsPage.js
import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API_BASE = process.env.REACT_APP_API_BASE_URL;
const STORAGE_URL = process.env.REACT_APP_STORAGE_URL;

function AdminProductsPage() {
  const { user, fetchWithAuth } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filterCategory, setFilterCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --------- LOAD PRODUCTS + CATEGORIES ----------
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        if (!user) {
          setError("You must be logged in as admin to view this page.");
          return;
        }

        if (user.role !== "admin") {
          setError("Only admins can access this page.");
          return;
        }

        // categories (public) + products (admin)
        const [catRes, prodRes] = await Promise.all([
          fetch(`${API_BASE}/api/categories`, {
            headers: { Accept: "application/json" },
          }),
          fetchWithAuth(`${API_BASE}/api/admin/products`, {
            headers: { Accept: "application/json" },
          }),
        ]);

        if (!catRes.ok) {
          throw new Error("Failed to load categories.");
        }
        if (!prodRes.ok) {
          if (prodRes.status === 401) {
            throw new Error("Session expired. Please log in again.");
          } else if (prodRes.status === 403) {
            throw new Error("Only admins can access this page.");
          } else {
            let data = null;
            try {
              data = await prodRes.json();
            } catch (_) {}
            throw new Error(data?.message || "Failed to load products.");
          }
        }

        const catData = await catRes.json();
        const prodData = await prodRes.json();

        if (!isMounted) return;

        setCategories(Array.isArray(catData) ? catData : catData.data || []);
        setProducts(
          Array.isArray(prodData) ? prodData : prodData.data || []
        );
      } catch (err) {
        if (isMounted) {
          console.error("Admin products error:", err);
          setError(err.message || "Error while loading products.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [user, fetchWithAuth]);

  // --------- DELETE ----------
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      const res = await fetchWithAuth(`${API_BASE}/api/admin/products/${id}`, {
        method: "DELETE",
        headers: { Accept: "application/json" },
      });

      if (!res.ok) {
        let data = null;
        try {
          data = await res.json();
        } catch (_) {}
        alert(data?.message || "Failed to delete product.");
        return;
      }

      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Delete product error:", err);
      alert(err.message || "Error deleting product.");
    }
  };

  // --------- FILTERED LIST ----------
  const filteredProducts = products.filter((p) => {
    if (filterCategory === "all") return true;
    return String(p.category_id) === String(filterCategory);
  });

  // --------- RENDER ----------
  if (loading) {
    return (
      <div className="admin-page-root">
        <div className="admin-container">
          <h1 className="page-title">Manage Products</h1>
          <p className="orders-loading">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-page-root">
        <div className="admin-container">
          <h1 className="page-title">Manage Products</h1>
          <div className="orders-error-card">
            <p className="orders-error-text">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page-root">
      <div className="admin-container">
        {/* Header */}
        <div className="section-header">
          <div>
            <h1 className="page-title">Manage Products</h1>
            <p className="page-subtitle">
              Create, edit and remove products from your XTREMEFIT catalog.
            </p>
          </div>
          <button
            className="btn-primary"
            onClick={() => navigate("/admin/products/new")}
          >
            + Add Product
          </button>
        </div>

        {/* Category filters */}
        <div className="orders-filters products-filters">
          <button
            type="button"
            className={
              "filter-chip" +
              (filterCategory === "all" ? " active" : "")
            }
            onClick={() => setFilterCategory("all")}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={
                "filter-chip" +
                (String(filterCategory) === String(cat.id)
                  ? " active"
                  : "")
              }
              onClick={() => setFilterCategory(String(cat.id))}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Table / empty state */}
        {filteredProducts.length === 0 ? (
          <div className="orders-empty-card">
            <p>No products for this category.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td>
                      {p.image ? (
                        <img
                          src={
                            STORAGE_URL
                              ? `${STORAGE_URL}/${p.image}`
                              : `${process.env.REACT_APP_STORAGE_URL}/${p.image}`
                          }
                          alt={p.name}
                          className="admin-product-thumb"
                        />
                      ) : (
                        <span className="admin-product-noimg">–</span>
                      )}
                    </td>
                    <td>{p.name}</td>
                    <td>{p.category ? p.category.name : "-"}</td>
                    <td>${Number(p.price).toFixed(2)}</td>
                    <td>{p.stock}</td>
                    <td
                      style={{
                        textAlign: "right",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <Link
                        to={`/admin/products/${p.id}/edit`}
                        className="btn-outline"
                        style={{ marginRight: 8, padding: "4px 10px" }}
                      >
                        Edit
                      </Link>
                      <button
                        className="btn-outline btn-danger-outline"
                        onClick={() => handleDelete(p.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminProductsPage;
