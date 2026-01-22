import React, { createContext, useContext, useState } from "react";

// Create context
const CartContext = createContext(null);

// Provider
export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);

  // Add to cart: product + size + quantity
  const addToCart = (product, size = null, quantity = 1) => {
    const qty = Number(quantity) || 1;

    setCartItems((prev) => {
      // same product + same size => increase quantity
      const index = prev.findIndex(
        (item) => item.id === product.id && item.size === size
      );

      if (index !== -1) {
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          quantity: updated[index].quantity + qty,
        };
        return updated;
      }

      // otherwise add new item
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: Number(product.price),
          size: size,
          quantity: qty,
          image: product.image,
          product: product, // keep full object if needed
        },
      ];
    });
  };

  // Update an item (for CartPage)
  const updateItem = (productId, size = null, quantity = 1) => {
    const qty = Number(quantity) || 1;

    setCartItems((prev) =>
      prev.map((item) =>
        item.id === productId && item.size === size
          ? { ...item, quantity: qty }
          : item
      )
    );
  };

  // Remove item completely
  const removeFromCart = (productId, size = null) => {
    setCartItems((prev) =>
      prev.filter(
        (item) => !(item.id === productId && item.size === size)
      )
    );
  };

  // Clear everything (if you ever need it)
  const clearCart = () => setCartItems([]);

  const value = {
    cartItems,
    addToCart,
    updateItem,
    removeFromCart,
    clearCart,
  };

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
}

// Hook
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used inside a CartProvider");
  }
  return ctx;
}
