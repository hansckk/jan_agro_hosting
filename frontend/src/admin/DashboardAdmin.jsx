import React, { useState, useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsers } from "../features/user/userSlice";
import { fetchProducts } from "../features/products/productSlice";
import { fetchVouchers } from "../features/voucher/voucherSlice";
import { fetchDashboardStats } from "../features/admin/adminSlice";

function DashboardAdmin() {
  const dispatch = useDispatch();

  const {
    users,
    loading: userLoading,
    error: userError,
  } = useSelector((state) => state.users);
  const { items: produk, loading: produkLoading } = useSelector(
    (state) => state.products
  );
  const { vouchers, loading: voucherLoading } = useSelector(
    (state) => state.vouchers
  );

  const [produkSortAsc, setProdukSortAsc] = useState(true);
  // default to newest first
  const [userSortAsc, setUserSortAsc] = useState(false);

  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchProducts());
    dispatch(fetchVouchers());
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  const dashboardStats = useSelector((state) => state.admin.dashboardStats);

  const getProdukStatus = (stock) => {
    if (stock === 0)
      return { text: "Out of Stock", color: "bg-red-100 text-red-600" };
    if (stock <= 10)
      return {
        text: "Low Stock", // Text dipersingkat untuk mobile
        color: "bg-yellow-100 text-yellow-600",
      };
    return { text: "Available", color: "bg-green-100 text-green-600" };
  };

  const getUserStatus = (isBanned) => {
    if (isBanned) return { text: "Blocked", color: "bg-red-100 text-red-600" };
    return { text: "Active", color: "bg-green-100 text-green-600" };
  };

  const cards = [
    { title: "User Total", count: users?.length || 0, icon: "/icon/group.png" },
    {
      title: "Product Total",
      count: produk?.length || 0,
      icon: "/icon/product.png",
    },
    {
      title: "Voucher Total",
      count: vouchers?.length || 0,
      icon: "/icon/voucher.png",
    },
  ];

  const sortedProduk = useMemo(() => {
    return [...(produk || [])].sort((a, b) =>
      produkSortAsc ? a.stock - b.stock : b.stock - a.stock
    );
  }, [produk, produkSortAsc]);

  const sortedUsers = useMemo(() => {
    return [...(users || [])].sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return userSortAsc ? timeA - timeB : timeB - timeA;
    });
  }, [users, userSortAsc]);

  const loading = userLoading || produkLoading || voucherLoading;
  const error = userError;

  return (
    <div className="space-y-6">
      {/* Shared Stats - Revenue & Orders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white shadow-md rounded-lg p-5 flex flex-col justify-between border border-gray-100">
          <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">
            Total Revenue
          </p>
          <p className="text-3xl font-bold text-gray-900">
            {dashboardStats?.totalRevenue
              ? `Rp ${dashboardStats.totalRevenue.toLocaleString("id-ID")}`
              : "Rp 0"}
          </p>
        </div>
        <div className="bg-white shadow-md rounded-lg p-5 flex flex-col justify-between border border-gray-100">
          <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">
            Successful Orders
          </p>
          <p className="text-3xl font-bold text-gray-900">
            {dashboardStats?.successfulOrders ?? 0}
          </p>
        </div>
        <div className="bg-white shadow-md rounded-lg p-5 flex flex-col justify-between border border-gray-100">
          <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">
            Pending Orders
          </p>
          <p className="text-3xl font-bold text-gray-900">
            {dashboardStats?.pendingOrders ?? 0}
          </p>
        </div>
        <div className="bg-white shadow-md rounded-lg p-5 flex flex-col justify-between border border-gray-100">
          <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">
            Low Stock Items (≤10)
          </p>
          <p className="text-3xl font-bold text-gray-900">
            {dashboardStats?.lowStockProducts ?? 0}
          </p>
        </div>
      </div>

      {/* Recent Activities (shared) */}
      <div className="bg-white shadow-md rounded-lg p-4 sm:p-6 border border-gray-100">
        <h2 className="text-lg sm:text-xl font-bold mb-4">Recent Activities</h2>
        <div className="overflow-y-auto max-h-64">
          <ul className="divide-y divide-gray-100">
            {(dashboardStats?.recentActivities || []).length > 0 ? (
              (dashboardStats.recentActivities || []).map((act) => (
                <li
                  key={act._id}
                  className="flex items-center justify-between py-3"
                >
                  <div>
                    <p className="font-bold">
                      Order #{String(act._id).substring(0, 8)}
                    </p>
                    <p className="text-sm text-gray-500">
                      by {act.nama} — Rp{" "}
                      {act.totalHarga.toLocaleString("id-ID")}
                    </p>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(act.createdAt).toLocaleString()}
                  </div>
                </li>
              ))
            ) : (
              <p className="text-gray-500 italic p-4">No recent activities.</p>
            )}
          </ul>
        </div>
      </div>

      {/* Existing summary cards (users/products/vouchers) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {cards.map((card, idx) => (
          <div
            key={idx}
            className="bg-white shadow-md rounded-lg p-5 flex items-center space-x-4 border border-gray-100"
          >
            <div className="w-12 h-12 flex-shrink-0">
              <img
                src={card.icon}
                alt={card.title}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">
                {card.title}
              </p>
              <p className="text-3xl font-bold text-gray-900">{card.count}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* User Section */}
        <div className="bg-white shadow-md rounded-lg p-4 sm:p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6 pb-2 border-b border-gray-100">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
              Latest Users
            </h2>
            <button
              onClick={() => setUserSortAsc(!userSortAsc)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              title={`Sort By Date ${userSortAsc ? "Oldest" : "Newest"}`}
            >
              <img
                src="/icon/down.png"
                alt="Sort"
                className={`w-5 h-5 transition-transform duration-300 ${
                  userSortAsc ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>

          {loading ? (
            <div className="text-center py-10 text-gray-500">
              Loading data...
            </div>
          ) : error ? (
            <p className="text-red-500 text-center py-10">{error}</p>
          ) : users?.length === 0 ? (
            <p className="text-gray-500 text-center py-10">
              No Users Available
            </p>
          ) : (
            <div className="overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
              <ul className="divide-y divide-gray-100">
                {sortedUsers.slice(0, 6).map((user) => {
                  const status = getUserStatus(user.isBanned);
                  return (
                    <li
                      key={user._id}
                      className="flex items-center justify-between py-4"
                    >
                      <div className="flex-1 min-w-0 pr-4">
                        <p className="font-bold text-gray-900 truncate">
                          {user.name}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          @{user.username}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <span
                          className={`px-3 py-1 text-xs rounded-full font-bold uppercase tracking-wider ${status.color}`}
                        >
                          {status.text}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        {/* Product Section */}
        <div className="bg-white shadow-md rounded-lg p-4 sm:p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6 pb-2 border-b border-gray-100">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800">
              Product Inventory
            </h2>
            <button
              onClick={() => setProdukSortAsc(!produkSortAsc)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              title={`Sort By Stock ${produkSortAsc ? "DESC" : "ASC"}`}
            >
              <img
                src="/icon/down.png"
                alt="Sort"
                className={`w-5 h-5 transition-transform duration-300 ${
                  produkSortAsc ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>

          <div className="overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
            <ul className="divide-y divide-gray-100">
              {sortedProduk.slice(0, 6).map((p) => {
                const status = getProdukStatus(p.stock);
                return (
                  <li
                    key={p._id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between py-4 gap-2 sm:gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 truncate">
                        {p.name}
                      </p>
                      <p className="text-sm text-gray-500">{p.category}</p>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                      <span className="text-sm font-semibold text-gray-700">
                        Stock: {p.stock}
                      </span>
                      <span
                        className={`px-3 py-1 text-xs rounded-full font-bold uppercase tracking-wider ${status.color}`}
                      >
                        {status.text}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardAdmin;
