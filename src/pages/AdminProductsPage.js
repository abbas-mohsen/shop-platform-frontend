import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API_BASE = process.env.REACT_APP_API_BASE_URL;

function AdminProductsPage() {
  const { user, fetchWithAuth } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --------- LOAD PRODUCTS ----------
  useEffect(() => {
    let isMounted = true;

    async function loadProducts() {
      try {
        // Not logged in
        if (!user) {
          setError("You must be logged in as admin to view this page.");
          return;
        }

        // Logged in but not admin
        if (user.role !== "admin") {
          setError("Only admins can access this page.");
          return;
        }

        const res = await fetchWithAuth(`${API_BASE}/api/admin/products`, {
          headers: { Accept: "application/json" },
        });

        if (!res.ok) {
          // 401 = not authenticated, 403 = not admin
          if (res.status === 401) {
            setError("Session expired. Please log in again.");
          } else if (res.status === 403) {
            setError("Only admins can access this page.");
          } else {
            let data = null;
            try {
              data = await res.json();
            } catch (e) {}
            setError(data?.message || "Failed to load products.");
          }
          return;
        }

        const data = await res.json();
        if (!isMounted) return;

        // If you return a resource collection from Laravel the data might be in data.data
        setProducts(Array.isArray(data) ? data : data.data || []);
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

    loadProducts();

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
        } catch (e) {}
        alert(data?.message || "Failed to delete product.");
        return;
      }

      // Remove from local list
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Delete product error:", err);
      alert(err.message || "Error deleting product.");
    }
  };

  // --------- RENDER ----------
  if (loading) {
    return (
      <div className="page-root">
        <h1 className="page-title">Manage Products</h1>
        <p>Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-root">
        <h1 className="page-title">Manage Products</h1>
        <p style={{ color: "salmon" }}>{error}</p>
      </div>
    );
  }

  return (
    <div className="page-root">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <h1 className="page-title">Manage Products</h1>
        <button
          className="btn-primary"
          onClick={() => navigate("/admin/products/new")}
        >
          + Add Product
        </button>
      </div>

      {products.length === 0 ? (
        <p>No products found.</p>
      ) : (
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
            {products.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>
                  {p.image ? (
                    <img
                      src={`${process.env.REACT_APP_STORAGE_URL}/${p.image}`}
                      alt={p.name}
                      style={{
                        width: 50,
                        height: 50,
                        objectFit: "cover",
                        borderRadius: 6,
                      }}
                    />
                  ) : (
                    "-"
                  )}
                </td>
                <td>{p.name}</td>
                <td>{p.category ? p.category.name : "-"}</td>
                <td>${Number(p.price).toFixed(2)}</td>
                <td>{p.stock}</td>
                <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                  <Link
                    to={`/admin/products/${p.id}/edit`}
                    className="btn-outline"
                    style={{ marginRight: 8, padding: "4px 10px" }}
                  >
                    Edit
                  </Link>
                  <button
                    className="btn-outline"
                    style={{
                      padding: "4px 10px",
                      borderColor: "#dc3545",
                      color: "#dc3545",
                    }}
                    onClick={() => handleDelete(p.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AdminProductsPage;
