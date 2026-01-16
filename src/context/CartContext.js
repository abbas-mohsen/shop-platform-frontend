// src/context/CartContext.js
import React, { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    // Load from localStorage if available
    try {
      const stored = localStorage.getItem("cart");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Persist cart in localStorage
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);

  const addToCart = (product, size = null, quantity = 1) => {
    setItems((prev) => {
      // Check if same product+size already in cart
      const index = prev.findIndex(
        (item) => item.id === product.id && item.size === size
      );

      if (index !== -1) {
        const clone = [...prev];
        clone[index] = {
          ...clone[index],
          quantity: clone[index].quantity + quantity,
        };
        return clone;
      }

      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: Number(product.price),
          image: product.image,
          size,
          quantity,
        },
      ];
    });
  };

  const updateItem = (productId, size, newQuantity) => {
    setItems((prev) =>
      prev
        .map((item) =>
          item.id === productId && item.size === size
            ? { ...item, quantity: newQuantity }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (productId, size) => {
    setItems((prev) =>
      prev.filter(
        (item) => !(item.id === productId && item.size === size)
      )
    );
  };

  const clearCart = () => setItems([]);

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{ items, addToCart, updateItem, removeItem, clearCart, total }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
