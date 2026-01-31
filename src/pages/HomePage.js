// src/pages/HomePage.js
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import QuickAddModal from "../components/QuickAddModal";
import { useCart } from "../context/CartContext";
import logo from "../assets/logo1.JPG";
import womenImg from "../assets/categories/women.jpg";
import menImg from "../assets/categories/men.jpg";
import footwearImg from "../assets/categories/footwear.webp";

const API_BASE = process.env.REACT_APP_API_BASE_URL;

const categories = [
  { key: "men", label: "Men", image: menImg },
  { key: "women", label: "Women", image: womenImg },
  { key: "footwear", label: "Footwear", image: footwearImg },
];

function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  const { addToCart } = useCart();
  const [quickAddProduct, setQuickAddProduct] = useState(null);
  const [isQuickAddOpen, setIsQuickAddOpen]   = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/api/products`, {
      headers: { Accept: "application/json" },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load products");
        return res.json();
      })
      .then((data) => {
        setProducts(Array.isArray(data) ? data : data.data || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Error");
        setLoading(false);
      });
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

  return (
    <div className="home-root">
      {/* HERO */}
      <section className="hero hero--home">
        <div className="hero-inner">
          <div className="hero-content">
            <p className="hero-eyebrow">XTREMEFIT · NEW SEASON</p>
            <h1 className="hero-title">
              Sportswear built for training
              <br />
              and everyday movement.
            </h1>
            <p className="hero-text">
              Fresh drops for men and women – tops, pants, sets and footwear
              designed to keep up with every session, on and off the court.
            </p>

            <div className="hero-actions">
              <Link to="/products" className="btn-primary hero-main-cta">
                Shop collection
              </Link>
              <a href="#featured" className="btn-outline hero-secondary-cta">
                View featured
              </a>
            </div>

            <div className="hero-tags">
              <span className="hero-tag">Men</span>
              <span className="hero-tag">Women</span>
              <span className="hero-tag">Footwear</span>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-logo-card">
              <img src={logo} alt="Brand logo" className="hero-logo" />
            </div>
            <div className="hero-metrics">
              <div className="hero-metric">
                <span className="hero-metric-label">Season</span>
                <span className="hero-metric-value">’26</span>
              </div>
              <div className="hero-metric">
                <span className="hero-metric-label">Styles</span>
                <span className="hero-metric-value">Men · Women</span>
              </div>
              <div className="hero-metric">
                <span className="hero-metric-label">Category</span>
                <span className="hero-metric-value">Performance</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="home-section home-categories">
        <div className="home-section-header">
          <h2 className="section-title">Shop by category</h2>
          <p className="section-subtitle">
            Jump straight into what you need – curated looks for every lane.
          </p>
        </div>

        <div className="category-grid">
          {categories.map((cat) => (
            <Link
              key={cat.key}
              to={`/products?category=${cat.key}`}
              className="category-tile"
            >
              <div className="category-image-wrapper">
                <img
                  src={cat.image}
                  alt={cat.label}
                  className="category-image"
                />
                <div className="category-overlay">
                  <span className="category-label">{cat.label}</span>
                  <span className="category-cta">Explore</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED */}
      <section id="featured" className="home-section home-featured">
        <div className="section-header">
          <div>
            <h2 className="section-title">Featured products</h2>
            <p className="section-subtitle">
              A quick look at what’s trending right now.
            </p>
          </div>
          <Link to="/products" className="section-link">
            View all
          </Link>
        </div>

        {loading && (
          <div className="orders-empty-card">
            <p>Loading products...</p>
          </div>
        )}
        {error && (
          <div className="orders-error-card">
            <p className="orders-error-text">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <div className="products-grid">
            {products.slice(0, 8).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickAdd={openQuickAdd}
              />
            ))}
          </div>
        )}
      </section>

      <QuickAddModal
        product={quickAddProduct}
        isOpen={isQuickAddOpen}
        onClose={closeQuickAdd}
        onConfirm={handleQuickAddConfirm}
      />
    </div>
  );
}

export default HomePage;
