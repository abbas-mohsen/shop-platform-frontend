// src/components/Navbar.js
import React from "react";
import { Link } from "react-router-dom";

const APP_NAME = process.env.REACT_APP_APP_NAME;

function Navbar() {
  return (
    <header>
      <div className="nav-top-bar">
        <span>WELCOME TO OUR STORE • NO REFUNDS, EXCHANGES ONLY</span>
      </div>

      <nav className="nav-main">
        <Link to="/" className="nav-logo">
          {APP_NAME}
        </Link>

        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/products">Products</Link>
          <Link to="/cart">Cart</Link>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
