import React, { createContext, useContext, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const addToCart = (product, size = null, quantity = 1) => {
    const qty = Number(quantity) || 1;

    setCartItems((prev) => {
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

      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: Number(product.price),
          size: size,
          quantity: qty,
          image: product.image,
          product: product, 
        },
      ];
    });
  };

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

  const removeFromCart = (productId, size = null) => {
    setCartItems((prev) =>
      prev.filter(
        (item) => !(item.id === productId && item.size === size)
      )
    );
  };

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


export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used inside a CartProvider");
  }
  return ctx;
}
