// src/pages/AdminProductFormPage.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API_BASE = process.env.REACT_APP_API_BASE_URL;

// You can sync these with your backend logic
const CLOTHING_SIZES = ["S", "M", "L", "XL", "XXL"];
const SHOE_SIZES = Array.from({ length: 28 }, (_, i) => String(20 + i)); // "20"–"47"

function AdminProductFormPage() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formErrors, setFormErrors] = useState({});

  const [form, setForm] = useState({
    name: "",
    category_id: "",
    description: "",
    price: "",
    stock: "",
    sizes: [],
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const findSelectedCategory = () =>
    categories.find((cat) => String(cat.id) === String(form.category_id));

  const isShoesCategory = () => {
    const cat = findSelectedCategory();
    if (!cat) return false;
    const name = (cat.name || "").toLowerCase();
    return name.includes("shoe");
  };

  // --------- LOAD CATEGORIES + PRODUCT ----------
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const catRes = await fetch(`${API_BASE}/api/categories`);
        if (!catRes.ok) throw new Error("Failed to load categories");
        const catData = await catRes.json();
        setCategories(catData);

        if (isEditMode) {
          const productRes = await fetch(`${API_BASE}/api/products/${id}`);
          if (!productRes.ok) throw new Error("Failed to load product");
          const product = await productRes.json();

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
            setImagePreview(`${API_BASE}/storage/${product.image}`);
          }
        }
      } catch (e) {
        console.error(e);
        setError(e.message || "Error loading data");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id, isEditMode]);

  // --------- HANDLERS ----------
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
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
      form.sizes.forEach((s) => formData.append("sizes[]", s));

      if (imageFile) {
        formData.append("image", imageFile);
      }

      const url = isEditMode
        ? `${API_BASE}/api/admin/products/${id}`
        : `${API_BASE}/api/admin/products`;

      const res = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
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

      navigate("/admin/products");
    } catch (e2) {
      console.error(e2);
      setError(e2.message || "Error while saving");
      setSaving(false);
    }
  };

  // --------- RENDER ----------
  if (!isAdmin) {
    return (
      <div className="admin-page-root">
        <div className="admin-container">
          <h1 className="page-title">Manage Products</h1>
          <p style={{ color: "salmon" }}>
            You are not allowed to view this page.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="admin-page-root">
        <div className="admin-container">
          <h1 className="page-title">
            {isEditMode ? "Edit Product" : "Add Product"}
          </h1>
          <p className="orders-loading">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page-root">
      <div className="admin-container">
        <div className="section-header">
          <div>
            <h1 className="page-title">
              {isEditMode ? "Edit Product" : "Add Product"}
            </h1>
            <p className="page-subtitle">
              Set images, sizes, pricing and stock for your catalog items.
            </p>
          </div>
          <Link to="/admin/products" className="btn-outline">
            Back to list
          </Link>
        </div>

        {error && (
          <div className="form-error-banner">{error}</div>
        )}

        <div className="admin-form-layout">
          <form onSubmit={handleSubmit} className="admin-form-card">
            {/* NAME */}
            <div className="form-field">
              <label className="form-label">Name</label>
              <input
                type="text"
                name="name"
                className="text-input"
                value={form.name}
                onChange={handleInputChange}
              />
              {formErrors.name && (
                <div className="field-error">
                  {formErrors.name[0]}
                </div>
              )}
            </div>

            {/* CATEGORY */}
            <div className="form-field">
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
                <div className="field-error">
                  {formErrors.category_id[0]}
                </div>
              )}
            </div>

            {/* DESCRIPTION */}
            <div className="form-field">
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
                <div className="field-error">
                  {formErrors.description[0]}
                </div>
              )}
            </div>

            {/* PRICE + STOCK */}
            <div className="form-row-2">
              <div className="form-field">
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
                  <div className="field-error">
                    {formErrors.price[0]}
                  </div>
                )}
              </div>

              <div className="form-field">
                <label className="form-label">Stock</label>
                <input
                  type="number"
                  name="stock"
                  className="text-input"
                  value={form.stock}
                  onChange={handleInputChange}
                />
                {formErrors.stock && (
                  <div className="field-error">
                    {formErrors.stock[0]}
                  </div>
                )}
              </div>
            </div>

            {/* AVAILABLE SIZES */}
            <div className="form-field">
              <label className="form-label">Available Sizes</label>

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
                    Clothing sizes: S, M, L, XL, XXL. Click to toggle.
                  </small>
                </>
              )}

              {formErrors["sizes"] && (
                <div className="field-error">
                  {formErrors["sizes"][0]}
                </div>
              )}
            </div>

            {/* IMAGE */}
            <div className="form-field">
              <label className="form-label">Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="text-input"
              />
              {formErrors.image && (
                <div className="field-error">
                  {formErrors.image[0]}
                </div>
              )}
            </div>

            {/* BUTTONS */}
            <div className="form-actions">
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

          {/* Preview card */}
          <div className="admin-preview-card">
            <h2 className="card-title">Preview</h2>
            <div className="card-body">
              <div className="admin-preview-image-wrapper">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="preview"
                    className="admin-preview-image"
                  />
                ) : (
                  <div className="admin-preview-image placeholder">
                    No image
                  </div>
                )}
              </div>
              <div className="admin-preview-info">
                <div className="admin-preview-name">
                  {form.name || "Product name"}
                </div>
                <div className="admin-preview-meta">
                  {findSelectedCategory()
                    ? findSelectedCategory().name
                    : "Category"}
                  {" • "}
                  ${form.price || "0.00"}
                </div>
                {form.sizes.length > 0 && (
                  <div className="admin-preview-sizes">
                    Sizes: {form.sizes.join(", ")}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminProductFormPage;
