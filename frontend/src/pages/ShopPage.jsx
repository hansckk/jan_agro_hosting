import React, { useState } from "react";
import Shop from "./Shop";
import Cart from "./Cart";

export default function ShopPage() {
  const [cart, setCart] = useState([]);
  const [produk, setProduk] = useState([]);

  const handleAddToCart = (productId) => {
    const existingItem = cart.find((item) => item.productId === productId);
    if (existingItem) {
      setCart((prev) =>
        prev.map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart((prev) => [...prev, { productId, quantity: 1 }]);
    }
    return "Product added to cart successfully!";
  };

  const handleUpdateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((item) => item.productId !== productId));
    } else {
      setCart((prev) =>
        prev.map((item) =>
          item.productId === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const handleRemove = (productId) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  const handleCheckout = async (checkoutData) => {
    console.log("Checkout data:", checkoutData);
    return { success: true };
  };

  return (
    <div>
      <Shop
        user={{ id: "1", name: "Demo User" }}
        onAddToCart={handleAddToCart}
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        produk={produk}
        setProduk={setProduk} 
      />
      <Cart
        cart={cart}
        produk={produk}
        user={{ id: "1", name: "Demo User" }}
        vouchers={[]}
        onUpdateQuantity={handleUpdateQuantity}
        onRemove={handleRemove}
        onCheckout={handleCheckout}
      />
    </div>
  );
}
