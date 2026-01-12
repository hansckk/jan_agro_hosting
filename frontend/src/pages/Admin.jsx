import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import io from "socket.io-client";
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  Ticket,
  Menu,
  X,
} from "lucide-react";
import DashboardAdmin from "../admin/DashboardAdmin";
import UserAdmin from "../admin/UserAdmin";
import ProdukAdmin from "../admin/ProdukAdmin";
import SettingAdmin from "../admin/SettingAdmin";
import Voucher from "../admin/Voucher";
import ChatAdmin from "../admin/ChatAdmin";

// --- CONFIG URL & SOCKET ---
const rawUrl =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.MODE === "production"
    ? "/api"
    : "http://localhost:3000/api");
const cleanBaseUrl = rawUrl.endsWith("/") ? rawUrl.slice(0, -1) : rawUrl;
const SOCKET_URL = cleanBaseUrl.replace(/\/api$/, "");
const API_BASE = cleanBaseUrl.endsWith("/api")
  ? cleanBaseUrl
  : `${cleanBaseUrl}/api`;

function Admin({
  users,
  vouchers,
  produk,
  checkouts,
  returns,
  cancellations,
  handleDelete,
  handleToggleBan,
  handleUpdate,
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

  // STATE NOTIFIKASI TOTAL
  const [totalUnread, setTotalUnread] = useState(0);
  const socketRef = useRef(null);
  const token = localStorage.getItem("token");

  // --- LOGIKA HITUNG NOTIFIKASI GLOBAL ---
  useEffect(() => {
    if (!token) return;

    fetchUnreadCount();

    // Setup Socket
    socketRef.current = io(SOCKET_URL);
    socketRef.current.emit("join_admin");

    // Listen Pesan Baru
    socketRef.current.on("receive_message", (data) => {
      if (data.message.sender !== "admin") {
        setTotalUnread((prev) => prev + 1);
      }
    });

    // Listen Status Update
    socketRef.current.on("message_status_update", () => {
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

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <DashboardAdmin users={users} vouchers={vouchers} produk={produk} />
        );
      case "users":
        return (
          <UserAdmin
            users={users}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            onToggleBan={handleToggleBan}
          />
        );
      case "produk":
        return (
          <ProdukAdmin
            produk={produk}
            onAdd={onAddProduk}
            onUpdate={onUpdateProduk}
            onDelete={onDeleteProduk}
          />
        );
      case "vouchers":
        return (
          <Voucher
            vouchers={vouchers}
            onAdd={onAddVoucher}
            onUpdate={onUpdateVoucher}
            onDelete={onDeleteVoucher}
          />
        );
      case "settings":
        return (
          <SettingAdmin
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
      case "chats":
        return <ChatAdmin />;
      default:
        return <DashboardAdmin users={users} vouchers={vouchers} />;
    }
  };

  // NavItem dengan Custom Style & Badge
  const NavItem = ({ tab, icon: Icon, label, badgeCount, customIcon }) => (
    <button
      onClick={() => {
        setActiveTab(tab);
        setIsSidebarOpen(false);
      }}
      className={`relative flex items-center w-full px-3 py-3 rounded-lg transition-all duration-200 border-2 mb-1 ${
        activeTab === tab
          ? "bg-white text-black border-black shadow-md"
          : "text-gray-700 border-transparent hover:bg-gray-100"
      }`}
    >
      {/* Icon Wrapper */}
      <div className="flex-shrink-0 w-6 flex justify-center">
        {customIcon ? customIcon : <Icon className="h-5 w-5" />}
      </div>

      <span className="font-medium ml-3">{label}</span>

      {/* BADGE NOTIFIKASI */}
      {badgeCount > 0 && (
        <span className="absolute top-2 right-2 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-white shadow-sm">
          {badgeCount > 99 ? "99+" : badgeCount}
        </span>
      )}
    </button>
  );

  return (
    // 'items-start' penting agar sidebar tidak ketarik ke bawah
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100 text-black pt-20 sm:pt-24 items-start">
      {/* Overlay untuk Mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Responsive & Sticky Fix */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 shadow-xl p-6
          transform transition-transform duration-300 ease-in-out 
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          
          /* Desktop Styles (Sticky Logic) */
          md:translate-x-0 
          md:sticky 
          md:top-24               /* Turun 96px (sesuai pt-24 di main container) agar di bawah navbar */
          md:h-[calc(100vh-6rem)] /* Tinggi sidebar = Layar - Navbar (6rem) */
          md:overflow-y-auto      /* Scrollable internal jika menu panjang */
          md:shadow-none          
        `}
      >
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Admin Panel</h1>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden p-1 hover:bg-gray-100 rounded"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="space-y-1">
          <NavItem tab="dashboard" icon={LayoutDashboard} label="Dashboard" />
          <NavItem tab="users" icon={Users} label="Users" />
          <NavItem
            tab="produk"
            customIcon={
              <img
                src="/icon/produk.png"
                alt="Product"
                className="h-5 w-5 object-contain"
              />
            }
            label="Product"
          />
          <NavItem tab="vouchers" icon={Ticket} label="Vouchers" />
          <NavItem tab="settings" icon={ShoppingCart} label="Orders" />

          <NavItem
            tab="chats"
            customIcon={
              <img
                src="/icon/chat.png"
                alt="Chat"
                className="h-5 w-5 object-contain"
              />
            }
            label="Live Chat"
            badgeCount={totalUnread}
          />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 md:p-8 w-full min-w-0">
        {/* Tombol Toggle Mobile */}
        <div className="md:hidden mb-6 flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <span className="font-bold text-lg">Menu Admin</span>
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg font-bold text-sm active:scale-95 transition-transform"
          >
            <Menu size={18} />
            <span>Buka Menu</span>
          </button>
        </div>

        <div className="animate-fade-in-up">{renderContent()}</div>
      </main>
    </div>
  );
}

export default Admin;
