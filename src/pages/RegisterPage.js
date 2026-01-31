// src/pages/RegisterPage.js
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [role, setRole] = useState("customer");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== password2) {
      setError("Passwords do not match");
      return;
    }

    try {
      await register({
        name,
        email,
        password,
        password_confirmation: password2,
        role,
      });
      navigate("/");
    } catch (err) {
      setError(err.message || "Register failed");
    }
  };

  return (
    <div className="auth-page">
      <div className="orders-container">
        <div className="auth-layout">
          {/* Left side: branding / copy */}
          <div className="auth-info">
            <p className="auth-eyebrow">XTREMEFIT · NEW ACCOUNT</p>
            <h1 className="auth-title">Create your training profile.</h1>
            <p className="auth-text">
              Save your details once and check out faster. Track your orders,
              manage your cart and stay ready for every drop.
            </p>
          </div>

          {/* Right side: form */}
          <div className="auth-card">
            <h2 className="auth-card-title">Register</h2>
            <p className="auth-card-subtitle">
              Join XTREMEFIT as a customer or admin.
            </p>

            {error && (
              <div className="checkout-alert checkout-alert--error">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-field">
                <label className="form-label">Name</label>
                <input
                  className="text-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-field">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="text-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-row-2">
                <div className="form-field">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    className="text-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="form-field">
                  <label className="form-label">Confirm Password</label>
                  <input
                    type="password"
                    className="text-input"
                    value={password2}
                    onChange={(e) => setPassword2(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-field">
                <label className="form-label">Register as</label>
                <select
                  className="text-input"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="customer">Customer</option>
                  <option value="admin">Admin</option>
                </select>
                <p className="hint-text">
                  Admin accounts can manage products and orders.
                </p>
              </div>

              <button type="submit" className="btn-primary auth-submit-btn">
                Create account
              </button>
            </form>

            <p className="auth-switch">
              Already have an account?{" "}
              <Link to="/login" className="auth-link">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
