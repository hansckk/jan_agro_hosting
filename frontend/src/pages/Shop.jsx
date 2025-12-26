import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchProducts } from "../features/products/productSlice";
import { fetchCart } from "../features/cart/cartSlice";
import {
  Search,
  ShoppingCart,
  AlertCircle,
  CheckCircle,
  Truck,
} from "lucide-react";
import ProductCard from "../components/product/ProductCard";

const Notification = ({ message, type }) => {
  if (!message) return null;
  const isError = type === "error";
  return (
    <div
      className={`fixed top-5 left-1/2 -translate-x-1/2 z-[60] p-4 rounded-md shadow-lg flex items-center gap-3 transition-transform animate-fade-in-down w-[90%] sm:w-auto ${
        isError ? "bg-red-600 text-white" : "bg-green-600 text-white"
      }`}
    >
      {isError ? (
        <AlertCircle size={20} className="shrink-0" />
      ) : (
        <CheckCircle size={20} className="shrink-0" />
      )}
      <span className="text-sm sm:text-base">{message}</span>
    </div>
  );
};

const Shop = ({ user, onAddToCart }) => {
  const dispatch = useDispatch();

  const {
    items: produk,
    status: productStatus,
    error,
  } = useSelector((state) => state.products);

  const { items: cartItems } = useSelector((state) => state.cart);
  const totalCartItems = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (productStatus === "idle") {
      dispatch(fetchProducts());
    }
  }, [productStatus, dispatch]);

  useEffect(() => {
    if (user) {
      dispatch(fetchCart());
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleAddToCartClick = async (productId) => {
    const productToAdd = produk.find((p) => p._id === productId);

    if (productToAdd && productToAdd.stock === 0) {
      setNotification({
        type: "error",
        message: "Produk ini sedang tidak tersedia (Stok Habis).",
      });
      return;
    }

    if (!user) {
      setNotification({
        type: "error",
        message: "Silakan login terlebih dahulu.",
      });
      return;
    }

    const resultMessage = await onAddToCart(productId);

    if (!resultMessage.toLowerCase().includes("gagal")) {
      dispatch(fetchCart());
    }

    const messageType = resultMessage.toLowerCase().includes("gagal")
      ? "error"
      : "success";

    setNotification({ type: messageType, message: resultMessage });
  };

  const filteredProduk = produk.filter((item) => {
    const itemCategory = item.category?.toLowerCase() || "";
    const itemName = item.name?.toLowerCase() || "";
    const search = searchQuery?.toLowerCase() || "";
    const selected = selectedCategory?.toLowerCase() || "all";

    const matchesCategory = selected === "all" || itemCategory === selected;

    const matchesSearch =
      itemName.includes(search) || itemCategory.includes(search);

    return matchesCategory && matchesSearch;
  });

  if (productStatus === "loading" || productStatus === "idle")
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Memuat produk...</p>
      </div>
    );

  if (productStatus === "failed")
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        <p>Gagal memuat produk: {error}</p>
      </div>
    );

  return (
    <>
      <Notification message={notification?.message} type={notification?.type} />

      {/* ICON KERANJANG & BADGE (Responsive Position) */}
      <div className="fixed top-20 sm:top-24 right-2 sm:right-8 z-30 flex flex-col gap-3 sm:gap-4 scale-90 sm:scale-100 origin-right">
        <Link
          to="/cart"
          className="relative bg-white p-3 sm:p-4 rounded-full shadow-lg border transition-transform hover:scale-110"
          aria-label="Buka Keranjang"
        >
          <ShoppingCart size={24} className="text-black" />
          {totalCartItems > 0 && (
            <span className="absolute -top-2 -right-2 w-6 h-6 bg-black text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white animate-bounce-short">
              {totalCartItems}
            </span>
          )}
        </Link>

        {user && (
          <Link
            to="/pesanan"
            className="relative bg-white p-3 sm:p-4 rounded-full shadow-lg border transition-transform hover:scale-110"
            aria-label="Lacak Pesanan"
          >
            <Truck size={24} className="text-black" />
          </Link>
        )}
      </div>

      <div className="min-h-screen bg-gray-50 pt-20 sm:pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-5xl font-light text-black mb-4">
              Jan Agro <span className="font-bold">Shop</span>
            </h1>
            <div className="w-16 sm:w-24 h-[1px] bg-black mx-auto mb-4 sm:mb-6"></div>
            <p className="text-lg sm:text-xl text-gray-600 font-light px-4">
              Find your finest Fertilizers, Tools, and Seeds
            </p>
          </div>

          {/* Search & Filter Section (Stack on mobile) */}
          <div className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:flex-1 md:max-w-md">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Cari produk..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-sm focus:ring-2 focus:ring-black focus:border-transparent transition-all"
              />
            </div>
            {/* Scrollable horizontal category on very small screens */}
            <div className="flex gap-2 sm:gap-3 flex-wrap justify-center w-full md:w-auto">
              {["all", "Fertilizer", "Tools", "Seeds"].map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category.toLowerCase())}
                  className={`px-3 sm:px-4 py-2 text-sm sm:text-base rounded-sm border transition flex-grow sm:flex-grow-0 ${
                    selectedCategory === category.toLowerCase()
                      ? "bg-black text-white border-black"
                      : "bg-white text-gray-700 border-gray-300 hover:border-black"
                  }`}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid (1 col mobile, 2 col tablet, 3 col desktop) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredProduk.map((item) => (
              <ProductCard
                key={item._id}
                item={item}
                onAdd={handleAddToCartClick}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Shop;
