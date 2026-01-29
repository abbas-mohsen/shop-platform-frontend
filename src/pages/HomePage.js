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
    fetch(`${API_BASE}/api/products`)
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
      <section className="hero">
        <div className="hero-content">
          <p className="hero-eyebrow">New Season</p>
          <h1 className="hero-title">
            Sportswear & Footwear for Every Day.
          </h1>
          <p className="hero-text">
            Discover our latest collection of shoes, tops, pants and sets
            designed for training and lifestyle.
          </p>

          <div className="hero-actions">
            <Link to="/products" className="btn-primary">
              Shop now
            </Link>
            <a href="#featured" className="btn-outline">
              View featured
            </a>
          </div>
        </div>

        <div className="hero-logo-wrapper">
    <img src={logo} alt="Brand logo" className="hero-logo" />
  </div>
      </section>
<section className="home-categories">
  <h2 className="section-title">Shop by category</h2>
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
          </div>
        </div>
      </Link>
    ))}
  </div>
</section>

      <section id="featured" className="home-featured">
        <div className="section-header">
          <h2 className="section-title">Featured products</h2>
          <Link to="/products" className="section-link">
            View all
          </Link>
        </div>

        {loading && <p>Loading products...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {!loading && !error && (
          <div className="products-grid">
            {products.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} onQuickAdd={openQuickAdd} />
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
