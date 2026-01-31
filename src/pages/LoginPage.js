// src/pages/LoginPage.js
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.message || "Login failed");
    }
  };

  return (
    <div className="auth-page">
      <div className="orders-container">
        <div className="auth-layout">
          {/* Left side: branding / copy */}
          <div className="auth-info">
            <p className="auth-eyebrow">XTREMEFIT · ACCOUNT</p>
            <h1 className="auth-title">Welcome back.</h1>
            <p className="auth-text">
              Sign in to view your orders, manage your cart and keep your
              training essentials in one place.
            </p>
          </div>

          {/* Right side: form */}
          <div className="auth-card">
            <h2 className="auth-card-title">Login</h2>
            <p className="auth-card-subtitle">
              Use the email and password you registered with.
            </p>

            {error && (
              <div className="checkout-alert checkout-alert--error">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-field">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="text-input"
                  required
                />
              </div>

              <div className="form-field">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="text-input"
                  required
                />
              </div>

              <button type="submit" className="btn-primary auth-submit-btn">
                Login
              </button>
            </form>

            <p className="auth-switch">
              Don&apos;t have an account?{" "}
              <Link to="/register" className="auth-link">
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
