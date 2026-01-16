import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import CartPage from "./pages/CartPage";
import { APP_NAME } from "./config";

function App() {
  return (
    <div style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      {/* Navbar */}
      <nav
        style={{
          padding: "12px 24px",
          borderBottom: "1px solid #eee",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <div>
          <Link to="/" style={{ textDecoration: "none", fontWeight: "bold", fontSize: 18 }}>
            {APP_NAME}
          </Link>
        </div>

        <div style={{ display: "flex", gap: 16 }}>
          <Link to="/products" style={{ textDecoration: "none" }}>
            Products
          </Link>
          <Link to="/cart" style={{ textDecoration: "none" }}>
            Cart
          </Link>
        </div>
      </nav>

      {/* Routed content */}
      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px 24px" }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetailsPage />} />
          <Route path="/cart" element={<CartPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
