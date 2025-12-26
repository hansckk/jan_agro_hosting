import React, { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { Bar } from "react-chartjs-2";
import { ArrowLeft, FileText, Calendar, CalendarDays, DollarSign } from "lucide-react";
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

const LaporanRevenueCeo = () => {
  const dispatch = useDispatch();
  const { ceoReportData, loading } = useSelector((state) => state.admin);
  const [filterType, setFilterType] = useState("monthly");
  const [listYear, setListYear] = useState(new Date().getFullYear());
  const [listMonthStart, setListMonthStart] = useState(1);
  const [listMonthEnd, setListMonthEnd] = useState(12);
  const [specificDate, setSpecificDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [chartYear, setChartYear] = useState(new Date().getFullYear());

  useEffect(() => {
    dispatch(fetchCeoReport({}));
  }, [dispatch]);

  const reportData = useMemo(() => ceoReportData || [], [ceoReportData]);
  
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

  const revenueStats = useMemo(() => {
    const successfulOrders = filteredCheckoutsForList.filter((order) =>
      ["selesai", "sampai"].includes(order.status)
    );
    const totalRevenue = successfulOrders.reduce(
      (sum, order) => sum + order.totalHarga,
      0
    );
    const totalOrders = filteredCheckoutsForList.length;
    const averageOrderValue =
      successfulOrders.length > 0 ? totalRevenue / successfulOrders.length : 0;

    return {
      totalRevenue,
      successfulOrders: successfulOrders.length,
      totalOrders,
      averageOrderValue,
    };
  }, [filteredCheckoutsForList]);

  const chartData = useMemo(() => {
    const monthlyRevenue = Array(12).fill(0);
    reportData.forEach((checkout) => {
      const checkoutDate = new Date(checkout.tanggal);
      if (checkoutDate.getFullYear() === chartYear) {
        if (["selesai", "sampai"].includes(checkout.status)) {
          const month = checkoutDate.getMonth();
          monthlyRevenue[month] += checkout.totalHarga;
        }
      }
    });

    return {
      labels: [
        "Jan", "Feb", "Mar", "Apr", "Mei", "Jun", 
        "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
      ],
      datasets: [
        {
          label: "Omzet Bulanan (Rp)",
          data: monthlyRevenue,
          backgroundColor: "rgba(34, 197, 94, 0.8)",
          borderColor: "rgba(34, 197, 94, 1)",
          borderWidth: 2,
        },
      ],
    };
  }, [reportData, chartYear]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true },
      title: {
        display: true,
        text: `Grafik Omzet Tahun ${chartYear}`,
        font: { size: 16, weight: "bold" },
        color: "#000",
      },
    },
    scales: {
      x: {
        ticks: { color: "#000", font: { weight: "bold" } },
        grid: { display: false },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: "#000",
          callback: function (value) {
            return "Rp " + value.toLocaleString("id-ID");
          },
        },
        grid: { color: "#e5e5e5" },
      },
    },
  };

  const handleExportPDF = () => {
    const doc = new jsPDF("l");
    const tableColumn = [
      "No",
      "ID Pesanan",
      "Nama Pelanggan",
      "Tanggal",
      "Total Pesanan",
      "Diskon",
      "Omzet",
      "Status",
    ];
    const tableRows = [];

    filteredCheckoutsForList.forEach((order, idx) => {
      const orderData = [
        idx + 1,
        `#${order._id.substring(0, 8)}`,
        order.nama,
        new Date(order.tanggal).toLocaleDateString("id-ID", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
        `Rp ${order.totalHarga.toLocaleString("id-ID")}`,
        order.diskon > 0
          ? `Rp ${order.diskon.toLocaleString("id-ID")}`
          : "-",
        `Rp ${(order.totalHarga - (order.diskon || 0)).toLocaleString("id-ID")}`,
        order.status.charAt(0).toUpperCase() + order.status.slice(1),
      ];
      tableRows.push(orderData);
    });

    const filterTitle =
      filterType === "daily"
        ? `Harian (${new Date(specificDate).toLocaleDateString("id-ID", {
            dateStyle: "long",
          })})`
        : `Bulanan (${listMonthStart}/${listYear} - ${listMonthEnd}/${listYear})`;

    const date = new Date();
    const fullDate = `${date.getDate()}-${
      date.getMonth() + 1
    }-${date.getFullYear()}`;

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 60,
      margin: { top: 60 },
      theme: "grid",
      styles: {
        font: "helvetica",
        fontSize: 8,
        cellPadding: 2,
        valign: "middle",
      },
      headStyles: {
        fillColor: [34, 197, 94],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
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
        } catch {
          // Logo load error silently handled
        }

        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("PT. Jan Agro Nusantara", margin + logoWidth + 5, 16);
        doc.setFontSize(10);
        doc.text(
          `Laporan Revenue - ${filterTitle}`,
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
        doc.setLineWidth(1);
        doc.line(margin, 35, pageWidth - data.settings.margin.right, 35);

        // Summary box
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.text(`Total Omzet: Rp ${revenueStats.totalRevenue.toLocaleString("id-ID")}`, margin, 45);
        doc.text(
          `Pesanan Berhasil: ${revenueStats.successfulOrders}`,
          margin + 80,
          45
        );
        doc.text(
          `Rata-rata Omzet: Rp ${revenueStats.averageOrderValue.toLocaleString("id-ID")}`,
          margin + 150,
          45
        );

        if (data.pageNumber === doc.internal.getNumberOfPages()) {
          const pageHeight = doc.internal.pageSize.getHeight();
          let finalY = data.cursor.y + 15;
          if (finalY + 40 > pageHeight) {
            doc.addPage();
            finalY = 40;
          }

          const signatureX = pageWidth - data.settings.margin.right;
          const currentDate = new Date().toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
          });

          doc.setFontSize(10);
          doc.setFont("helvetica", "normal");
          doc.text(`Surabaya, ${currentDate}`, signatureX, finalY, {
            align: "right",
          });
          doc.setFont("helvetica", "bold");
          doc.text("J.Alamsjah, S.H", signatureX, finalY + 20, {
            align: "right",
          });
          const nameWidth = doc.getTextWidth("J.Alamsjah, S.H");
          doc.setLineWidth(0.5);
          doc.line(signatureX - nameWidth, finalY + 21, signatureX, finalY + 21);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          doc.text("Ceo & Founder", signatureX, finalY + 25, {
            align: "right",
          });
        }
      },
    });
    doc.save(`laporan_revenue_${filterType}_${fullDate}.pdf`);
  };

  return (
    <div className="bg-white min-h-screen pt-20 sm:pt-24 text-black font-sans pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header - Responsive */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center border-b-4 border-black pb-4 gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight">
              Revenue Report
            </h1>
            <p className="text-gray-600 font-medium mt-1 text-sm sm:text-base">
              Analisis omzet dan pendapatan berdasarkan pesanan yang berhasil.
            </p>
          </div>
          <Link
            to="/ceo"
            className="flex w-full md:w-auto justify-center items-center bg-black text-white px-5 py-2.5 rounded-lg font-bold hover:bg-gray-800 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
          >
            <ArrowLeft className="mr-2 h-5 w-5" /> BACK
          </Link>
        </header>

        {/* Revenue Stats Cards - Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border-2 border-black p-6 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center justify-between">
              <div className="overflow-hidden">
                <p className="text-gray-600 text-xs font-bold uppercase truncate">TOTAL OMZET</p>
                <p className="text-2xl font-black break-words">
                  Rp {revenueStats.totalRevenue.toLocaleString("id-ID")}
                </p>
              </div>
              <DollarSign className="h-10 w-10 sm:h-12 sm:w-12 text-green-600 shrink-0" />
            </div>
          </div>
          <div className="bg-white border-2 border-black p-6 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs font-bold uppercase">PESANAN BERHASIL</p>
                <p className="text-3xl font-black">{revenueStats.successfulOrders}</p>
              </div>
              <Calendar className="h-10 w-10 sm:h-12 sm:w-12 text-blue-600 shrink-0" />
            </div>
          </div>
          <div className="bg-white border-2 border-black p-6 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs font-bold uppercase">TOTAL PESANAN</p>
                <p className="text-3xl font-black">{revenueStats.totalOrders}</p>
              </div>
              <FileText className="h-10 w-10 sm:h-12 sm:w-12 text-purple-600 shrink-0" />
            </div>
          </div>
          <div className="bg-white border-2 border-black p-6 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center justify-between">
              <div className="overflow-hidden">
                <p className="text-gray-600 text-xs font-bold uppercase truncate">RATA-RATA OMZET</p>
                <p className="text-2xl font-black break-words">
                  Rp {revenueStats.averageOrderValue.toLocaleString("id-ID")}
                </p>
              </div>
              <DollarSign className="h-10 w-10 sm:h-12 sm:w-12 text-yellow-600 shrink-0" />
            </div>
          </div>
        </div>

        {/* Chart */}
        {loading ? (
          <div className="flex justify-center items-center h-64 border-2 border-black rounded-lg bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-black border-t-transparent"></div>
          </div>
        ) : (
          <div className="bg-white border-2 border-black p-4 sm:p-6 rounded-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="h-64 sm:h-80 w-full">
              <Bar data={chartData} options={chartOptions} />
            </div>
          </div>
        )}

        {/* Filter & Export */}
        <div className="bg-white border-2 border-black p-4 sm:p-6 rounded-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-6 border-b-2 border-gray-200 pb-4 gap-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Calendar className="h-6 w-6" /> Filter Laporan
            </h2>
            <div className="flex bg-gray-100 p-1 rounded-md border border-black w-full md:w-auto gap-2">
              {[
                { id: "daily", label: "Harian", icon: <CalendarDays size={16} /> },
                { id: "monthly", label: "Bulanan", icon: <Calendar size={16} /> },
              ].map((type) => (
                <button
                  key={type.id}
                  onClick={() => setFilterType(type.id)}
                  className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded text-sm font-bold transition-all whitespace-nowrap ${
                    filterType === type.id
                      ? "bg-black text-white shadow-md"
                      : "text-gray-600 hover:text-black"
                  }`}
                >
                  {type.icon} {type.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap gap-4 items-end">
            {filterType === "daily" && (
              <div className="flex flex-col w-full sm:w-auto">
                <label className="text-xs font-bold uppercase mb-1">
                  Pilih Tanggal
                </label>
                <input
                  type="date"
                  value={specificDate}
                  onChange={(e) => setSpecificDate(e.target.value)}
                  className="border-2 border-black rounded px-3 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-black w-full"
                />
              </div>
            )}

            {filterType === "monthly" && (
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <div className="flex flex-col w-full sm:w-auto">
                  <label className="text-xs font-bold uppercase mb-1">
                    Bulan Mulai
                  </label>
                  <select
                    value={listMonthStart}
                    onChange={(e) => setListMonthStart(parseInt(e.target.value))}
                    className="border-2 border-black rounded px-3 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-black w-full sm:min-w-[140px]"
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {new Date(0, i).toLocaleString("id-ID", {
                          month: "long",
                        })}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col w-full sm:w-auto">
                  <label className="text-xs font-bold uppercase mb-1">
                    Bulan Akhir
                  </label>
                  <select
                    value={listMonthEnd}
                    onChange={(e) => setListMonthEnd(parseInt(e.target.value))}
                    className="border-2 border-black rounded px-3 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-black w-full sm:min-w-[140px]"
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {new Date(0, i).toLocaleString("id-ID", {
                          month: "long",
                        })}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col w-full sm:w-auto">
                  <label className="text-xs font-bold uppercase mb-1">
                    Tahun
                  </label>
                  <select
                    value={listYear}
                    onChange={(e) => setListYear(parseInt(e.target.value))}
                    className="border-2 border-black rounded px-3 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-black w-full sm:min-w-[100px]"
                  >
                    {years.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div className="flex flex-col w-full sm:w-auto">
              <label className="text-xs font-bold uppercase mb-1">
                Grafik Tahun
              </label>
              <select
                value={chartYear}
                onChange={(e) => setChartYear(parseInt(e.target.value))}
                className="border-2 border-black rounded px-3 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-black w-full sm:min-w-[100px]"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleExportPDF}
              className="ml-auto w-full sm:w-auto bg-green-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-green-700 transition-all border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] flex items-center justify-center gap-2 mt-4 sm:mt-0"
            >
              <FileText size={20} /> Export PDF
            </button>
          </div>
        </div>

        {/* Revenue Table */}
        {loading ? (
          <div className="flex justify-center items-center h-64 border-2 border-black rounded-lg bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-black border-t-transparent"></div>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-black uppercase flex items-center gap-2">
              <DollarSign className="text-green-600" /> Detail Omzet
            </h2>
            <div className="bg-white border-2 border-black rounded-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
              <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                <table className="w-full text-left border-collapse min-w-[900px]">
                  <thead className="bg-green-600 text-white sticky top-0 z-10">
                    <tr>
                      <th className="p-4 font-bold border-r border-gray-700 w-16 text-center">
                        #
                      </th>
                      <th className="p-4 font-bold border-r border-gray-700">
                        ID Pesanan
                      </th>
                      <th className="p-4 font-bold border-r border-gray-700">
                        Nama Pelanggan
                      </th>
                      <th className="p-4 font-bold border-r border-gray-700">
                        Tanggal
                      </th>
                      <th className="p-4 font-bold border-r border-gray-700 text-right">
                        Total Pesanan
                      </th>
                      <th className="p-4 font-bold border-r border-gray-700 text-right">
                        Diskon
                      </th>
                      <th className="p-4 font-bold border-r border-gray-700 text-right">
                        Omzet
                      </th>
                      <th className="p-4 font-bold text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCheckoutsForList.length > 0 ? (
                      filteredCheckoutsForList.map((order, idx) => (
                        <tr
                          key={order._id}
                          className="border-b-2 border-gray-200 hover:bg-gray-50 transition-colors"
                        >
                          <td className="p-4 font-black text-center border-r-2 border-gray-200 text-lg">
                            {idx + 1}
                          </td>
                          <td className="p-4 border-r-2 border-gray-200 font-mono font-bold whitespace-nowrap">
                            #{order._id.substring(0, 8)}
                          </td>
                          <td className="p-4 border-r-2 border-gray-200 font-bold whitespace-nowrap">
                            {order.nama}
                          </td>
                          <td className="p-4 border-r-2 border-gray-200 text-sm whitespace-nowrap">
                            {new Date(order.tanggal).toLocaleDateString(
                              "id-ID"
                            )}
                          </td>
                          <td className="p-4 border-r-2 border-gray-200 text-right font-mono whitespace-nowrap">
                            Rp {order.totalHarga.toLocaleString("id-ID")}
                          </td>
                          <td className="p-4 border-r-2 border-gray-200 text-right font-mono text-orange-600 whitespace-nowrap">
                            {order.diskon > 0
                              ? `Rp ${order.diskon.toLocaleString("id-ID")}`
                              : "-"}
                          </td>
                          <td className="p-4 border-r-2 border-gray-200 text-right font-mono font-bold text-green-700 whitespace-nowrap">
                            Rp{" "}
                            {(
                              order.totalHarga -
                              (order.diskon || 0)
                            ).toLocaleString("id-ID")}
                          </td>
                          <td className="p-4 text-center">
                            <span
                              className={`px-3 py-1 rounded-full font-bold text-white text-xs whitespace-nowrap ${
                                ["selesai", "sampai"].includes(
                                  order.status
                                )
                                  ? "bg-green-600"
                                  : "bg-red-600"
                              }`}
                            >
                              {order.status
                                .charAt(0)
                                .toUpperCase() + order.status.slice(1)}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="8"
                          className="p-8 text-center text-gray-500 italic font-medium"
                        >
                          Tidak ada data omzet pada periode ini.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LaporanRevenueCeo;