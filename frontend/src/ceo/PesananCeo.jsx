import React, { useState, useMemo, useEffect } from "react";
import {
  Check,
  X,
  Search,
  ChevronDown,
  FileText,
  Users,
  ShoppingBag,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  updateCheckoutStatus,
  setCheckouts,
} from "../features/admin/adminSlice";

// --- IMPORT FLOWBITE (HANYA CARD & BADGE YANG STABIL) ---
import { Card, Badge } from "flowbite-react";

const formatDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

function PesananCeo({
  checkouts,
  onUpdateOrderStatus,
  onApproveReturn,
  onRejectReturn,
  onApproveCancellation,
  onRejectCancellation,
}) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const adminCheckouts = useSelector((state) => state.admin?.checkouts || []);

  const [searchTerm, setSearchTerm] = useState("");
  const [activeDropdown, setActiveDropdown] = useState(null);

  const orders = adminCheckouts.length ? adminCheckouts : checkouts || [];

  useEffect(() => {
    if (
      (!adminCheckouts || adminCheckouts.length === 0) &&
      checkouts &&
      checkouts.length > 0
    ) {
      dispatch(setCheckouts(checkouts));
    }
  }, [adminCheckouts, checkouts, dispatch]);

  const pendingReturns = useMemo(
    () => orders.filter((o) => o.status === "pengembalian diajukan"),
    [orders]
  );
  const pendingCancellations = useMemo(
    () => orders.filter((o) => o.status === "pembatalan diajukan"),
    [orders]
  );

  const filteredCheckouts = useMemo(
    () =>
      orders.filter(
        (order) =>
          (order.nama &&
            order.nama.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (order._id &&
            order._id.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (order.status &&
            order.status.toLowerCase().includes(searchTerm.toLowerCase()))
      ),
    [orders, searchTerm]
  );

  const handleDropdownToggle = (e, order) => {
    e.stopPropagation();
    if (activeDropdown && activeDropdown.order._id === order._id) {
      setActiveDropdown(null);
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      const leftPos = Math.max(
        10,
        Math.min(rect.left + window.scrollX - 100, window.innerWidth - 220)
      );

      setActiveDropdown({
        order,
        top: rect.bottom + window.scrollY,
        left: leftPos,
      });
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    setActiveDropdown(null);
    const prev = orders.slice();

    const optimistic = orders.map((o) =>
      o._id === orderId ? { ...o, status: newStatus } : o
    );
    dispatch(setCheckouts(optimistic));

    try {
      await dispatch(
        updateCheckoutStatus({ id: orderId, status: newStatus })
      ).unwrap();
      if (typeof onUpdateOrderStatus === "function")
        onUpdateOrderStatus(orderId, newStatus);
    } catch (err) {
      dispatch(setCheckouts(prev));
      console.error("Failed to update status:", err);
    }
  };

  // --- MANUAL STYLING UNTUK VISIBILITAS MAKSIMAL ---
  // Tombol Putih: Background putih, Border abu-abu, Teks Hitam
  const btnWhite =
    "flex items-center justify-center gap-2 bg-white text-gray-900 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors shadow-sm font-medium w-full xl:w-auto";

  // Tombol Aksi Kecil
  const btnActionSuccess =
    "flex items-center justify-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-green-700 transition-colors flex-1";
  const btnActionFailure =
    "flex items-center justify-center gap-1 bg-red-600 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-red-700 transition-colors flex-1";

  const getStatusBadge = (status) => {
    const s = status ? status.toLowerCase() : "";
    if (s === "selesai") return <Badge color="success">Selesai</Badge>;
    if (s === "sampai") return <Badge color="green">Sampai</Badge>;
    if (s === "dikirim") return <Badge color="warning">Dikirim</Badge>;
    if (s === "diproses") return <Badge color="info">Diproses</Badge>;
    if (s === "dibatalkan") return <Badge color="failure">Dibatalkan</Badge>;
    if (s.includes("pembatalan"))
      return <Badge color="failure">Req Batal</Badge>;
    if (s.includes("pengembalian"))
      return <Badge color="purple">Req Retur</Badge>;
    return <Badge color="gray">{status}</Badge>;
  };

  const ActionCard = ({ title, count, children }) => (
    <Card className="bg-white border border-gray-200 shadow-md [&>div]:bg-white h-full">
      <h3 className="font-bold text-xl mb-2 pb-2 border-b border-gray-200 flex justify-between items-center text-gray-900">
        <span>{title}</span>
        {count > 0 && (
          <Badge color="failure" size="sm" className="px-2 py-0.5">
            {count}
          </Badge>
        )}
      </h3>
      <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
        {count > 0 ? (
          children
        ) : (
          <p className="text-gray-500 italic py-4 text-center">
            No pending requests.
          </p>
        )}
      </div>
    </Card>
  );

  const RequestItem = ({ order, onApprove, onReject }) => (
    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="font-bold text-gray-900 text-sm">
            Order #{order._id.substring(0, 8)}
          </p>
          <p className="text-xs text-gray-500">{order.nama}</p>
        </div>
        <p className="text-xs text-gray-500 font-mono">
          {formatDate(order.createdAt)}
        </p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onApprove(order._id)}
          className={btnActionSuccess}
        >
          <Check size={14} /> Approve
        </button>
        <button
          onClick={() => onReject(order._id)}
          className={btnActionFailure}
        >
          <X size={14} /> Reject
        </button>
      </div>
    </div>
  );

  const StatusOption = ({ label, target, current }) => (
    <button
      onClick={() => handleStatusChange(activeDropdown.order._id, target)}
      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
        current === target
          ? "font-bold text-blue-600 bg-blue-50"
          : "text-gray-700"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="w-full min-h-screen bg-white text-gray-900 p-6 space-y-8 font-sans">
      {/* HEADER */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 border-b border-gray-200 pb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Order & Request Management
          </h2>
          <p className="text-gray-500 mt-1">
            Manage customer orders, returns, and cancellations.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 w-full xl:w-auto">
          {/* TOMBOL NAVIGASI - MANUAL BUTTONS AGAR TERLIHAT */}
          <button
            onClick={() => navigate("/laporan-user-setia-ceo")}
            className={btnWhite}
          >
            <Users size={18} className="text-blue-600" />
            <span>Top Customers</span>
          </button>
          <button
            onClick={() => navigate("/laporan-order-ceo")}
            className={btnWhite}
          >
            <FileText size={18} className="text-purple-600" />
            <span>Laporan Pesanan</span>
          </button>
          <button
            onClick={() => navigate("/laporan-stok-ceo")}
            className={btnWhite}
          >
            <ShoppingBag size={18} className="text-green-600" />
            <span>Laporan Stok</span>
          </button>
        </div>
      </div>

      {/* REQUEST CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ActionCard title="Return Requests" count={pendingReturns.length}>
          {pendingReturns.map((order) => (
            <RequestItem
              key={order._id}
              order={order}
              onApprove={onApproveReturn}
              onReject={onRejectReturn}
            />
          ))}
        </ActionCard>
        <ActionCard
          title="Cancellation Requests"
          count={pendingCancellations.length}
        >
          {pendingCancellations.map((order) => (
            <RequestItem
              key={order._id}
              order={order}
              onApprove={onApproveCancellation}
              onReject={onRejectCancellation}
            />
          ))}
        </ActionCard>
      </div>

      {/* ORDER TABLE CARD */}
      <Card className="bg-white border border-gray-200 shadow-lg [&>div]:bg-white">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
          <h2 className="text-xl font-bold text-gray-900">
            Comprehensive Order Log
          </h2>
          <div className="relative w-full md:w-72">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search order..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
            />
          </div>
        </div>

        {/* TABEL MANUAL (ANTI ERROR) */}
        <div className="relative overflow-x-auto shadow-none border border-gray-200 rounded-lg">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 border-r border-gray-200">Order ID</th>
                <th className="px-6 py-3 border-r border-gray-200">Customer</th>
                <th className="px-6 py-3 border-r border-gray-200">Date</th>
                <th className="px-6 py-3 border-r border-gray-200">Total</th>
                <th className="px-6 py-3 text-center border-r border-gray-200">
                  Status
                </th>
                <th className="px-6 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCheckouts.length > 0 ? (
                filteredCheckouts.map((order) => (
                  <tr
                    key={order._id}
                    className="bg-white border-b border-gray-200 hover:bg-gray-50 text-gray-900"
                  >
                    <td className="px-6 py-4 font-mono font-medium text-blue-600 border-r border-gray-200">
                      #{order._id.substring(0, 8)}
                    </td>
                    <td className="px-6 py-4 border-r border-gray-200">
                      {order.nama}
                    </td>
                    <td className="px-6 py-4 border-r border-gray-200">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-4 font-medium border-r border-gray-200">
                      Rp {order.totalHarga.toLocaleString("id-ID")}
                    </td>
                    <td className="px-6 py-4 text-center border-r border-gray-200">
                      <div className="flex justify-center">
                        {getStatusBadge(order.status)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={(e) => handleDropdownToggle(e, order)}
                        className="mx-auto flex items-center justify-center px-3 py-1.5 bg-white border border-gray-300 rounded text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors shadow-sm"
                      >
                        Update <ChevronDown size={14} className="ml-1" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-10 text-center text-gray-500 italic"
                  >
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* DROPDOWN MENU MANUAL */}
      {activeDropdown && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setActiveDropdown(null)}
          ></div>
          <div
            style={{
              position: "absolute",
              top: `${activeDropdown.top + 5}px`,
              left: `${activeDropdown.left}px`,
            }}
            className="w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-50 py-1 overflow-hidden"
          >
            {(() => {
              const current =
                orders.find((o) => o._id === activeDropdown.order._id)
                  ?.status || activeDropdown.order.status;
              return (
                <div className="flex flex-col">
                  <StatusOption
                    label="Diproses"
                    target="diproses"
                    current={current}
                  />
                  <StatusOption
                    label="Dikirim"
                    target="dikirim"
                    current={current}
                  />
                  <StatusOption
                    label="Sampai"
                    target="sampai"
                    current={current}
                  />
                  <StatusOption
                    label="Selesai"
                    target="selesai"
                    current={current}
                  />
                </div>
              );
            })()}
          </div>
        </>
      )}
    </div>
  );
}

export default PesananCeo;
