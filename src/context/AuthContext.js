import React, { createContext, useContext, useEffect, useState } from "react";

const API_BASE = process.env.REACT_APP_API_BASE_URL;

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // store token in state so it’s reactive
  const [token, setToken] = useState(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("auth_token");
  });

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ---- Load current user when we have a token ----
  useEffect(() => {
    // no token -> guest
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    setLoading(true);

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
        // token invalid -> clear it
        localStorage.removeItem("auth_token");
        setToken(null);
        setUser(null);
        setLoading(false);
      });
  }, [token]);

  // ---- Helper: fetch with Authorization header ----
  const fetchWithAuth = (url, options = {}) => {
    const baseHeaders = options.headers || {};

    const headers = {
      ...baseHeaders,
      Accept: baseHeaders.Accept || "application/json",
    };

    // Only set JSON content-type if body is not FormData and caller didn't override
    if (
      options.body &&
      !(options.body instanceof FormData) &&
      !baseHeaders["Content-Type"]
    ) {
      headers["Content-Type"] = "application/json";
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return fetch(url, {
      ...options,
      headers,
    });
  };

  // ---- Auth actions ----
  const login = async (email, password) => {
    const res = await fetch(`${API_BASE}/api/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || "Login failed");
    }

    const data = await res.json();
    localStorage.setItem("auth_token", data.token);
    setToken(data.token);        // <— important
    setUser(data.user);
    return data.user;
  };

  const register = async (payload) => {
    const res = await fetch(`${API_BASE}/api/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || "Register failed");
    }

    const data = await res.json();
    localStorage.setItem("auth_token", data.token);
    setToken(data.token);        // <— important
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
      // ignore errors on logout
    }

    localStorage.removeItem("auth_token");
    setToken(null);
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

    // expose helper so admin pages can use it
    fetchWithAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
