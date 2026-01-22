import React from "react";
import { Link, NavLink } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";

const APP_NAME = process.env.REACT_APP_APP_NAME;

function Navbar() {
  const { items } = useCart();
  const { user, isAdmin, isLoggedIn, logout } = useAuth();

  const cartCount =
    Array.isArray(items) ? items.reduce((sum, item) => sum + item.quantity, 0) : 0;

  return (
    <>
      <div className="nav-top-bar">
        FREE SHIPPING ON SELECTED ITEMS
      </div>

      <nav className="nav-main">
        <Link to="/" className="nav-logo">
          {APP_NAME}
        </Link>

        <div className="nav-links">
          <NavLink to="/" end>
            Home
          </NavLink>
          <NavLink to="/products">Products</NavLink>
          {isLoggedIn && (
            <NavLink to="/orders" style={{ marginLeft: 20 }}>
              My Orders
            </NavLink>
          )}
          {isAdmin && (
            <>
              <a href="http://127.0.0.1:8000/admin/products" style={{ marginLeft: 20 }}>
                Manage Products
              </a>
              <a href="http://127.0.0.1:8000/admin/orders" style={{ marginLeft: 20 }}>
                Manage Orders
              </a>
            </>
          )}
        </div>

        <div className="nav-links">
          {!isLoggedIn ? (
            <>
              <NavLink to="/login">Login</NavLink>
              <NavLink to="/register" style={{ marginLeft: 16 }}>
                Register
              </NavLink>
            </>
          ) : (
            <>
              <span style={{ marginRight: 16 }}>
                Hi, {user.name}
              </span>
              <button
                onClick={logout}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#fff",
                  cursor: "pointer",
                  marginRight: 16,
                }}
              >
                Logout
              </button>
            </>
          )}

          <NavLink to="/cart" style={{ marginLeft: 16 }}>
            Cart ({cartCount})
          </NavLink>
        </div>
      </nav>
    </>
  );
}

export default Navbar;
