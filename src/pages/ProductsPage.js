import React, { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import QuickAddModal from "../components/QuickAddModal";
import { useCart } from "../context/CartContext";

const API_BASE =
  process.env.REACT_APP_API_BASE_URL;

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  const { addToCart } = useCart();

  // quick add modal state
  const [quickAddProduct, setQuickAddProduct] = useState(null);
  const [isQuickAddOpen, setIsQuickAddOpen]   = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/api/products`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch products");
        }
        return res.json();
      })
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Error");
        setLoading(false);
      });
  }, []);

  // called when card's "Quick add" is clicked
  const openQuickAdd = (product) => {
    setQuickAddProduct(product);
    setIsQuickAddOpen(true);
  };

  const closeQuickAdd = () => {
    setIsQuickAddOpen(false);
    setQuickAddProduct(null);
  };

  // called from modal when user submits
  const handleQuickAddConfirm = (product, size, quantity) => {
    addToCart(product, size, quantity);
    closeQuickAdd();
  };

  if (loading) return <div>Loading products...</div>;
  if (error)   return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div>
      <h1 className="page-title">All products</h1>

      <div className="products-grid">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onQuickAdd={openQuickAdd}
          />
        ))}
      </div>

      <QuickAddModal
        product={quickAddProduct}
        isOpen={isQuickAddOpen}
        onClose={closeQuickAdd}
        onConfirm={handleQuickAddConfirm}
      />
    </div>
  );
}

export default ProductsPage;
