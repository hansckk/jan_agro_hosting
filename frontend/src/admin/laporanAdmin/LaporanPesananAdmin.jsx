import React, { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { Bar } from "react-chartjs-2";
import { X, ArrowLeft, FileText, Calendar, CalendarDays } from "lucide-react"; // Import Icon Calendar
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useDispatch, useSelector } from "react-redux";
import { fetchCeoReport } from "../../features/admin/adminSlice";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import { janAgroLogoBase64 } from "./logoBase64"; // Pastikan path benar
import { getStatusLabel } from "../../i18n/labels";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const OrderDetailModal = ({ order, onClose }) => {
  if (!order) return null;

  // Helper function to map payment type to readable format
  const getPaymentMethodDisplay = (paymentType, metodePembayaran) => {
    const paymentMap = {
      'credit_card': 'Kartu Kredit',
      'bank_transfer': 'Transfer Bank',
      'gopay': 'GoPay',
      'qris': 'QRIS',
      'cstore': 'Convenience Store',
      'echannel': 'E-Channel',
      'bnpl': 'Cicilan',
      'transfer_bank': 'Transfer Bank'
    };
    // If paymentType exists and is not null/empty, use it (it's from actual Midtrans payment)
    if (paymentType && paymentType !== 'null' && paymentType.trim()) {
      return paymentMap[paymentType] || paymentType;
    }
    // Fall back to metodePembayaran only if it's not 'Online Payment'
    if (metodePembayaran && metodePembayaran !== 'Online Payment') {
      return metodePembayaran;
    }
    return 'Online Payment';
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white text-black p-8 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border-2 border-black relative animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-black"
        >
          <X size={24} />
        </button>
        <div className="border-b-2 border-black pb-4 mb-6">
          <h2 className="text-3xl font-bold">Order Details</h2>
          <p className="text-gray-600">ORDER #{order.id}</p>
        </div>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold mb-2">Shipping Information</h3>
            <div className="text-sm space-y-1">
              <p>
                <span className="font-semibold">Name:</span> {order.nama}
              </p>
              <p>
                <span className="font-semibold">Phone:</span>
                {order.noTelpPenerima}
              </p>
              <p>
                <span className="font-semibold">Address:</span> {order.alamat}
              </p>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-2">Items Ordered</h3>
            <div className="divide-y divide-gray-200 border-y border-gray-200">
              {order.items.map((item) => (
                <div
                  key={item._id || item.product}
                  className="flex justify-between items-center py-3 text-sm"
                >
                  <div>
                    <p className="font-bold">{item.name}</p>
                    <p className="text-gray-500">
                      {item.quantity} x Rp {item.price.toLocaleString("id-ID")}
                    </p>
                  </div>
                  <p className="font-semibold">
                    Rp {(item.quantity * item.price).toLocaleString("id-ID")}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-2">Payment Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span>
                  Rp{" "}
                  {order.subtotal
                    ? order.subtotal.toLocaleString("id-ID")
                    : "-"}
                </span>
              </div>
              {order.diskon > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Discount ({order.kodeVoucher}):</span>
                  <span className="text-green-600">- Rp {order.diskon.toLocaleString("id-ID")}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Courier Fee:</span>
                <span>
                  Rp{" "}
                  {order.kurir?.biaya
                    ? order.kurir.biaya.toLocaleString("id-ID")
                    : 0}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold border-t border-black pt-2 mt-2">
                <span>Total Price:</span>
                <span>Rp {order.totalHarga.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Method:</span>
                <span className="font-semibold">{getPaymentMethodDisplay(order.paymentType, order.metodePembayaran)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const LaporanSection = ({ title, orders, onOrderClick }) => (
  <div className="bg-white p-6 rounded-lg border border-black">
    <h2 className="text-xl font-bold mb-4 border-b border-black pb-2">{title}</h2>
    {orders.length > 0 ? (
      <div className="divide-y divide-gray-300 max-h-96 overflow-y-auto pr-2">
        {orders.map((order) => (
          <button
            key={order.id}
            onClick={() => onOrderClick(order)}
            className="w-full text-left py-3 hover:bg-gray-50 transition-colors"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="font-bold text-black">
                  ORDER #{order.id.substring(0, 8)}
                </p>
                <p className="text-sm text-gray-600">{order.nama}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-black">
                  Rp {order.totalHarga.toLocaleString("id-ID")}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(order.tanggal).toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    ) : (
      <p className="text-gray-500 italic">No orders in this category.</p>
    )}
  </div>
);

const LaporanPesananAdmin = () => {
  const dispatch = useDispatch();
  const { ceoReportData, loading } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchCeoReport({}));
  }, [dispatch]);

  const checkouts = ceoReportData || [];

  const [selectedOrder, setSelectedOrder] = useState(null);

  const [filterType, setFilterType] = useState("monthly"); 

  const [listYear, setListYear] = useState(new Date().getFullYear());
  const [listMonthStart, setListMonthStart] = useState(1);
  const [listMonthEnd, setListMonthEnd] = useState(12);

  const [specificDate, setSpecificDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [chartYear, setChartYear] = useState(new Date().getFullYear());
  const [purchaseFilter, setPurchaseFilter] = useState("all");

  const years = useMemo(() => {
    const uniqueYears = new Set(
      checkouts.map((c) => new Date(c.tanggal).getFullYear())
    );
    uniqueYears.add(new Date().getFullYear());
    return Array.from(uniqueYears).sort((a, b) => b - a);
  }, [checkouts]);

  const filteredCheckoutsForList = useMemo(() => {
    return checkouts.filter((checkout) => {
      const checkoutDate = new Date(checkout.tanggal);

      if (filterType === "daily") {
        const checkoutDateString = checkoutDate.toLocaleDateString("en-CA");
        return checkoutDateString === specificDate;
      } else {
        const yearMatch = checkoutDate.getFullYear() === listYear;
        const startMonth = Math.min(listMonthStart, listMonthEnd);
        const endMonth = Math.max(listMonthStart, listMonthEnd);
        const monthMatch =
          checkoutDate.getMonth() + 1 >= startMonth &&
          checkoutDate.getMonth() + 1 <= endMonth;
        return yearMatch && monthMatch;
      }
    });
  }, [
    checkouts,
    filterType,
    specificDate,
    listYear,
    listMonthStart,
    listMonthEnd,
  ]);

  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    // Helper function to map payment type to readable format
    const getPaymentMethodDisplay = (paymentType, metodePembayaran) => {
      const paymentMap = {
        'credit_card': 'Kartu Kredit',
        'bank_transfer': 'Transfer Bank',
        'gopay': 'GoPay',
        'qris': 'QRIS',
        'cstore': 'Convenience Store',
        'echannel': 'E-Channel',
        'bnpl': 'Cicilan',
        'transfer_bank': 'Transfer Bank'
      };
      // If paymentType exists and is not null/empty, use it (it's from actual Midtrans payment)
      if (paymentType && paymentType !== 'null' && paymentType.trim && paymentType.trim()) {
        return paymentMap[paymentType] || paymentType;
      }
      // Fall back to metodePembayaran only if it's not 'Online Payment'
      if (metodePembayaran && metodePembayaran !== 'Online Payment') {
        return metodePembayaran;
      }
      return 'Online Payment';
    };

    const tableColumn = [
      "Order ID",
      "Customer Name",
      "Date",
      "Payment Method",
      "Total Price",
      "Status",
    ];
    const tableRows = [];
    filteredCheckoutsForList.forEach((order) => {
      const orderData = [
        `#${order.id.substring(0, 8)}`,
        order.nama,
        new Date(order.tanggal).toLocaleDateString("id-ID", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        getPaymentMethodDisplay(order.paymentType, order.metodePembayaran),
        `Rp ${order.totalHarga.toLocaleString("id-ID")}`,
        getStatusLabel(order.status),
      ];
      tableRows.push(orderData);
    });

    const filterTitle =
      filterType === "daily"
        ? `Daily (${new Date(specificDate).toLocaleDateString("en-US", { dateStyle: "long" })})`
        : `Monthly`;

    const date = new Date();
    const fullDate = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 45,
      margin: { top: 45 },
      theme: "grid",
      styles: { font: "helvetica", fontSize: 8, cellPadding: 2 },
      headStyles: {
        fillColor: [41, 41, 41],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      didDrawPage: function (data) {
        const logoWidth = 22;
        const logoHeight = 22;
        const margin = data.settings.margin.left;

        try {
          doc.addImage(
            janAgroLogoBase64,
            "JPEG",
            margin,
            10,
            logoWidth,
            logoHeight,
            undefined,
            "FAST"
          );
        } catch (e) {
          console.warn("Logo error", e);
        }

        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("PT. Jan Agro Nusantara", margin + logoWidth + 5, 16);
        doc.setFontSize(10);
        doc.text(`Order Report (Admin) - ${filterTitle}`, margin + logoWidth + 5, 22);

        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.text(
          "Email: janagronusantara@gmail.com | Telepon: (031) 123-4567",
          margin + logoWidth + 5,
          27
        );
        doc.setDrawColor(0, 0, 0);
        doc.line(
          margin,
          35,
          doc.internal.pageSize.getWidth() - data.settings.margin.right,
          35
        );
        if (data.pageNumber === doc.internal.getNumberOfPages()) {
          const pageHeight = doc.internal.pageSize.getHeight();
          const pageWidth = doc.internal.pageSize.getWidth();
          let finalY = data.cursor.y;
          if (finalY + 60 > pageHeight) {
            doc.addPage();
            finalY = data.settings.margin.top;
          }
          doc.setFontSize(10);
          doc.setFont("helvetica", "normal");
          const signatureX = pageWidth - data.settings.margin.right;
          doc.text(
            `Surabaya, ${new Date().toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}`,
            signatureX,
            finalY + 20,
            { align: "right" }
          );
          doc.setFont("helvetica", "bold");
          doc.text("Admin JanAgro", signatureX, finalY + 45, {
            align: "right",
          });
          const nameWidth = doc.getTextWidth("Admin JanAgro");
          doc.setLineWidth(0.5);
          doc.line(
            signatureX - nameWidth,
            finalY + 46,
            signatureX,
            finalY + 46
          );
        }
      },
    });
    doc.save(`order_report_admin_${filterType}_${fullDate}.pdf`);
  };

  const chartData = useMemo(() => {
    const successfulPurchases = Array(12).fill(0);
    const failedPurchases = Array(12).fill(0);
    checkouts.forEach((checkout) => {
      const checkoutDate = new Date(checkout.tanggal);
      if (checkoutDate.getFullYear() === chartYear) {
        const month = checkoutDate.getMonth();
        if (["selesai", "sampai"].includes(checkout.status)) {
          successfulPurchases[month] += 1;
        } else if (
          [
            "pengembalian berhasil",
            "pengembalian ditolak",
            "dibatalkan",
            "pembatalan diajukan",
          ].includes(checkout.status)
        ) {
          failedPurchases[month] += 1;
        }
      }
    });
    const datasets = [
      {
        label: "Successful Purchases",
        data: successfulPurchases,
        backgroundColor: "rgba(34, 197, 94, 0.8)",
      },
      {
        label: "Failed/Cancelled Purchases",
        data: failedPurchases,
        backgroundColor: "rgba(239, 68, 68, 0.8)",
      },
    ];
    let filteredDatasets;
    if (purchaseFilter === "success") filteredDatasets = [datasets[0]];
    else if (purchaseFilter === "failed") filteredDatasets = [datasets[1]];
    else filteredDatasets = datasets;
    return {
      labels: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
      datasets: filteredDatasets,
    };
  }, [checkouts, chartYear, purchaseFilter]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
      title: {
        display: true,
        text: `Total Transaksi per Bulan - ${chartYear}`,
        font: { size: 18 },
      },
    },
    scales: {
      x: { stacked: true },
      y: { stacked: true, beginAtZero: true, ticks: { stepSize: 1 } },
    },
  };

  return (
    <>
      <div className="bg-white min-h-screen pt-24 text-black">
        <div className="max-w-7xl mx-auto space-y-8 px-4 sm:px-6 lg:px-8 pb-12">
          <header className="flex justify-between items-center border-b-2 border-black pb-4">
            <div>
              <h1 className="text-4xl font-bold">Order Report (Admin)</h1>
                  <p className="text-gray-600 mt-1">Order analysis and summary.</p>
            </div>
            <Link
              to="/admin"
              className="bg-black text-white px-4 py-2 rounded-lg flex items-center hover:bg-gray-800 transition-colors duration-200"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Kembali ke Admin
            </Link>
          </header>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
            </div>
          ) : (
            <>
              <div className="bg-white p-6 rounded-lg border border-black space-y-6">
                <div>
                  <h2 className="text-xl font-bold mb-4">Purchase Chart Filter</h2>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <select
                      value={chartYear}
                      onChange={(e) => setChartYear(parseInt(e.target.value))}
                      className="w-full sm:w-auto bg-white border border-black rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-black"
                    >
                      {years.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                    <select
                      value={purchaseFilter}
                      onChange={(e) => setPurchaseFilter(e.target.value)}
                      className="w-full sm:w-auto bg-white border border-black rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-black"
                    >
                      <option value="all">All Purchases</option>
                      <option value="success">Successful Purchases</option>
                      <option value="failed">Failed Purchases</option>
                    </select>
                  </div>
                </div>
                <div className="h-96 relative">
                  <Bar data={chartData} options={chartOptions} />
                </div>
              </div>

              <div className="bg-white border border-black p-6 rounded-lg">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                  <h2 className="text-xl font-bold mb-4 sm:mb-0">
                    Filter Daftar Pesanan
                  </h2>
                  <button
                    onClick={handleExportPDF}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-green-700 transition-colors duration-200"
                  >
                    <FileText className="mr-2 h-5 w-5" /> Export PDF
                  </button>
                </div>

                <div className="flex space-x-4 mb-4 border-b border-gray-200 pb-2">
                  <button
                    onClick={() => setFilterType("monthly")}
                    className={`flex items-center gap-2 pb-2 px-2 transition-colors ${
                      filterType === "monthly"
                        ? "border-b-2 border-black font-bold text-black"
                        : "text-gray-500 hover:text-black"
                    }`}
                  >
                    <CalendarDays size={18} />
                    Monthly
                  </button>
                  <button
                    onClick={() => setFilterType("daily")}
                    className={`flex items-center gap-2 pb-2 px-2 transition-colors ${
                      filterType === "daily"
                        ? "border-b-2 border-black font-bold text-black"
                        : "text-gray-500 hover:text-black"
                    }`}
                  >
                    <Calendar size={18} />
                    Specific Date
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-center animate-fade-in">
                  {filterType === "monthly" ? (
                    <>
                      <select
                        value={listYear}
                        onChange={(e) => setListYear(parseInt(e.target.value))}
                        className="w-full sm:w-auto bg-white border border-black rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-black"
                      >
                        {years.map((year) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                      <select
                        value={listMonthStart}
                        onChange={(e) =>
                          setListMonthStart(parseInt(e.target.value))
                        }
                        className="w-full sm:w-auto bg-white border border-black rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-black"
                      >
                        {Array.from({ length: 12 }, (_, i) => (
                          <option key={i + 1} value={i + 1}>
                            {new Date(0, i).toLocaleString("id-ID", {
                              month: "long",
                            })}
                          </option>
                        ))}
                      </select>
                      <span className="text-gray-600">to</span>
                      <select
                        value={listMonthEnd}
                        onChange={(e) =>
                          setListMonthEnd(parseInt(e.target.value))
                        }
                        className="w-full sm:w-auto bg-white border border-black rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-black"
                      >
                        {Array.from({ length: 12 }, (_, i) => (
                          <option key={i + 1} value={i + 1}>
                            {new Date(0, i).toLocaleString("id-ID", {
                              month: "long",
                            })}
                          </option>
                        ))}
                      </select>
                    </>
                  ) : (
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                      <label className="font-semibold text-gray-700">Choose Date:</label>
                      <input
                        type="date"
                        value={specificDate}
                        onChange={(e) => setSpecificDate(e.target.value)}
                        className="bg-white border border-black rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-black"
                      />
                      <span className="text-sm text-gray-500 ml-2">(Showing data: {new Date(specificDate).toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" })})</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t-2 border-black pt-8">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
                  Order Details
                  <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded">Total: {filteredCheckoutsForList.length} Orders</span>
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <LaporanSection
                    title="Processed Orders"
                    orders={filteredCheckoutsForList.filter((o) => o.status === "diproses")}
                    onOrderClick={setSelectedOrder}
                  />
                  <LaporanSection
                    title="Sent Orders"
                    orders={filteredCheckoutsForList.filter((o) => o.status === "dikirim")}
                    onOrderClick={setSelectedOrder}
                  />
                  <LaporanSection
                    title="Completed Orders"
                    orders={filteredCheckoutsForList.filter((o) => ["selesai", "sampai"].includes(o.status))}
                    onOrderClick={setSelectedOrder}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      <OrderDetailModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </>
  );
};

export default LaporanPesananAdmin;