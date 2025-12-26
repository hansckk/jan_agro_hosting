import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import io from "socket.io-client";
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  Ticket,
  MessageSquare,
  Menu,
  X,
} from "lucide-react";
import DashboardCeo from "../ceo/DashboardCeo";
import ProdukCeo from "../ceo/ProdukCeo";
import PesananCeo from "../ceo/PesananCeo";
import VoucherCeo from "../ceo/VoucherCeo";
import UserCeo from "../ceo/UserCeo";
import UlasanCeo from "../ceo/UlasanCeo";
import ChatCeo from "../ceo/ChatCeo";

// --- CONFIG URL & SOCKET ---
const rawUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
const cleanBaseUrl = rawUrl.endsWith("/") ? rawUrl.slice(0, -1) : rawUrl;
const SOCKET_URL = cleanBaseUrl.replace(/\/api$/, "");
const API_BASE = cleanBaseUrl.endsWith("/api")
  ? cleanBaseUrl
  : `${cleanBaseUrl}/api`;

function Ceo({
  users,
  vouchers,
  produk,
  checkouts,
  returns,
  cancellations,
  onAddVoucher,
  onUpdateVoucher,
  onDeleteVoucher,
  onAddProduk,
  onUpdateProduk,
  onDeleteProduk,
  onUpdateOrderStatus,
  onApproveReturn,
  onRejectReturn,
  onApproveCancellation,
  onRejectCancellation,
}) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // STATE UNTUK TOTAL NOTIFIKASI
  const [totalUnread, setTotalUnread] = useState(0);
  const socketRef = useRef(null);
  const token = localStorage.getItem("token");

  // --- LOGIKA HITUNG NOTIFIKASI GLOBAL ---
  useEffect(() => {
    if (!token) return;

    fetchUnreadCount();

    socketRef.current = io(SOCKET_URL);
    socketRef.current.emit("join_admin");

    socketRef.current.on("receive_message", (data) => {
      if (data.message.sender !== "admin") {
        setTotalUnread((prev) => prev + 1);
      }
    });

    socketRef.current.on("message_status_update", (data) => {
      fetchUnreadCount();
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [token]);

  const fetchUnreadCount = async () => {
    try {
      const res = await axios.get(`${API_BASE}/chat/admin/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        let count = 0;
        res.data.data.forEach((chat) => {
          const unreadInChat = chat.messages.filter(
            (m) => m.sender !== "admin" && m.status !== "read"
          ).length;
          count += unreadInChat;
        });
        setTotalUnread(count);
      }
    } catch (error) {
      console.error("Gagal hitung notif:", error);
    }
  };

  // --- KOMPONEN BUTTON ---
  const NavButton = ({ tabName, icon, children, badgeCount }) => (
    <button
      onClick={() => {
        setActiveTab(tabName);
        setIsSidebarOpen(false);
      }}
      className={`relative flex items-center w-full px-4 py-3 rounded-lg font-bold transition-all duration-200 border-2 mb-2 ${
        activeTab === tabName
          ? "bg-white text-black border-black shadow-md"
          : "bg-white text-gray-500 border-transparent hover:text-black hover:bg-gray-50"
      }`}
    >
      {icon} {children}
      {badgeCount > 0 && (
        <span className="absolute top-3 right-3 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-white shadow-sm">
          {badgeCount > 99 ? "99+" : badgeCount}
        </span>
      )}
    </button>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <DashboardCeo
            users={users}
            vouchers={vouchers}
            produk={produk}
            checkouts={checkouts}
          />
        );
      case "produk":
        return (
          <ProdukCeo
            produk={produk}
            onAdd={onAddProduk}
            onUpdate={onUpdateProduk}
            onDelete={onDeleteProduk}
          />
        );
      case "vouchers":
        return (
          <VoucherCeo
            vouchers={vouchers}
            onAdd={onAddVoucher}
            onUpdate={onUpdateVoucher}
            onDelete={onDeleteVoucher}
          />
        );
      case "users":
        return <UserCeo />;
      case "pesanan":
        return (
          <PesananCeo
            checkouts={checkouts}
            returns={returns}
            cancellations={cancellations}
            onUpdateStatus={onUpdateOrderStatus}
            onApproveReturn={onApproveReturn}
            onRejectReturn={onRejectReturn}
            onApproveCancellation={onApproveCancellation}
            onRejectCancellation={onRejectCancellation}
          />
        );
      case "ulasan":
        return <UlasanCeo />;
      case "chats":
        return <ChatCeo />;
      default:
        return (
          <DashboardCeo
            users={users}
            vouchers={vouchers}
            produk={produk}
            checkouts={checkouts}
          />
        );
    }
  };

  return (
    // PERBAIKAN 1: Tambahkan 'items-start' dan 'sm:pt-24'
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100 text-black pt-20 sm:pt-24 items-start">
      
      {/* Overlay Mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Responsive */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-72 bg-white border-r-2 border-black
          transform transition-transform duration-300 ease-in-out shadow-2xl md:shadow-none
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          
          /* Desktop Styles (Sticky) */
          md:translate-x-0 
          md:sticky 
          md:top-24               /* Turunkan agar pas di bawah navbar (sesuai pt-24) */
          md:h-[calc(100vh-6rem)] /* Tinggi layar dikurangi navbar */
          md:overflow-y-auto
        `}
      >
        <div className="flex flex-col h-full p-6">
          <div className="flex justify-between items-center mb-8 border-b-2 border-black pb-4">
            <h1 className="text-3xl font-black tracking-tighter">CEO PANEL</h1>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden hover:bg-gray-100 p-1 rounded-md transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <nav className="flex-1 space-y-1">
            <NavButton
              tabName="dashboard"
              icon={
                <img
                  src="/icon/dashboard.png"
                  alt="Dashboard Icon"
                  className="mr-3 h-6 w-6 object-contain"
                />
              }
            >
              Dashboard
            </NavButton>
            <NavButton
              tabName="users"
              icon={
                <img
                  src="/icon/user.png"
                  alt="User Icon"
                  className="mr-3 h-6 w-6 object-contain"
                />
              }
            >
              Users
            </NavButton>
            <NavButton
              tabName="produk"
              icon={
                <img
                  src="/icon/produk.png"
                  alt="product Icon"
                  className="mr-3 h-6 w-6 object-contain"
                />
              }
            >
              Products
            </NavButton>
            <NavButton
              tabName="vouchers"
              icon={
                <img
                  src="/icon/voucher1.png"
                  alt="Voucher Icon"
                  className="mr-3 h-6 w-6 object-contain"
                />
              }
            >
              Vouchers
            </NavButton>
            <NavButton
              tabName="pesanan"
              icon={
                <img
                  src="/icon/order.png"
                  alt="Order Icon"
                  className="mr-3 h-6 w-6 object-contain"
                />
              }
            >
              Orders
            </NavButton>
            <NavButton
              tabName="ulasan"
              icon={
                <img
                  src="/icon/review.png"
                  alt="review Icon"
                  className="mr-3 h-6 w-6 object-contain"
                />
              }
            >
              Reviews
            </NavButton>

            <NavButton
              tabName="chats"
              icon={
                <img
                  src="/icon/chat.png"
                  alt="Chat Icon"
                  className="mr-3 h-6 w-6 object-contain"
                />
              }
              badgeCount={totalUnread}
            >
              Chat
            </NavButton>
          </nav>

          <div className="pt-6 mt-auto">
            <p className="text-xs text-gray-400 font-bold">Panel CEO v1.0</p>
          </div>
        </div>
      </aside>

      <main className="flex-1 w-full p-4 sm:p-6 md:p-8 overflow-hidden min-h-[80vh]">
        <div className="md:hidden mb-6 flex items-center justify-between bg-white border-2 border-black p-4 rounded-lg shadow-md">
          <span className="font-bold text-lg">Menu Panel</span>
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg font-bold active:scale-95 transition-transform"
          >
            <Menu size={20} />
            <span>Buka Menu</span>
          </button>
        </div>

        <div className="animate-fade-in-up">{renderContent()}</div>
      </main>
    </div>
  );
}

export default Ceo;