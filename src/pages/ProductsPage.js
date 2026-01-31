// src/pages/ProductsPage.js
import React, { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import QuickAddModal from "../components/QuickAddModal";
import { useCart } from "../context/CartContext";

const API_BASE = process.env.REACT_APP_API_BASE_URL;

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filterCategory, setFilterCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { addToCart } = useCart();
  const [quickAddProduct, setQuickAddProduct] = useState(null);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [prodRes, catRes] = await Promise.all([
          fetch(`${API_BASE}/api/products`, {
            headers: { Accept: "application/json" },
          }),
          fetch(`${API_BASE}/api/categories`, {
            headers: { Accept: "application/json" },
          }),
        ]);

        if (!prodRes.ok) {
          throw new Error("Failed to fetch products");
        }
        if (!catRes.ok) {
          throw new Error("Failed to fetch categories");
        }

        const prodData = await prodRes.json();
        const catData = await catRes.json();

        setProducts(Array.isArray(prodData) ? prodData : prodData.data || []);
        setCategories(Array.isArray(catData) ? catData : catData.data || []);
      } catch (err) {
        console.error(err);
        setError(err.message || "Error loading products.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const openQuickAdd = (product) => {
    setQuickAddProduct(product);
    setIsQuickAddOpen(true);
  };

  const closeQuickAdd = () => {
    setIsQuickAddOpen(false);
    setQuickAddProduct(null);
  };

  const handleQuickAddConfirm = (product, size, quantity) => {
    addToCart(product, size, quantity);
    closeQuickAdd();
  };

  const filteredProducts = products.filter((p) => {
    if (filterCategory === "all") return true;
    const catId = p.category_id ?? p.category?.id;
    return String(catId) === String(filterCategory);
  });

  if (loading) {
    return (
      <div className="products-page">
        <div className="orders-container">
          <p className="orders-loading">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="products-page">
        <div className="orders-container">
          <div className="orders-error-card">
            <p className="orders-error-text">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="products-page">
      <div className="orders-container">
        {/* Header */}
        <div className="orders-header">
          <h1 className="orders-title">All Products</h1>
          <p className="orders-subtitle">
            Browse the full XTREMEFIT collection and find your next fit.
          </p>
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

        {/* Products grid */}
        {filteredProducts.length === 0 ? (
          <div className="orders-empty-card">
            <p>No products in this category yet.</p>
          </div>
        ) : (
          <div className="products-grid">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickAdd={openQuickAdd}
              />
            ))}
          </div>
        )}
      </div>

      {/* Quick Add modal */}
      <QuickAddModal
        product={quickAddProduct}
        isOpen={isQuickAddOpen}
        onClose={closeQuickAdd}
        onConfirm={handleQuickAddConfirm}
      />
    </div>
  );
}

export default ProductsPage;
