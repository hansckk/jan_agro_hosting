import React, { useMemo, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  Users,
  Package,
  BarChart2,
  TrendingUp,
  TrendingDown,
  Clock,
  FileText,
} from "lucide-react";
import { fetchUsers, fetchDashboardStats } from "../features/admin/adminSlice";

import { Card, Badge, Button } from "flowbite-react";

function DashboardCeo({ vouchers = [], produk = [], checkouts = [] }) {
  const dispatch = useDispatch();
  const { users, loading: usersLoading } = useSelector((state) => state.admin);

  const [sortDirection, setSortDirection] = useState("asc");

  useEffect(() => {
    if (users.length === 0) {
      dispatch(fetchUsers());
    }
  }, [dispatch, users.length]);

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  const dashboardStats = useSelector((state) => state.admin.dashboardStats);

  const handleSortToggle = () => {
    setSortDirection((prevDirection) =>
      prevDirection === "asc" ? "desc" : "asc"
    );
  };

  const stats = useMemo(() => {
    const totalRevenueLocal = checkouts
      .filter((o) => o.status === "selesai" || o.status === "sampai")
      .reduce((sum, order) => sum + order.totalHarga, 0);

    const successfulOrdersLocal = checkouts.filter(
      (o) => o.status === "selesai" || o.status === "sampai"
    ).length;

    const pendingOrdersLocal = checkouts.filter(
      (o) =>
        o.status === "diproses" ||
        o.status === "dikirim" ||
        o.status === "pending"
    ).length;

    const lowStockProductsLocal = produk.filter((p) => p.stock <= 10).length;

    if (dashboardStats) {
      return {
        totalRevenue: dashboardStats.totalRevenue ?? totalRevenueLocal,
        successfulOrders:
          dashboardStats.successfulOrders ?? successfulOrdersLocal,
        pendingOrders: dashboardStats.pendingOrders ?? pendingOrdersLocal,
        lowStockProducts:
          dashboardStats.lowStockProducts ?? lowStockProductsLocal,
      };
    }

    return {
      totalRevenue: totalRevenueLocal,
      successfulOrders: successfulOrdersLocal,
      pendingOrders: pendingOrdersLocal,
      lowStockProducts: lowStockProductsLocal,
    };
  }, [checkouts, produk, dashboardStats]);

  const sortedProducts = useMemo(() => {
    return [...produk].sort((a, b) => {
      if (sortDirection === "asc") return a.stock - b.stock;
      return b.stock - a.stock;
    });
  }, [produk, sortDirection]);

  const StatCard = ({
    icon,
    title,
    value,
    detail,
    trend,
    isLoading = false,
  }) => {
    const TrendIcon = trend === "up" ? TrendingUp : TrendingDown;
    const trendColor = trend === "up" ? "text-green-600" : "text-red-600";

    return (
      <Card className="bg-white dark:bg-white border-2 border-black shadow-xl transform hover:scale-105 transition-transform duration-300">
        <div className="flex flex-col h-full justify-between">
          <div>
            <div className="flex justify-between items-start">
              <div className="bg-black text-white rounded-full p-3">{icon}</div>
              {trend && <TrendIcon className={`${trendColor} w-6 h-6`} />}
            </div>
            {isLoading ? (
              <div className="mt-4 bg-gray-200 h-9 w-2/3 rounded animate-pulse"></div>
            ) : (
              <p className="text-3xl sm:text-4xl font-extrabold mt-4 break-words text-gray-900 dark:text-gray-900">
                {value}
              </p>
            )}
            <p className="text-gray-800 dark:text-gray-800 font-semibold">
              {title}
            </p>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-600 mt-2">
            {detail}
          </p>
        </div>
      </Card>
    );
  };

  const recentActivities = useMemo(() => {
    if (dashboardStats?.recentActivities) {
      return dashboardStats.recentActivities.map((a) => ({
        ...a,
        type: "order",
      }));
    }
    return checkouts
      .slice()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map((c) => ({ ...c, type: "order" }));
  }, [checkouts, dashboardStats]);

  const textTitleClass = "text-xl font-bold text-gray-900 dark:text-gray-900";
  const textBodyClass = "text-gray-900 dark:text-gray-900";
  const textSubClass = "text-gray-600 dark:text-gray-600";

  return (
    <div className="w-full min-h-screen bg-white dark:bg-white text-gray-900 dark:text-gray-900 p-6 space-y-8 font-sans">
      {/* Header */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-black text-black dark:text-black">
          CEO Dashboard
        </h1>
        <p className={`${textSubClass} text-base sm:text-lg`}>
          High-level overview of JanAgro's performance.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<BarChart2 size={24} />}
          title="Total Revenue"
          value={`Rp ${stats.totalRevenue.toLocaleString("id-ID")}`}
          detail="From all completed orders."
          trend="up"
        />
        <StatCard
          icon={<Package size={24} />}
          title="Successful Orders"
          value={stats.successfulOrders}
          detail={`${stats.pendingOrders} orders are pending.`}
          trend="up"
        />
        <StatCard
          icon={<Users size={24} />}
          title="Total Users"
          value={users.length}
          detail="Registered customer accounts."
          isLoading={usersLoading}
        />
        <StatCard
          icon={<Package size={24} />}
          title="Low Stock & Empty"
          value={stats.lowStockProducts}
          detail="Items needing immediate restock (Qty ≤ 10)."
          trend="down"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Recent Activities Panel */}
        <div className="xl:col-span-2">
          <Card className="bg-white dark:bg-white border-2 border-black shadow-xl h-full">
            <h2
              className={`${textTitleClass} mb-4 pb-2 border-b-2 border-black`}
            >
              Recent Activities
            </h2>
            <div className="max-h-96 overflow-y-auto pr-2">
              <ul className="divide-y-2 divide-gray-200">
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity) => (
                    <li
                      key={activity._id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between py-4 gap-2"
                    >
                      <div className="flex items-center">
                        <div className="bg-gray-100 border-2 border-black rounded-full p-3 mr-4 shrink-0 text-black">
                          <Clock size={20} />
                        </div>
                        <div>
                          <p
                            className={`font-bold text-sm sm:text-base ${textBodyClass}`}
                          >
                            New Order #{activity._id.substring(0, 8)}
                          </p>
                          <p className={`text-xs sm:text-sm ${textSubClass}`}>
                            by {activity.nama} - Rp{" "}
                            {activity.totalHarga.toLocaleString("id-ID")}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`font-mono text-xs sm:text-sm ${textSubClass} pl-14 sm:pl-0`}
                      >
                        {new Date(activity.createdAt).toLocaleTimeString(
                          "id-ID",
                          { hour: "2-digit", minute: "2-digit" }
                        )}
                      </span>
                    </li>
                  ))
                ) : (
                  <p className="text-gray-500 italic p-4">
                    No recent activities.
                  </p>
                )}
              </ul>
            </div>
          </Card>
        </div>

        {/* Inventory Status Panel */}
        <div>
          <Card className="bg-white dark:bg-white border-2 border-black shadow-xl h-full">
            <div className="flex justify-between items-center mb-4 pb-2 border-b-2 border-black">
              <h2 className={textTitleClass}>Inventory Status</h2>
              <Button
                color="white"
                size="xs"
                onClick={handleSortToggle}
                className="border border-black text-black hover:bg-gray-100 focus:ring-0"
              >
                {sortDirection === "asc" ? "Sort ↑" : "Sort ↓"}
              </Button>
            </div>
            <div className="max-h-96 overflow-y-auto pr-2">
              <ul className="divide-y-2 divide-gray-200">
                {sortedProducts.map((p) => {
                  return (
                    <li
                      key={p._id}
                      className="flex items-center justify-between py-3"
                    >
                      <div className="pr-2">
                        <p
                          className={`font-semibold text-sm sm:text-base line-clamp-1 ${textBodyClass}`}
                        >
                          {p.name}
                        </p>
                        <p className={`text-xs sm:text-sm ${textSubClass}`}>
                          {p.category}
                        </p>
                      </div>
                      <div className="flex items-center space-x-3 shrink-0">
                        <span
                          className={`font-bold text-lg ${
                            p.stock === 0 ? "text-red-600" : textBodyClass
                          }`}
                        >
                          {p.stock === 0 ? "Empty" : p.stock}
                        </span>
                        {p.stock === 0 ? (
                          <Badge color="failure">Empty</Badge>
                        ) : p.stock <= 10 ? (
                          <Badge color="warning">Low</Badge>
                        ) : (
                          <Badge color="success">OK</Badge>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </Card>
        </div>
      </div>

      {/* Reports Section */}
      <div className="space-y-4">
        <h2 className={textTitleClass}>Reports</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              to: "/laporan-order-ceo",
              bg: "bg-blue-500",
              title: "Order Report",
              desc: "Monthly order analysis",
            },
            {
              to: "/laporan-user-ceo",
              bg: "bg-green-500",
              title: "New Users Report",
              desc: "Recently registered users",
            },
            {
              to: "/laporan-barang-terlaku-ceo",
              bg: "bg-orange-500",
              title: "Best Selling Products",
              desc: "Top selling products",
            },
            {
              to: "/laporan-stok-ceo",
              bg: "bg-red-500",
              title: "Stock Report",
              desc: "Products with critical stock",
            },
            {
              to: "/laporan-movement-ceo",
              bg: "bg-blue-700",
              title: "Stock Movement Report",
              desc: "Track stock in/out",
            },
            {
              to: "/laporan-user-setia-ceo",
              bg: "bg-purple-500",
              title: "Loyal Users Report",
              desc: "Frequent customers",
            },
            {
              to: "/laporan-voucher-ceo",
              bg: "bg-indigo-500",
              title: "Voucher Report",
              desc: "Voucher usage",
            },
            {
              to: "/laporan-revenue-ceo",
              bg: "bg-pink-500",
              title: "Revenue Report",
              desc: "Revenue analysis",
            },
            {
              to: "/laporan-metode-pembayaran-ceo",
              bg: "bg-cyan-500",
              title: "Payment Methods",
              desc: "Payment distribution",
            },
          ].map((item, index) => (
            <Link key={index} to={item.to} className="group">
              <Card className="bg-white dark:bg-white border-2 border-black hover:shadow-lg hover:scale-105 transition-all h-full">
                <div className="flex items-center gap-4">
                  <div
                    className={`${item.bg} text-white p-4 rounded-lg shrink-0`}
                  >
                    <FileText size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-gray-900 group-hover:text-black">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-600">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DashboardCeo;
