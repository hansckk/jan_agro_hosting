import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Navbar from "./components/Navbar";
import ProfileSlide from "./components/ProfileSlide";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import About from "./pages/About";
import Admin from "./pages/Admin";
import Ceo from "./pages/Ceo";
import Location from "./pages/Location";
import Profile from "./pages/Profile";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Pesanan from "./pages/Pesanan";
import Review from "./pages/Review";
import Invoice from "./pages/Invoice";
import LaporanPesananAdmin from "./admin/laporanAdmin/LaporanPesananAdmin";
import LaporanStokAdmin from "./admin/laporanAdmin/LaporanStokAdmin";
import LaporanMovementAdmin from "./admin/laporanAdmin/LaporanMovementAdmin";
import LaporanPesananCeo from "./ceo/laporanCeo/LaporanPesananCeo";
import LaporanUserBaruCeo from "./ceo/laporanCeo/LaporanUserBaruCeo";
import LaporanUserSetiaCeo from "./ceo/laporanCeo/LaporanUserSetiaCeo";
import LaporanBarangTerlakuCeo from "./ceo/laporanCeo/LaporanBarangTerlakuCeo";
import LaporanVoucherCeo from "./ceo/laporanCeo/LaporanVoucherCeo";
import LaporanStokCeo from "./ceo/laporanCeo/LaporanStokCeo";
import LaporanMovementCeo from "./ceo/laporanCeo/LaporanMovementCeo";
import LaporanRevenueCeo from "./ceo/laporanCeo/LaporanRevenueCeo";
import LaporanMetodePembayaranCeo from "./ceo/laporanCeo/LaporanMetodePembayaranCeo";
import PengembalianBarang from "./pages/PengembalianBarang";
import "./index.css";
import axios from "axios";

import {
  fetchProducts,
  addProduct,
  updateProduct,
  deleteProduct,
} from "./features/products/productSlice";
import { setCredentials } from "./features/user/userSlice";

function App() {
  const [showProfile, setShowProfile] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isPemilik, setIsPemilik] = useState(false);
  const [cart, setCart] = useState([]);
  const [checkouts, setCheckouts] = useState([]);
  const totalCartQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);

  const API_URL =
    import.meta.env.VITE_API_URL ||
    (import.meta.env.MODE === "production"
      ? "/api"
      : "http://localhost:3000/api");

  const navigate = useNavigate();

  const dispatch = useDispatch();
  const { items: produk, status: productStatus } = useSelector(
    (state) => state.products
  );
  const { user, token, isAuthenticated } = useSelector((state) => state.users);

  useEffect(() => {
    const bootstrapSession = async () => {
      const storedToken = localStorage.getItem("token");
      if (storedToken && !token) {
        try {
          const response = await fetch(`${API_URL}/auth/profile`, {
            headers: { Authorization: `Bearer ${storedToken}` },
          });

          if (response.ok) {
            const data = await response.json();
            // Ini adalah langkah paling penting:
            // Mengisi kembali state Redux dengan data user dan token dari localStorage.
            dispatch(setCredentials({ user: data.user, token: storedToken }));
          } else {
            // Jika token tidak valid (misalnya kedaluwarsa), hapus dari localStorage.
            localStorage.removeItem("token");
          }
        } catch (error) {
          console.error("Gagal memuat sesi:", error);
          localStorage.removeItem("token");
        }
      }
    };

    bootstrapSession();

    if (productStatus === "idle") {
      dispatch(fetchProducts());
    }
  }, [dispatch, API_URL, productStatus, token]);

  useEffect(() => {
    if (user && user.role) {
      const role = user.role.toLowerCase();
      setIsAdmin(role === "admin");
      setIsPemilik(role === "owner" || role === "pemilik");
    } else {
      setIsAdmin(false);
      setIsPemilik(false);
    }
  }, [user]);
  // You would also add functions here to fetch reviews, checkouts, etc.

  const [users, setUsers] = useState([]);

  const [adminUser, setAdminUser] = useState({
    id: 99,
    username: "admin",
    name: "Admin",
    email: "admin@gmail.com",
    password: "admin",
    joinDate: "2022",
    avatar: null,
    isBanned: false,
    noTelp: "81111111111",
    alamat: "Kantor Pusat JanAgro, Jl. Teknologi No. 10, Surabaya",
  });
  const [vouchers, setVouchers] = useState([
    {
      id: 1,
      code: "HEMAT10",
      discountPercentage: 10,
      maxUses: 100,
      currentUses: 25,
      isActive: true,
    },
    {
      id: 2,
      code: "JANAGRO50",
      discountPercentage: 50,
      maxUses: 20,
      currentUses: 19,
      isActive: true,
    },
  ]);
  const [reviews, setReviews] = useState([
    {
      id: 101,
      productId: 1,
      userId: 1,
      rating: 5,
      comment:
        "Pupuk terbaik! Tanaman saya tumbuh subur. Ini hasilnya setelah 2 minggu pemakaian.",
      date: "2025-10-01",
      imageUrl:
        "https://via.placeholder.com/400x300.png/A7D379/000000?text=Hasil+Panen",
    },
    {
      id: 102,
      productId: 3,
      userId: 2,
      rating: 4,
      comment:
        "Bibitnya tumbuh dengan baik, meskipun beberapa tidak berkecambah. Hasil tomatnya manis dan lezat.",
      date: "2025-09-28",
      imageUrl: null,
    },
  ]);

  const [returns, setReturns] = useState([
    {
      id: 1,
      orderId: 1005,
      reason:
        "Barang yang diterima tidak sesuai dengan deskripsi, gagangnya terasa ringkih.",
      videos: ["dummy_video_1.mp4"],
      photos: [
        "dummy_photo_1.jpg",
        "dummy_photo_2.jpg",
        "dummy_photo_3.jpg",
        "dummy_photo_4.jpg",
        "dummy_photo_5.jpg",
        "dummy_photo_6.jpg",
      ],
    },
  ]);
  const [cancellations, setCancellations] = useState([
    {
      id: 1,
      orderId: 1003,
      reason: "Saya salah memasukkan alamat pengiriman.",
    },
    { id: 2, orderId: 1006, reason: "Tidak sengaja melakukan pemesanan." },
  ]);

  const handleAddToCart = async (productId) => {
    if (!productId) {
      console.error("handleAddToCart dipanggil dengan productId kosong");
      return;
    }

    try {
      console.log(
        "Mencoba menambahkan ke keranjang dengan URL:",
        `${API_URL}/api/cart`
      );
      const response = await axios.post(
        `${API_URL}/cart/add`,
        { productId: productId, quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setCart(response.data.data.items);
        return "Produk berhasil ditambahkan ke keranjang!";
      } else {
        return response.data.message || "Gagal menambahkan produk.";
      }
    } catch (error) {
      console.error(
        "Gagal menambahkan ke keranjang:",
        error.response?.data?.message || error.message
      );
      return (
        error.response?.data?.message ||
        "Gagal menambahkan produk ke keranjang."
      );
    }
  };

  useEffect(() => {
    const fetchCart = async () => {
      if (user && token) {
        // Gunakan token dari Redux
        try {
          const response = await axios.get(`${API_URL}/cart`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (response.data.success) {
            setCart(response.data.data.items || []);
          }
        } catch (error) {
          console.error(
            "Gagal mengambil data keranjang (fetchCart):",
            error.response || error.message
          );
          setCart([]);
        }
      } else {
        setCart([]);
      }
    };
    fetchCart();
  }, [user, token, API_URL]);

  const handleUpdateCartQuantity = async (productId, newQuantity) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      if (newQuantity <= 0) {
        await handleRemoveFromCart(productId);
        return;
      }
      const response = await axios.put(
        `${API_URL}/cart/update-quantity`,
        { productId, quantity: newQuantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        setCart(response.data.data.items);
      }
    } catch (error) {
      console.error(
        "Gagal update kuantitas:",
        error.response?.data?.message || error.message
      );
    }
  };

  const handleRemoveFromCart = async (productId) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await axios.delete(
        `${API_URL}/cart/remove/${productId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        setCart(response.data.data.items);
      }
    } catch (error) {
      console.error(
        "Gagal menghapus item:",
        error.response?.data?.message || error.message
      );
    }
  };

  useEffect(() => {
    const fetchCheckouts = async () => {
      const token = localStorage.getItem("token");
      if (user && token) {
        try {
          const response = await axios.get(`${API_URL}/checkouts`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (response.data.success) {
            setCheckouts(response.data.data);
          }
        } catch (error) {
          console.error("Gagal mengambil data pesanan:", error);
        }
      } else {
        setCheckouts([]);
      }
    };

    fetchCheckouts();
  }, [user, token, API_URL]);

  const handleCheckout = async (checkoutData) => {
    // TOKEN
    if (!isAuthenticated || !token) {
      alert("Silakan login untuk menambahkan produk ke keranjang.");
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) {
      return { success: false, message: "Autentikasi gagal." };
    }
    try {
      const response = await axios.post(
        `${API_URL}/checkouts/create`,
        checkoutData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setCart([]);
        fetchVouchers();
        setCheckouts((prevCheckouts) => [response.data.data, ...prevCheckouts]);

        navigate("/pesanan");
        return { success: true, message: "Checkout berhasil! Terima kasih." };
      }
    } catch (error) {
      console.error("Gagal checkout:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Gagal memproses pesanan.",
      };
    }
  };

  const handleRequestReturn = (returnData) => {
    setReturns([...returns, { ...returnData, id: Date.now() }]);
    setCheckouts(
      checkouts.map((order) =>
        order.id === returnData.orderId
          ? { ...order, status: "pengembalian" }
          : order
      )
    );
    navigate("/pesanan");
  };

  const handleAddReview = (reviewData) => {
    if (!user) return;
    const newReview = {
      ...reviewData,
      id: Date.now(),
      userId: user.id,
      date: new Date().toISOString().split("T")[0],
    };
    setReviews([...reviews, newReview]);
    navigate("/pesanan");
  };

  const handleAvatarChange = (newAvatarUrl) => {
    if (!user) return;
    const updatedUser = { ...user, avatar: newAvatarUrl };
    setUser(updatedUser);
    if (updatedUser.id === adminUser.id) {
      setAdminUser(updatedUser);
    } else {
      setUsers((prev) =>
        prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
      );
    }
  };
  const handleProfileSave = async (userId, payload) => {
    if (!token) {
      // Ambil token dari Redux
      return {
        success: false,
        message: "Autentikasi gagal. Token tidak tersedia.",
      };
    }
    try {
      const response = await axios.put(
        `${API_URL}/users/update-profile/${userId}`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.data.success) {
        // Hapus setUser, cukup dispatch ke Redux
        dispatch(setCredentials({ user: response.data.user, token }));
        return { success: true, message: "Profil berhasil diperbarui!" };
      }
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Terjadi kesalahan pada server.",
      };
    }
  };

  const handlePasswordChange = (currentPassword, newPassword) => {
    if (!user) return { success: false, message: "No user logged in." };
    if (user.password !== currentPassword)
      return { success: false, message: "Current password incorrect." };
    const updatedUser = { ...user, password: newPassword };
    setUser(updatedUser);
    if (updatedUser.id === adminUser.id) {
      setAdminUser(updatedUser);
    } else {
      setUsers((prev) =>
        prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
      );
    }
    return { success: true, message: "Password updated successfully!" };
  };
  const handleUpdateUserByAdmin = (userId, updatedData) =>
    setUsers(
      users.map((u) => (u.id === userId ? { ...u, ...updatedData } : u))
    );
  const handleDeleteUserByAdmin = (userId) =>
    setUsers(users.filter((u) => u.id !== userId));
  const handleToggleBanUser = (userId) =>
    setUsers(
      users.map((u) => (u.id === userId ? { ...u, isBanned: !u.isBanned } : u))
    );

  const handleConfirmOrderFinished = (orderId) => {
    setCheckouts(
      checkouts.map((order) =>
        order.id === orderId ? { ...order, status: "selesai" } : order
      )
    );
  };
  const handleApproveReturn = (orderId) => {
    setCheckouts(
      checkouts.map((order) =>
        order.id === orderId
          ? { ...order, status: "pengembalian berhasil" }
          : order
      )
    );
  };
  const handleRejectReturn = (orderId) => {
    setCheckouts(
      checkouts.map((order) =>
        order.id === orderId
          ? { ...order, status: "pengembalian ditolak" }
          : order
      )
    );
  };
  const handleRequestCancellation = (orderId, reason) => {
    setCancellations([...cancellations, { id: Date.now(), orderId, reason }]);
    setCheckouts(
      checkouts.map((o) =>
        o.id === orderId ? { ...o, status: "pembatalan diajukan" } : o
      )
    );
  };
  const handleApproveCancellation = (orderId) => {
    setCheckouts(
      checkouts.map((o) =>
        o.id === orderId ? { ...o, status: "dibatalkan" } : o
      )
    );
  };
  const handleRejectCancellation = (orderId) => {
    setCheckouts(
      checkouts.map((o) =>
        o.id === orderId ? { ...o, status: "diproses" } : o
      )
    );
  };
  const handleUpdateOrderStatus = (orderId, newStatus) => {
    setCheckouts(
      checkouts.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };

  const handleAddProduk = (newData) => {
    dispatch(addProduct(newData));
  };

  const handleUpdateProduk = (produkId, updatedData) => {
    dispatch(updateProduct({ id: produkId, productData: updatedData }));
  };

  const handleDeleteProduk = (produkId) => {
    dispatch(deleteProduct(produkId));
  };

  const fetchVouchers = async () => {
    try {
      const response = await fetch(`${API_URL}/vouchers/get-all-vouchers`);
      if (response.ok) {
        const result = await response.json();
        setVouchers(result.data || []);
      } else {
        console.error("Gagal mengambil data voucher");
      }
    } catch (error) {
      console.error("Error saat mengambil data voucher:", error);
    }
  };

  const handleAddVoucher = async (voucherData) => {
    try {
      const response = await fetch(`${API_URL}/vouchers/add-voucher`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(voucherData),
      });
      const result = await response.json();
      if (response.ok) {
        setVouchers([result.data, ...vouchers]);
        alert(result.message);
      } else {
        alert(result.message || "Gagal menambahkan voucher.");
      }
    } catch (error) {
      alert("Terjadi kesalahan pada server.");
    }
  };

  const handleUpdateVoucher = async (voucherId, updatedData) => {
    try {
      const response = await fetch(
        `${API_URL}/vouchers/update-voucher/${voucherId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedData),
        }
      );
      const result = await response.json();
      if (response.ok) {
        setVouchers(
          vouchers.map((v) => (v._id === voucherId ? result.data : v))
        );
        alert(result.message);
      } else {
        alert(result.message || "Gagal memperbarui voucher.");
      }
    } catch (error) {
      alert("Terjadi kesalahan pada server.");
    }
  };

  const handleDeleteVoucher = async (voucherId) => {
    try {
      const response = await fetch(
        `${API_URL}/vouchers/delete-voucher/${voucherId}`,
        {
          method: "DELETE",
        }
      );
      const result = await response.json();
      if (response.ok) {
        setVouchers(vouchers.filter((v) => v._id !== voucherId));
        alert(result.message);
      } else {
        alert(result.message || "Gagal menghapus voucher.");
      }
    } catch (error) {
      alert("Terjadi kesalahan pada server.");
    }
  };

  useEffect(() => {
    fetchVouchers();
    fetchProducts();
  }, []);

  const handleAvatarUpdateSuccess = (updatedUser) => {
    // Dispatch ke Redux untuk memperbarui state user di seluruh aplikasi
    dispatch(setCredentials({ user: updatedUser, token: token }));
  };
  return (
    <div className="min-h-screen bg-white">
      <Navbar
        setShowProfile={setShowProfile}
        user={user}
        isAdmin={isAdmin}
        isPemilik={isPemilik}
      />
      <main>
        <Routes>
          <Route path="/" element={<Home API_URL={API_URL} />} />
          <Route
            path="/shop"
            element={
              <Shop
                produk={produk}
                user={user}
                onAddToCart={handleAddToCart}
                cartCount={cart.length}
                API_URL={API_URL}
              />
            }
          />
          <Route
            path="/product/:id"
            element={
              <ProductDetailWrapper
                produk={produk}
                reviews={reviews}
                user={user}
                onAddToCart={handleAddToCart}
                cartCount={cart.length}
                API_URL={API_URL}
              />
            }
          />
          <Route
            path="/cart"
            element={
              <Cart
                cart={cart}
                produk={produk}
                user={user}
                vouchers={vouchers}
                onUpdateQuantity={handleUpdateCartQuantity}
                onRemove={handleRemoveFromCart}
                onCheckout={handleCheckout}
                API_URL={API_URL}
              />
            }
          />
          <Route
            path="/pesanan"
            element={
              <Pesanan
                checkouts={checkouts}
                user={user}
                reviews={reviews}
                API_URL={API_URL}
              />
            }
          />
          <Route path="/review/:productId" element={<ReviewWrapper />} />
          <Route
            path="/pengembalian-barang/:orderId"
            element={
              <PengembalianBarangWrapper
                checkouts={checkouts}
                API_URL={API_URL}
              />
            }
          />
          <Route path="/about" element={<About />} />
          <Route path="/location" element={<Location />} />
          <Route
            path="/profile"
            element={
              user ? (
                <Profile
                  user={user}
                  onProfileSave={handleProfileSave}
                  onAvatarUpdateSuccess={handleAvatarUpdateSuccess}
                />
              ) : (
                <Home API_URL={API_URL} />
              )
            }
          />
          <Route
            path="/admin"
            element={
              isAdmin ? (
                <Admin
                  vouchers={vouchers}
                  onAddVoucher={handleAddVoucher}
                  onUpdateVoucher={handleUpdateVoucher}
                  onDeleteVoucher={handleDeleteVoucher}
                  produk={produk}
                  checkouts={checkouts}
                  onAddProduk={handleAddProduk}
                  onUpdateProduk={handleUpdateProduk}
                  onDeleteProduk={handleDeleteProduk}
                  API_URL={API_URL}
                />
              ) : (
                <Home API_URL={API_URL} />
              )
            }
          />
          <Route
            path="/ceo"
            element={
              isPemilik ? (
                <Ceo
                  users={users}
                  vouchers={vouchers}
                  produk={produk}
                  checkouts={checkouts}
                  returns={returns}
                  cancellations={cancellations}
                  onAddVoucher={handleAddVoucher}
                  onUpdateVoucher={handleUpdateVoucher}
                  onDeleteVoucher={handleDeleteVoucher}
                  onAddProduk={handleAddProduk}
                  onUpdateProduk={handleUpdateProduk}
                  onDeleteProduk={handleDeleteProduk}
                  onUpdateOrderStatus={handleUpdateOrderStatus}
                  onApproveReturn={handleApproveReturn}
                  onRejectReturn={handleRejectReturn}
                  onApproveCancellation={handleApproveCancellation}
                  onRejectCancellation={handleRejectCancellation}
                />
              ) : (
                <Home API_URL={API_URL} />
              )
            }
          />
          <Route
            path="/laporan-order-admin"
            element={
              isAdmin ? (
                <LaporanPesananAdmin checkouts={checkouts} />
              ) : (
                <Home API_URL={API_URL} />
              )
            }
          />
          <Route
            path="/laporan-stok-admin"
            element={
              isAdmin ? <LaporanStokAdmin /> : <Home API_URL={API_URL} />
            }
          />
          <Route
            path="/laporan-movement-admin"
            element={
              isAdmin ? <LaporanMovementAdmin /> : <Home API_URL={API_URL} />
            }
          />
          <Route
            path="/laporan-order-ceo"
            element={
              isPemilik ? (
                <LaporanPesananCeo checkouts={checkouts} />
              ) : (
                <Home API_URL={API_URL} />
              )
            }
          />
          <Route
            path="/laporan-user-ceo"
            element={
              isPemilik ? <LaporanUserBaruCeo /> : <Home API_URL={API_URL} />
            }
          />
          <Route
            path="/laporan-user-setia-ceo"
            element={
              isPemilik ? <LaporanUserSetiaCeo /> : <Home API_URL={API_URL} />
            }
          />
          <Route
            path="/laporan-barang-terlaku-ceo"
            element={
              isPemilik ? (
                <LaporanBarangTerlakuCeo />
              ) : (
                <Home API_URL={API_URL} />
              )
            }
          />
          <Route
            path="/laporan-voucher-ceo"
            element={
              isPemilik ? <LaporanVoucherCeo /> : <Home API_URL={API_URL} />
            }
          />
          <Route
            path="/laporan-stok-ceo"
            element={
              isPemilik ? <LaporanStokCeo /> : <Home API_URL={API_URL} />
            }
          />
          <Route
            path="/laporan-movement-ceo"
            element={
              isPemilik ? <LaporanMovementCeo /> : <Home API_URL={API_URL} />
            }
          />
          <Route
            path="/laporan-revenue-ceo"
            element={
              isPemilik ? <LaporanRevenueCeo /> : <Home API_URL={API_URL} />
            }
          />
          <Route
            path="/laporan-metode-pembayaran-ceo"
            element={
              isPemilik ? (
                <LaporanMetodePembayaranCeo />
              ) : (
                <Home API_URL={API_URL} />
              )
            }
          />
          <Route path="/invoice/:orderId" element={<Invoice />} />
          <Route path="*" element={<Home API_URL={API_URL} />} />
        </Routes>
      </main>

      <Footer />
      <ProfileSlide
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
        user={user}
        setIsAdmin={setIsAdmin}
        setShowProfile={setShowProfile}
        API_URL={API_URL}
      />
    </div>
  );
}

const ProductDetailWrapper = ({
  produk,
  reviews,
  users,
  user,
  onAddToCart,
  cartCount,
  API_URL,
}) => {
  const { id } = useParams();
  const selectedProduct = produk.find((p) => p._id === id);
  if (produk.length === 0) {
    return <div>Loading product...</div>;
  }
  if (!selectedProduct) {
    return <div>Product not found.</div>;
  }

  return (
    <ProductDetail
      product={selectedProduct}
      reviews={reviews}
      users={users}
      user={user}
      onAddToCart={onAddToCart}
      cartCount={cartCount}
      API_URL={API_URL}
    />
  );
};

const ReviewWrapper = () => {
  return <Review />;
};

const PengembalianBarangWrapper = ({ checkouts, onSubmitReturn, API_URL }) => {
  const { orderId } = useParams();
  const orderToReturn = checkouts.find(
    (order) => order.id === parseInt(orderId)
  );

  if (checkouts.length === 0) {
    return <div>Loading order...</div>;
  }

  return (
    <PengembalianBarang
      order={orderToReturn}
      onSubmitReturn={onSubmitReturn}
      API_URL={API_URL}
    />
  );
};

export default App;
