import React, { createContext, useContext, useEffect, useState } from "react";

const API_BASE = process.env.REACT_APP_API_BASE_URL;

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = typeof window !== "undefined"
    ? localStorage.getItem("auth_token")
    : null;

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    fetch(`${API_BASE}/api/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("unauthenticated");
        return res.json();
      })
      .then((data) => {
        setUser(data);
        setLoading(false);
      })
      .catch(() => {
        localStorage.removeItem("auth_token");
        setUser(null);
        setLoading(false);
      });
  }, [token]);

  const login = async (email, password) => {
    const res = await fetch(`${API_BASE}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || "Login failed");
    }

    const data = await res.json();
    localStorage.setItem("auth_token", data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (payload) => {
    const res = await fetch(`${API_BASE}/api/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || "Register failed");
    }

    const data = await res.json();
    localStorage.setItem("auth_token", data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    try {
      if (token) {
        await fetch(`${API_BASE}/api/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });
      }
    } catch (e) {
  
    }
    localStorage.removeItem("auth_token");
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isLoggedIn: !!user,
    isAdmin: !!user && (user.role === "admin" || user.is_admin === 1),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
