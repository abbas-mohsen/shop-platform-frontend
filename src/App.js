import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Layout/Navbar";
import HomePage from "./pages/HomePage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import CartPage from "./pages/CartPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminProductsPage from "./pages/AdminProductsPage";
import AdminOrdersPage from "./pages/AdminOrdersPage";
import AdminProductFormPage from "./pages/AdminProductFormPage";
import CheckoutPage from "./pages/CheckoutPage";
import MyOrdersPage from "./pages/MyOrdersPage";
import MyOrderDetailsPage from "./pages/MyOrderDetailsPage";
import AdminOrderDetailsPage from "./pages/AdminOrderDetailsPage";

import RequireAuth from "./components/RequireAuth";
import RequireAdmin from "./components/RequireAdmin";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:id" element={<ProductDetailsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Customer-only */}
        <Route
          path="/cart"
          element={
            <RequireAuth>
              <CartPage />
            </RequireAuth>
          }
        />
        <Route
          path="/checkout"
          element={
            <RequireAuth>
              <CheckoutPage />
            </RequireAuth>
          }
        />
        <Route
          path="/my-orders"
          element={
            <RequireAuth>
              <MyOrdersPage />
            </RequireAuth>
          }
        />
        <Route
          path="/my-orders/:id"
          element={
            <RequireAuth>
              <MyOrderDetailsPage />
            </RequireAuth>
          }
        />

        {/* Admin-only */}
        <Route
          path="/admin/products"
          element={
            <RequireAdmin>
              <AdminProductsPage />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/products/new"
          element={
            <RequireAdmin>
              <AdminProductFormPage />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/products/:id/edit"
          element={
            <RequireAdmin>
              <AdminProductFormPage />
            </RequireAdmin>
          }
        />
        <Route
  path="/admin/orders"
  element={
    <RequireAdmin>
      <AdminOrdersPage />
    </RequireAdmin>
  }
/>
<Route
  path="/admin/orders/:id"
  element={
    <RequireAdmin>
      <AdminOrderDetailsPage />
    </RequireAdmin>
  }
/>

      </Routes>
    </>
  );
}

export default App;
