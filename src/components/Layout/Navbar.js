// src/components/Layout/Navbar.js
import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/logo1.JPG";

const APP_NAME = process.env.REACT_APP_APP_NAME || "XTREMEFIT";

function Navbar() {
  const { items } = useCart();
  const { user, isAdmin, isLoggedIn, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const cartCount = Array.isArray(items)
    ? items.reduce((sum, item) => sum + (item.quantity || 0), 0)
    : 0;

  const handleNavClick = () => {
    setMobileOpen(false);
  };

  const navLinkClass = ({ isActive }) =>
    "nav-link" + (isActive ? " active" : "");

  return (
    <>
      <div className="nav-top-bar">
        XTREMEFIT · NEW SEASON LIVE · BEIRUT
      </div>

      <header className="nav-shell">
        <nav className="nav-main">
          {/* Logo */}
          <Link to="/" className="nav-logo" onClick={handleNavClick}>
            <img src={logo} alt={`${APP_NAME} logo`} className="nav-logo-img" />
            <span className="nav-logo-text">{APP_NAME}</span>
          </Link>

          {/* Burger (mobile) */}
          <button
            className="nav-burger"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label="Toggle navigation"
          >
            <span />
            <span />
          </button>

          {/* Links */}
          <div
            className={
              "nav-links-group" + (mobileOpen ? " nav-links-group--open" : "")
            }
          >
            <div className="nav-links nav-links-primary">
              <NavLink to="/" end className={navLinkClass} onClick={handleNavClick}>
                Home
              </NavLink>
              <NavLink
                to="/products"
                className={navLinkClass}
                onClick={handleNavClick}
              >
                Products
              </NavLink>

              {isLoggedIn && (
                <NavLink
                  to="/my-orders"
                  className={navLinkClass}
                  onClick={handleNavClick}
                >
                  My Orders
                </NavLink>
              )}

              {isAdmin && (
                <>
                  <NavLink
                    to="/admin/products"
                    className={navLinkClass}
                    onClick={handleNavClick}
                  >
                    Manage Products
                  </NavLink>
                  <NavLink
                    to="/admin/orders"
                    className={navLinkClass}
                    onClick={handleNavClick}
                  >
                    Manage Orders
                  </NavLink>
                </>
              )}
            </div>

            <div className="nav-links nav-links-secondary">
              {!isLoggedIn ? (
                <>
                  <NavLink
                    to="/login"
                    className={navLinkClass}
                    onClick={handleNavClick}
                  >
                    Login
                  </NavLink>
                  <NavLink
                    to="/register"
                    className={navLinkClass}
                    onClick={handleNavClick}
                  >
                    Register
                  </NavLink>
                </>
              ) : (
                <>
                  <span className="nav-user-name">
                    Hi, <span>{user.name}</span>
                  </span>
                  <button
                    onClick={() => {
                      logout();
                      setMobileOpen(false);
                    }}
                    className="nav-logout-btn"
                  >
                    Logout
                  </button>
                </>
              )}

              <NavLink
                to="/cart"
                className={navLinkClass}
                onClick={handleNavClick}
              >
                <span className="nav-cart-label">Cart</span>
                <span className="nav-cart-pill">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              </NavLink>
            </div>
          </div>
        </nav>
      </header>
    </>
  );
}

export default Navbar;
