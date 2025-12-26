import React, { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { Bar } from "react-chartjs-2";
import { X, ArrowLeft, FileText, Calendar, CalendarDays } from "lucide-react";
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
import { janAgroLogoBase64 } from "./logoBase64";

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
    if (paymentType && paymentType !== 'null' && paymentType.trim()) {
      return paymentMap[paymentType] || paymentType;
    }
    if (metodePembayaran && metodePembayaran !== 'Online Payment') {
      return metodePembayaran;
    }
    return 'Online Payment';
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[60] p-4"
      onClick={onClose}
    >
      {/* Modal Responsive Width & Height */}
      <div
        className="bg-white text-black p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border-2 border-black relative animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-black bg-gray-100 rounded-full p-1 transition-colors"
        >
          <X size={20} />
        </button>
        <div className="border-b-2 border-black pb-4 mb-6 pr-8">
          <h2 className="text-2xl sm:text-3xl font-bold">Detail Pesanan</h2>
          <p className="text-gray-600 text-sm sm:text-base break-all">ORDER #{order.id}</p>
        </div>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold mb-2">Informasi Pengiriman</h3>
            <div className="text-sm space-y-1 bg-gray-50 p-3 rounded border border-gray-200">
              <p>
                <span className="font-semibold">Nama:</span> {order.nama}
              </p>
              <p>
                <span className="font-semibold">Telepon:</span>
                {order.noTelpPenerima}
              </p>
              <p className="break-words">
                <span className="font-semibold">Alamat:</span> {order.alamat}
              </p>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-2">Item yang Dipesan</h3>
            <div className="divide-y divide-gray-200 border-y border-gray-200">
              {order.items.map((item) => (
                <div
                  key={item._id || item.product}
                  className="flex justify-between items-start py-3 text-sm gap-4"
                >
                  <div>
                    <p className="font-bold">{item.name}</p>
                    <p className="text-gray-500">
                      {item.quantity} x Rp {item.price.toLocaleString("id-ID")}
                    </p>
                  </div>
                  <p className="font-semibold whitespace-nowrap">
                    Rp {(item.quantity * item.price).toLocaleString("id-ID")}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-2">Ringkasan Pembayaran</h3>
            <div className="space-y-2 text-sm bg-gray-50 p-3 rounded border border-gray-200">
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
                  <span className="text-gray-600">
                    Diskon ({order.kodeVoucher}):
                  </span>
                  <span className="text-green-600">
                    - Rp {order.diskon.toLocaleString("id-ID")}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Biaya Kurir:</span>
                <span>
                  Rp{" "}
                  {order.kurir?.biaya
                    ? order.kurir.biaya.toLocaleString("id-ID")
                    : 0}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold border-t border-black pt-2 mt-2">
                <span>Total Harga:</span>
                <span>Rp {order.totalHarga.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Metode:</span>
                <span className="font-semibold bg-black text-white px-2 py-0.5 rounded text-xs">
                  {getPaymentMethodDisplay(order.paymentType, order.metodePembayaran)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const LaporanSection = ({ title, orders, onOrderClick }) => (
  <div className="bg-white p-4 sm:p-6 rounded-lg border border-black shadow-sm">
    <h2 className="text-lg sm:text-xl font-bold mb-4 border-b border-black pb-2 flex justify-between items-center">
      <span>{title}</span>
      <span className="bg-gray-200 text-xs px-2 py-1 rounded-full text-gray-700">{orders.length}</span>
    </h2>
    {orders.length > 0 ? (
      <div className="divide-y divide-gray-300 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
        {orders.map((order) => (
          <button
            key={order.id}
            onClick={() => onOrderClick(order)}
            className="w-full text-left py-3 px-2 hover:bg-gray-50 transition-colors rounded-sm"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-black text-sm">#{order.id.substring(0, 8)}</p>
                <p className="text-xs text-gray-600 line-clamp-1">{order.nama}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-black text-sm">
                  Rp {order.totalHarga.toLocaleString("id-ID")}
                </p>
                <p className="text-[10px] text-gray-500">
                  {new Date(order.tanggal).toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "short",
                  })}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    ) : (
      <p className="text-gray-500 italic text-sm text-center py-4">
        Tidak ada pesanan.
      </p>
    )}
  </div>
);

const LaporanPesananCeo = () => {
  const dispatch = useDispatch();
  const { ceoReportData, loading } = useSelector((state) => state.admin);
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

  useEffect(() => {
    dispatch(fetchCeoReport({}));
  }, [dispatch]);

  const reportData = ceoReportData || [];
  const years = useMemo(() => {
    const uniqueYears = new Set(
      reportData.map((c) => new Date(c.tanggal).getFullYear())
    );
    uniqueYears.add(new Date().getFullYear());
    return Array.from(uniqueYears).sort((a, b) => b - a);
  }, [reportData]);

  const filteredCheckoutsForList = useMemo(() => {
    return reportData.filter((checkout) => {
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
    reportData,
    filterType,
    specificDate,
    listYear,
    listMonthStart,
    listMonthEnd,
  ]);

  const chartData = useMemo(() => {
    const successfulPurchases = Array(12).fill(0);
    const failedPurchases = Array(12).fill(0);
    reportData.forEach((checkout) => {
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
        label: "Pembelian Berhasil",
        data: successfulPurchases,
        backgroundColor: "rgba(34, 197, 94, 0.8)",
      },
      {
        label: "Pembelian Gagal/Batal",
        data: failedPurchases,
        backgroundColor: "rgba(239, 68, 68, 0.8)",
      },
    ];
    let filteredDatasets;
    if (purchaseFilter === "success") filteredDatasets = [datasets[0]];
    else if (purchaseFilter === "failed") filteredDatasets = [datasets[1]];
    else filteredDatasets = datasets;
    return {
      labels: [
        "Jan", "Feb", "Mar", "Apr", "Mei", "Jun", 
        "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
      ],
      datasets: filteredDatasets,
    };
  }, [reportData, chartYear, purchaseFilter]);

  const handleExportPDF = () => {
    const doc = new jsPDF();
    
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
      if (paymentType && paymentType !== 'null' && paymentType.trim && paymentType.trim()) {
        return paymentMap[paymentType] || paymentType;
      }
      if (metodePembayaran && metodePembayaran !== 'Online Payment') {
        return metodePembayaran;
      }
      return 'Online Payment';
    };

    const tableColumn = [
      "ID Pesanan",
      "Nama Pelanggan",
      "Item Dipesan",
      "Tanggal",
      "Metode Pembayaran",
      "Total Harga",
      "Status",
    ];
    const tableRows = [];

    filteredCheckoutsForList.forEach((order) => {
      const itemsString =
        order.items && order.items.length > 0
          ? order.items
              .map((item) => `• ${item.name} (${item.quantity}x)`)
              .join("\n")
          : "-";
      const orderData = [
        `#${order.id.substring(0, 8)}`,
        order.nama,
        itemsString,
        new Date(order.tanggal).toLocaleDateString("id-ID", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        getPaymentMethodDisplay(order.paymentType, order.metodePembayaran),
        `Rp ${order.totalHarga.toLocaleString("id-ID")}`,
        order.status.charAt(0).toUpperCase() + order.status.slice(1),
      ];
      tableRows.push(orderData);
    });

    const filterTitle =
      filterType === "daily"
        ? `Harian (${new Date(specificDate).toLocaleDateString("id-ID", {
            dateStyle: "long",
          })})`
        : `Bulanan`;
    const date = new Date();
    const fullDate = `${date.getDate()}-${
      date.getMonth() + 1
    }-${date.getFullYear()}`;

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 45,
      margin: { top: 45 },
      theme: "grid",
      styles: {
        font: "helvetica",
        fontSize: 8,
        cellPadding: 2,
        valign: "middle",
      },
      headStyles: {
        fillColor: [41, 41, 41],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      columnStyles: { 2: { cellWidth: 50 } },
      didDrawPage: function (data) {
        const logoWidth = 22;
        const logoHeight = 22;
        const margin = data.settings.margin.left;
        const pageWidth = doc.internal.pageSize.getWidth();

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
          console.error("Failed to add logo to PDF:", e);
        }

        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("PT. Jan Agro Nusantara", margin + logoWidth + 5, 16);
        doc.setFontSize(10);
        doc.text(
          `Laporan Pesanan - ${filterTitle}`,
          margin + logoWidth + 5,
          21
        );

        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.text(
          "Jan Agro Nusantara Indonesia Pondok Chandra Indah No. 69 Surabaya 10130, Indonesia",
          margin + logoWidth + 5,
          26
        );
        doc.text(
          "Email: janagronusantara@gmail.com | Contact Person: +62 811 762 788",
          margin + logoWidth + 5,
          30
        );

        doc.setDrawColor(0, 0, 0);
        doc.line(margin, 35, pageWidth - data.settings.margin.right, 35);

        if (data.pageNumber === doc.internal.getNumberOfPages()) {
          const pageHeight = doc.internal.pageSize.getHeight();
          let finalY = data.cursor.y;
          if (finalY + 60 > pageHeight) {
            doc.addPage();
            finalY = data.settings.margin.top;
          }

          const signatureX = pageWidth - data.settings.margin.right;
          const currentDate = new Date().toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
          });

          doc.setFontSize(10);
          doc.setFont("helvetica", "normal");
          doc.text(`Surabaya, ${currentDate}`, signatureX, finalY + 20, {
            align: "right",
          });
          doc.setFont("helvetica", "bold");
          doc.text("J.Alamsjah, S.H", signatureX, finalY + 45, {
            align: "right",
          });
          const nameWidth = doc.getTextWidth("J.Alamsjah, S.H");
          doc.setLineWidth(0.5);
          doc.line(
            signatureX - nameWidth,
            finalY + 46,
            signatureX,
            finalY + 46
          );
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          doc.text("Ceo & Founder", signatureX, finalY + 50, {
            align: "right",
          });
        }
      },
    });
    doc.save(`laporan_pesanan_${filterType}_${fullDate}.pdf`);
  };

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
      <div className="bg-white min-h-screen pt-20 sm:pt-24 text-black">
        <div className="max-w-7xl mx-auto space-y-8 px-4 sm:px-6 lg:px-8 pb-12">
          {/* Header */}
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center border-b-4 border-black pb-4 gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight">
                Laporan Pesanan
              </h1>
              <p className="text-gray-600 font-medium mt-1 text-sm sm:text-base">
                Analisis dan rekapitulasi data pesanan.
              </p>
            </div>
            <Link
              to="/ceo"
              className="flex w-full md:w-auto items-center justify-center bg-black text-white px-5 py-2.5 rounded-lg font-bold hover:bg-gray-800 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Kembali
            </Link>
          </header>

          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-black border-t-transparent"></div>
              <p className="mt-2 text-gray-600">Memuat data laporan...</p>
            </div>
          ) : (
            <>
              {/* Chart Section */}
              <div className="bg-white p-4 sm:p-6 rounded-lg border-2 border-black space-y-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold mb-4">
                    Filter Diagram Pembelian
                  </h2>
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
                      <option value="all">Semua Pembelian</option>
                      <option value="success">Pembelian Berhasil</option>
                      <option value="failed">Pembelian Gagal</option>
                    </select>
                  </div>
                </div>
                <div className="h-64 sm:h-96 relative w-full">
                  <Bar data={chartData} options={chartOptions} />
                </div>
              </div>

              {/* Filter List & PDF */}
              <div className="bg-white border-2 border-black p-4 sm:p-6 rounded-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                  <h2 className="text-lg sm:text-xl font-bold">
                    Filter Daftar Pesanan
                  </h2>
                  <button
                    onClick={handleExportPDF}
                    className="w-full sm:w-auto bg-green-600 text-white px-4 py-2 rounded-lg flex items-center justify-center hover:bg-green-700 transition-colors duration-200"
                  >
                    <FileText className="mr-2 h-5 w-5" /> Export PDF
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 mb-4 border-b border-gray-200 pb-2">
                  <button
                    onClick={() => setFilterType("monthly")}
                    className={`flex items-center gap-2 pb-2 px-2 transition-colors text-sm sm:text-base ${
                      filterType === "monthly"
                        ? "border-b-2 border-black font-bold text-black"
                        : "text-gray-500 hover:text-black"
                    }`}
                  >
                    <CalendarDays size={18} />
                    Per Bulan
                  </button>
                  <button
                    onClick={() => setFilterType("daily")}
                    className={`flex items-center gap-2 pb-2 px-2 transition-colors text-sm sm:text-base ${
                      filterType === "daily"
                        ? "border-b-2 border-black font-bold text-black"
                        : "text-gray-500 hover:text-black"
                    }`}
                  >
                    <Calendar size={18} />
                    Per Tanggal
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-end sm:items-center animate-fade-in">
                  {filterType === "monthly" ? (
                    <div className="flex flex-col sm:flex-row gap-3 w-full">
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
                      <div className="flex gap-2 items-center w-full sm:w-auto">
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
                                month: "short",
                              })}
                            </option>
                          ))}
                        </select>
                        <span className="text-gray-600">-</span>
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
                                month: "short",
                              })}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
                      <input
                        type="date"
                        value={specificDate}
                        onChange={(e) => setSpecificDate(e.target.value)}
                        className="w-full sm:w-auto bg-white border border-black rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Order Lists Grid */}
              <div className="border-t-2 border-black pt-8">
                <h2 className="text-2xl sm:text-3xl font-bold mb-6 flex flex-wrap items-center gap-2">
                  Detail Pesanan
                  <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    Total: {filteredCheckoutsForList.length} Pesanan
                  </span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <LaporanSection
                    title="Pesanan Diproses"
                    orders={filteredCheckoutsForList.filter(
                      (o) => o.status === "diproses"
                    )}
                    onOrderClick={setSelectedOrder}
                  />
                  <LaporanSection
                    title="Pesanan Dikirim"
                    orders={filteredCheckoutsForList.filter(
                      (o) => o.status === "dikirim"
                    )}
                    onOrderClick={setSelectedOrder}
                  />
                  <LaporanSection
                    title="Pesanan Selesai"
                    orders={filteredCheckoutsForList.filter((o) =>
                      ["selesai", "sampai"].includes(o.status)
                    )}
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
export default LaporanPesananCeo;