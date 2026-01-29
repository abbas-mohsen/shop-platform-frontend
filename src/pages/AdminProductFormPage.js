// src/pages/AdminProductFormPage.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API_BASE = process.env.REACT_APP_API_BASE_URL; // same style as your other pages

// You can sync these with your backend logic
const CLOTHING_SIZES = ["S", "M", "L", "XL", "XXL"];
const SHOE_SIZES = Array.from({ length: 28 }, (_, i) => String(20 + i)); // "20"–"47"

function AdminProductFormPage() {
  const { id } = useParams(); // if id exists → edit mode
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);    // loading data
  const [saving, setSaving] = useState(false);     // when submitting
  const [error, setError] = useState("");
  const [formErrors, setFormErrors] = useState({});

  const [form, setForm] = useState({
    name: "",
    category_id: "",
    description: "",
    price: "",
    stock: "",
    sizes: [],        // array of selected sizes
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // ---------- helpers ----------

  const findSelectedCategory = () =>
    categories.find((cat) => String(cat.id) === String(form.category_id));

  const isShoesCategory = () => {
    const cat = findSelectedCategory();
    if (!cat) return false;
    const name = (cat.name || "").toLowerCase();
    return name.includes("shoe"); // e.g. "Men Shoes", "Women Shoes"
  };

  // ---------- load categories + product (if edit) ----------

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError("");

        // 1) load categories
        const catRes = await fetch(`${API_BASE}/api/categories`);
        if (!catRes.ok) throw new Error("Failed to load categories");
        const catData = await catRes.json();
        setCategories(catData);

        // 2) if edit → load product
        if (isEditMode) {
          const productRes = await fetch(`${API_BASE}/api/products/${id}`);
          if (!productRes.ok) throw new Error("Failed to load product");
          const product = await productRes.json();

          // sizes can come as array or comma string, normalize to array
          let existingSizes = [];
          if (Array.isArray(product.sizes)) {
            existingSizes = product.sizes;
          } else if (typeof product.sizes === "string") {
            existingSizes = product.sizes
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean);
          }

          setForm({
            name: product.name || "",
            category_id: product.category_id || "",
            description: product.description || "",
            price: product.price || "",
            stock: product.stock || "",
            sizes: existingSizes,
          });

          if (product.image) {
            setImagePreview(`${API_BASE}/storage/${product.image}`); // you can also use STORAGE_URL if you prefer
          }
        }

        setLoading(false);
      } catch (e) {
        console.error(e);
        setError(e.message || "Error loading data");
        setLoading(false);
      }
    }

    loadData();
  }, [API_BASE, id, isEditMode]); // eslint may warn about API_BASE, but it's fine

  // ---------- form handlers ----------

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSizeToggle = (sizeValue) => {
    setForm((prev) => {
      const exists = prev.sizes.includes(sizeValue);
      return {
        ...prev,
        sizes: exists
          ? prev.sizes.filter((s) => s !== sizeValue)
          : [...prev.sizes, sizeValue],
      };
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files && e.target.files[0];
    setImageFile(file || null);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setFormErrors({});

    try {
      const token = localStorage.getItem("auth_token");

      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("category_id", form.category_id);
      formData.append("description", form.description);
      formData.append("price", form.price);
      formData.append("stock", form.stock);

      // sizes[]
      form.sizes.forEach((s) => {
        formData.append("sizes[]", s);
      });

      if (imageFile) {
        formData.append("image", imageFile);
      }

      const url = isEditMode
        ? `${API_BASE}/api/admin/products/${id}`
        : `${API_BASE}/api/admin/products`;

      const method = "POST";

      const res = await fetch(url, {
        method,
        headers: {
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          // don't set Content-Type manually when using FormData
        },
        body: formData,
      });

      if (res.status === 422) {
        const data = await res.json();
        setFormErrors(data.errors || {});
        setError("Please fix the highlighted errors.");
        setSaving(false);
        return;
      }

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to save product");
      }

      // success → go back to admin products list
      navigate("/admin/products");
    } catch (e2) {
      console.error(e2);
      setError(e2.message || "Error while saving");
      setSaving(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="home-root">
        <h1 className="page-title">Manage Products</h1>
        <p style={{ color: "red" }}>You are not allowed to view this page.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="home-root">
        <h1 className="page-title">
          {isEditMode ? "Edit Product" : "Add Product"}
        </h1>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="home-root">
      <div className="section-header">
        <h1 className="page-title">
          {isEditMode ? "Edit Product" : "Add Product"}
        </h1>
        <Link to="/admin/products" className="btn-outline">
          Back to list
        </Link>
      </div>

      {error && (
        <div
          style={{
            marginBottom: 12,
            padding: "8px 10px",
            borderRadius: 8,
            background: "#220000",
            color: "#ffb3b3",
            fontSize: 13,
          }}
        >
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        style={{
          maxWidth: 600,
          background: "#050505",
          padding: 20,
          borderRadius: 16,
          border: "1px solid #222",
        }}
      >
        {/* NAME */}
        <div style={{ marginBottom: 12 }}>
          <label className="form-label">Name</label>
          <input
            type="text"
            name="name"
            className="text-input"
            value={form.name}
            onChange={handleInputChange}
          />
          {formErrors.name && (
            <div className="field-error">{formErrors.name[0]}</div>
          )}
        </div>

        {/* CATEGORY */}
        <div style={{ marginBottom: 12 }}>
          <label className="form-label">Category</label>
          <select
            name="category_id"
            className="text-input"
            value={form.category_id}
            onChange={handleInputChange}
          >
            <option value="">-- Choose category --</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          {formErrors.category_id && (
            <div className="field-error">{formErrors.category_id[0]}</div>
          )}
        </div>

        {/* DESCRIPTION */}
        <div style={{ marginBottom: 12 }}>
          <label className="form-label">Description</label>
          <textarea
            name="description"
            rows={3}
            className="text-input"
            style={{ resize: "vertical" }}
            value={form.description}
            onChange={handleInputChange}
          />
          {formErrors.description && (
            <div className="field-error">{formErrors.description[0]}</div>
          )}
        </div>

        {/* PRICE + STOCK */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
            marginBottom: 12,
          }}
        >
          <div>
            <label className="form-label">Price ($)</label>
            <input
              type="number"
              name="price"
              step="0.01"
              className="text-input"
              value={form.price}
              onChange={handleInputChange}
            />
            {formErrors.price && (
              <div className="field-error">{formErrors.price[0]}</div>
            )}
          </div>

          <div>
            <label className="form-label">Stock</label>
            <input
              type="number"
              name="stock"
              className="text-input"
              value={form.stock}
              onChange={handleInputChange}
            />
            {formErrors.stock && (
              <div className="field-error">{formErrors.stock[0]}</div>
            )}
          </div>
        </div>

        {/* AVAILABLE SIZES */}
        <div style={{ marginBottom: 16 }}>
          <label className="form-label">Available Sizes</label>

          {/* If shoes category → show shoe sizes; else clothing sizes */}
          {isShoesCategory() ? (
            <>
              <div className="size-chip-row">
                {SHOE_SIZES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={
                      form.sizes.includes(s)
                        ? "size-chip size-chip--active"
                        : "size-chip"
                    }
                    onClick={() => handleSizeToggle(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <small className="hint-text">
                Shoes sizes from 20 to 47. Click to toggle.
              </small>
            </>
          ) : (
            <>
              <div className="size-chip-row">
                {CLOTHING_SIZES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={
                      form.sizes.includes(s)
                        ? "size-chip size-chip--active"
                        : "size-chip"
                    }
                    onClick={() => handleSizeToggle(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <small className="hint-text">
                Clothing sizes (tops / pants): S, M, L, XL, XXL.
              </small>
            </>
          )}

          {formErrors["sizes"] && (
            <div className="field-error">{formErrors["sizes"][0]}</div>
          )}
        </div>

        {/* IMAGE */}
        <div style={{ marginBottom: 16 }}>
          <label className="form-label">Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="text-input"
          />
          {formErrors.image && (
            <div className="field-error">{formErrors.image[0]}</div>
          )}

          {imagePreview && (
            <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: 12, marginBottom: 4 }}>Preview:</div>
              <img
                src={imagePreview}
                alt="preview"
                style={{
                  width: 180,
                  height: 180,
                  objectFit: "cover",
                  borderRadius: 12,
                  border: "1px solid #333",
                }}
              />
            </div>
          )}
        </div>

        {/* BUTTONS */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
            marginTop: 10,
          }}
        >
          <Link to="/admin/products" className="btn-outline">
            Cancel
          </Link>
          <button
            type="submit"
            className="btn-primary"
            disabled={saving}
          >
            {saving
              ? isEditMode
                ? "Saving..."
                : "Creating..."
              : isEditMode
              ? "Save changes"
              : "Create product"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AdminProductFormPage;
