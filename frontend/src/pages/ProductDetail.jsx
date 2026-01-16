import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  Star,
  ArrowLeft,
  ShoppingCart,
  AlertCircle,
  CheckCircle,
  Truck,
  PlayCircle,
} from "lucide-react";

const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.MODE === "production"
    ? "/api"
    : "http://localhost:3000/api");

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

const StarRating = ({ rating }) => (
  <div className="flex items-center">
    {[...Array(5)].map((_, index) => (
      <Star
        key={index}
        size={16}
        className={
          index < rating ? "text-yellow-400 fill-current" : "text-gray-300"
        }
      />
    ))}
  </div>
);

const ProductDetail = ({ product, users, user, onAddToCart, cartCount }) => {
  const [ratingFilter, setRatingFilter] = useState(0);
  const [mediaFilter, setMediaFilter] = useState("all");
  const [notification, setNotification] = useState(null);

  const [reviewsList, setReviewsList] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!product?._id) return;
      try {
        const response = await axios.get(
          `${API_URL}/reviews/product/${product._id}`
        );
        if (response.data.success) {
          setReviewsList(response.data.data);
        }
      } catch (error) {
        console.error("Gagal mengambil review:", error);
      } finally {
        setLoadingReviews(false);
      }
    };

    fetchReviews();
  }, [product]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleAddToCartClick = async (productId) => {
    if (product.stock === 0) {
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
    const messageType = resultMessage.toLowerCase().includes("gagal")
      ? "error"
      : "success";
    setNotification({ type: messageType, message: resultMessage });
  };

  const filteredReviews = reviewsList
    .filter((r) => ratingFilter === 0 || r.rating === ratingFilter)
    .filter(
      (r) =>
        mediaFilter === "all" ||
        (mediaFilter === "dengan-media" && r.media && r.media.length > 0) ||
        (mediaFilter === "tanpa-media" && (!r.media || r.media.length === 0))
    );

  return (
    <>
      <Notification message={notification?.message} type={notification?.type} />

      {/* Fixed Icons Responsive */}
      <div className="fixed top-20 sm:top-24 right-2 sm:right-8 z-30 flex flex-col gap-3 sm:gap-4 scale-90 sm:scale-100 origin-right">
        <Link
          to="/cart"
          className="relative bg-white p-3 sm:p-4 rounded-full shadow-lg border transition-transform hover:scale-110"
        >
          <ShoppingCart size={24} className="text-black" />
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 w-6 h-6 bg-black text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white">
              {cartCount}
            </span>
          )}
        </Link>
        {user && (
          <Link
            to="/pesanan"
            className="relative bg-white p-3 sm:p-4 rounded-full shadow-lg border transition-transform hover:scale-110"
          >
            <Truck size={24} className="text-black" />
          </Link>
        )}
      </div>

      <div className="min-h-screen bg-white pt-20 sm:pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <Link
            to="/shop"
            className="flex items-center gap-2 text-gray-600 hover:text-black mb-6 sm:mb-8 transition"
          >
            <ArrowLeft size={20} /> Kembali ke Toko
          </Link>

          {/* Main Layout: Stack on mobile, Grid on large screens */}
          <div className="flex flex-col lg:grid lg:grid-cols-5 gap-8 lg:gap-12">
            {/* Image Section */}
            <div className="lg:col-span-2 flex items-center justify-center bg-gray-100 rounded-sm h-64 sm:h-96 lg:h-96 overflow-hidden border shrink-0">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-6xl sm:text-8xl">🪴</span>
              )}
            </div>

            {/* Details Section */}
            <div className="lg:col-span-3 flex flex-col">
              <span className="text-xs sm:text-sm uppercase text-gray-500 tracking-wider">
                {product.category}
              </span>
              <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 my-2">
                {product.name}
              </h1>
              <p className="text-2xl sm:text-3xl font-light text-gray-800 mb-4">
                Rp {product.price.toLocaleString("id-ID")}
              </p>
              <p className="text-gray-600 mb-6 leading-relaxed text-sm sm:text-base">
                {product.detail}
              </p>

              {product.stock > 0 && product.stock <= 10 && (
                <p className="text-sm mb-6 font-semibold text-yellow-600">
                  Stok Terbatas: Hanya tersisa {product.stock}!
                </p>
              )}

              <button
                onClick={() => handleAddToCartClick(product._id)}
                disabled={product.stock === 0}
                className="w-full bg-black text-white py-3 sm:py-4 px-4 rounded-sm transition-all duration-300 hover:bg-gray-800 text-sm font-medium uppercase tracking-wide disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {product.stock > 0 ? "Tambah ke Keranjang" : "Stok Habis"}
              </button>
            </div>
          </div>

          <div className="mt-12 sm:mt-16 border-t pt-8 sm:pt-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Ulasan Produk ({reviewsList.length})
            </h2>

            {/* Filter Section Responsive */}
            <div className="flex flex-col md:flex-row gap-4 mb-8 p-4 border rounded-sm">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">
                  Filter Berdasarkan Rating
                </label>
                <div className="flex gap-2 flex-wrap">
                  {[0, 5, 4, 3, 2, 1].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRatingFilter(star)}
                      className={`px-3 py-2 text-xs sm:text-sm rounded-sm border transition ${
                        ratingFilter === star
                          ? "bg-black text-white border-black"
                          : "bg-white text-gray-700 border-gray-300 hover:border-black"
                      }`}
                    >
                      {star === 0 ? "Semua" : `★ ${star}`}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">
                  Filter Berdasarkan Media
                </label>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setMediaFilter("all")}
                    className={`px-3 py-2 text-xs sm:text-sm rounded-sm border transition ${
                      mediaFilter === "all"
                        ? "bg-black text-white border-black"
                        : "bg-white text-gray-700 border-gray-300 hover:border-black"
                    }`}
                  >
                    Semua
                  </button>
                  <button
                    onClick={() => setMediaFilter("dengan-media")}
                    className={`px-3 py-2 text-xs sm:text-sm rounded-sm border transition ${
                      mediaFilter === "dengan-media"
                        ? "bg-black text-white border-black"
                        : "bg-white text-gray-700 border-gray-300 hover:border-black"
                    }`}
                  >
                    Foto/Video
                  </button>
                </div>
              </div>
            </div>

            {loadingReviews ? (
              <p>Memuat ulasan...</p>
            ) : filteredReviews.length > 0 ? (
              <div className="space-y-6 sm:space-y-8">
                {filteredReviews.map((review) => (
                  <div
                    key={review._id}
                    className="flex flex-col sm:flex-row gap-4 border-b pb-8 last:border-b-0"
                  >
                    <div className="flex items-center gap-3 sm:block">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center font-bold text-gray-500 overflow-hidden border">
                        {review.userAvatar ? (
                          <img
                            src={review.userAvatar}
                            alt="avatar"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          review.userName.charAt(0).toUpperCase()
                        )}
                      </div>
                      {/* Name showing next to avatar on mobile */}
                      <div className="sm:hidden">
                        <p className="font-semibold text-gray-900 text-sm">
                          {review.userName}
                        </p>
                        <StarRating rating={review.rating} />
                      </div>
                    </div>

                    <div className="flex-1">
                      {/* Name header for desktop */}
                      <div className="hidden sm:flex items-center justify-between mb-2">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {review.userName}
                          </p>
                          <StarRating rating={review.rating} />
                        </div>
                        <p className="text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString(
                            "id-ID",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </p>
                      </div>

                      {/* Date for mobile */}
                      <p className="text-xs text-gray-500 sm:hidden mb-2">
                        {new Date(review.createdAt).toLocaleDateString(
                          "id-ID",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </p>

                      <p className="text-gray-700 mt-2 mb-4 leading-relaxed text-sm sm:text-base">
                        {review.comment}
                      </p>

                      {review.media && review.media.length > 0 && (
                        <div className="flex gap-3 overflow-x-auto pb-2">
                          {review.media.map((item, idx) => (
                            <div
                              key={idx}
                              className="relative w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 bg-black rounded-md overflow-hidden border"
                            >
                              {item.type === "video" ? (
                                <div className="relative w-full h-full group">
                                  <video
                                    src={item.url}
                                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition"
                                    controls
                                  />
                                  <div className="absolute top-2 right-2 text-white pointer-events-none">
                                    <PlayCircle
                                      size={20}
                                      className="drop-shadow-md"
                                    />
                                  </div>
                                </div>
                              ) : (
                                <a
                                  href={item.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <img
                                    src={item.url}
                                    alt={`Review media ${idx}`}
                                    className="w-full h-full object-cover hover:scale-105 transition-transform cursor-zoom-in"
                                  />
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 bg-gray-50 p-6 rounded-sm text-center">
                Belum ada ulasan atau tidak ada yang cocok dengan filter.
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetail;
