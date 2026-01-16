import React from "react";
import { Link } from "react-router-dom";
import { APP_NAME } from "../config";

function HomePage() {
  return (
    <div>
      <h1>Welcome to {APP_NAME}</h1>
      <p style={{ maxWidth: 480 }}>
        Browse products, choose your size, add to cart and place an order. This
        React frontend talks to the Laravel API.
      </p>

      <Link
        to="/products"
        style={{
          display: "inline-block",
          padding: "8px 16px",
          borderRadius: 999,
          background: "#0d6efd",
          color: "#fff",
          textDecoration: "none",
          marginTop: 12,
        }}
      >
        Start shopping
      </Link>
    </div>
  );
}

export default HomePage;
