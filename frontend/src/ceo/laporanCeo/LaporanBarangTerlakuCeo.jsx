import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Bar } from "react-chartjs-2";
import {
  ArrowLeft,
  FileText,
  Package,
  Calendar,
  CalendarDays,
  Clock,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useDispatch, useSelector } from "react-redux";
import { fetchBestSellingReport } from "../../features/admin/adminSlice";
import { janAgroLogoBase64 } from "./logoBase64";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const LaporanBarangTerlakuCeo = () => {
  const dispatch = useDispatch();
  const { bestSellingData, loading } = useSelector((state) => state.admin);
  const [filterType, setFilterType] = useState("monthly");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    let startDate, endDate;
    const dateObj = new Date(selectedDate);
    if (filterType === "daily") {
      startDate = new Date(selectedDate);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(selectedDate);
      endDate.setHours(23, 59, 59, 999);
    } else if (filterType === "weekly") {
      const day = dateObj.getDay();
      const diff = dateObj.getDate() - day + (day === 0 ? -6 : 1);
      startDate = new Date(dateObj.setDate(diff));
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
    } else if (filterType === "monthly") {
      startDate = new Date(selectedYear, selectedMonth - 1, 1);
      endDate = new Date(selectedYear, selectedMonth, 0, 23, 59, 59);
    } else if (filterType === "yearly") {
      startDate = new Date(selectedYear, 0, 1);
      endDate = new Date(selectedYear, 11, 31, 23, 59, 59);
    }
    dispatch(
      fetchBestSellingReport({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      })
    );
  }, [dispatch, filterType, selectedDate, selectedMonth, selectedYear]);

  const chartData = useMemo(() => {
    const top10 = bestSellingData.slice(0, 10);
    return {
      labels: top10.map(
        (item) =>
          item.productName.substring(0, 15) +
          (item.productName.length > 15 ? "..." : "")
      ),
      datasets: [
        {
          label: "Jumlah Terjual (Qty)",
          data: top10.map((item) => item.totalSold),
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          borderColor: "rgba(0, 0, 0, 1)",
          borderWidth: 2,
        },
      ],
    };
  }, [bestSellingData]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: "Top 10 Produk Paling Laris",
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
        ticks: { color: "#000", stepSize: 1 },
        grid: { color: "#e5e5e5" },
      },
    },
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const tableColumn = [
      "Rank",
      "Nama Produk",
      "Harga Satuan",
      "Total Terjual",
      "Estimasi Omzet",
    ];
    const tableRows = [];

    bestSellingData.forEach((item, index) => {
      const rowData = [
        index + 1,
        item.productName,
        `Rp ${item.productPrice.toLocaleString("id-ID")}`,
        `${item.totalSold} pcs`,
        `Rp ${item.totalRevenue.toLocaleString("id-ID")}`,
      ];
      tableRows.push(rowData);
    });

    let filterTitle = "";
    if (filterType === "daily")
      filterTitle = `Harian (${new Date(selectedDate).toLocaleDateString(
        "id-ID"
      )})`;
    else if (filterType === "monthly")
      filterTitle = `Bulanan (${selectedMonth}/${selectedYear})`;
    else if (filterType === "yearly") filterTitle = `Tahunan (${selectedYear})`;
    else filterTitle = "Mingguan";

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
        fontSize: 9,
        cellPadding: 3,
        textColor: [0, 0, 0],
        valign: "middle",
      },
      headStyles: {
        fillColor: [20, 20, 20],
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
        } catch (e) {
          console.error("Failed to add logo to PDF:", e);
        }

        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("PT. Jan Agro Nusantara", margin + logoWidth + 5, 16);
        doc.setFontSize(10);
        doc.text(
          `Laporan Barang Terlaku - ${filterTitle}`,
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
          doc.line(
            signatureX - nameWidth,
            finalY + 21,
            signatureX,
            finalY + 21
          );
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          doc.text("Ceo & Founder", signatureX, finalY + 25, {
            align: "right",
          });
        }
      },
    });
    doc.save(`laporan_barang_terlaku_${filterType}_${fullDate}.pdf`);
  };

  return (
    <div className="bg-white min-h-screen pt-20 sm:pt-24 text-black font-sans pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center border-b-4 border-black pb-4 gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight">
              Best Selling Products
            </h1>
            <p className="text-gray-600 font-medium mt-1 text-sm sm:text-base">
              Analisis performa penjualan produk tertinggi.
            </p>
          </div>
          <Link
            to="/ceo"
            className="flex w-full md:w-auto justify-center items-center bg-black text-white px-5 py-2.5 rounded-lg font-bold hover:bg-gray-800 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
          >
            <ArrowLeft className="mr-2 h-5 w-5" /> BACK
          </Link>
        </header>

        {/* Filter Section */}
        <div className="bg-white border-2 border-black p-4 sm:p-6 rounded-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 border-b-2 border-gray-200 pb-4 gap-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Calendar className="h-6 w-6" /> Filter Laporan
            </h2>
            
            {/* Scrollable Buttons on Mobile */}
            <div className="flex bg-gray-100 p-1 rounded-md border border-black w-full lg:w-auto overflow-x-auto no-scrollbar">
              {[
                { id: "daily", label: "Harian", icon: <Clock size={16} /> },
                {
                  id: "weekly",
                  label: "Mingguan",
                  icon: <CalendarDays size={16} />,
                },
                {
                  id: "monthly",
                  label: "Bulanan",
                  icon: <Calendar size={16} />,
                },
                {
                  id: "yearly",
                  label: "Tahunan",
                  icon: <Calendar size={16} />,
                },
              ].map((type) => (
                <button
                  key={type.id}
                  onClick={() => setFilterType(type.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-bold transition-all whitespace-nowrap ${
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
            {(filterType === "daily" || filterType === "weekly") && (
              <div className="flex flex-col w-full sm:w-auto">
                <label className="text-xs font-bold uppercase mb-1">
                  Pilih Tanggal
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="border-2 border-black rounded px-3 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-black w-full"
                />
                {filterType === "weekly" && (
                  <span className="text-xs text-gray-500 mt-1">
                    *1 Minggu (Senin-Minggu)
                  </span>
                )}
              </div>
            )}
            
            {filterType === "monthly" && (
              <div className="flex gap-4 w-full sm:w-auto">
                <div className="flex flex-col w-full sm:w-auto">
                  <label className="text-xs font-bold uppercase mb-1">
                    Bulan
                  </label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    className="border-2 border-black rounded px-3 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-black w-full sm:min-w-[150px]"
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
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="border-2 border-black rounded px-3 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-black w-full sm:min-w-[100px]"
                  >
                    {Array.from(
                      { length: 5 },
                      (_, i) => new Date().getFullYear() - i
                    ).map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {filterType === "yearly" && (
              <div className="flex flex-col w-full sm:w-auto">
                <label className="text-xs font-bold uppercase mb-1">
                  Tahun
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="border-2 border-black rounded px-3 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-black w-full sm:min-w-[100px]"
                >
                  {Array.from(
                    { length: 5 },
                    (_, i) => new Date().getFullYear() - i
                  ).map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={handleExportPDF}
              className="w-full sm:w-auto ml-auto bg-green-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-green-700 transition-all border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] flex items-center justify-center gap-2 mt-4 sm:mt-0"
            >
              <FileText size={20} /> Export PDF
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64 border-2 border-black rounded-lg bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-black border-t-transparent"></div>
          </div>
        ) : (
          <>
            {/* Chart Section */}
            <div className="bg-white border-2 border-black p-4 sm:p-6 rounded-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <div className="h-64 sm:h-80 md:h-96 w-full">
                <Bar data={chartData} options={chartOptions} />
              </div>
            </div>

            {/* Table Section */}
            <div className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-black uppercase flex items-center gap-2">
                <Package className="text-black" /> Detail Penjualan
              </h2>
              <div className="bg-white border-2 border-black rounded-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead className="bg-black text-white sticky top-0 z-10">
                      <tr>
                        <th className="p-4 font-bold border-r border-gray-700 w-16 text-center">
                          #
                        </th>
                        <th className="p-4 font-bold border-r border-gray-700 w-24 text-center">
                          Gambar
                        </th>
                        <th className="p-4 font-bold border-r border-gray-700">
                          Nama Produk
                        </th>
                        <th className="p-4 font-bold border-r border-gray-700 text-right">
                          Harga Satuan
                        </th>
                        <th className="p-4 font-bold border-r border-gray-700 text-center">
                          Terjual
                        </th>
                        <th className="p-4 font-bold text-right">
                          Total Omzet
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {bestSellingData.length > 0 ? (
                        bestSellingData.map((item, idx) => (
                          <tr
                            key={idx}
                            className="border-b-2 border-gray-200 hover:bg-gray-50 transition-colors"
                          >
                            <td className="p-4 font-black text-center border-r-2 border-gray-200 text-lg">
                              {idx + 1}
                            </td>
                            <td className="p-3 border-r-2 border-gray-200 text-center">
                              {item.productImage ? (
                                <img
                                  src={item.productImage}
                                  alt={item.productName}
                                  className="w-16 h-16 object-cover border-2 border-black rounded-md mx-auto bg-white"
                                />
                              ) : (
                                <div className="w-16 h-16 bg-gray-200 border-2 border-black rounded-md mx-auto flex items-center justify-center text-xs font-bold">
                                  No IMG
                                </div>
                              )}
                            </td>
                            <td className="p-4 border-r-2 border-gray-200 font-bold text-base sm:text-lg">
                              {item.productName}
                            </td>
                            <td className="p-4 border-r-2 border-gray-200 text-right font-mono whitespace-nowrap">
                              Rp {item.productPrice.toLocaleString("id-ID")}
                            </td>
                            <td className="p-4 border-r-2 border-gray-200 text-center">
                              <span
                                className={`px-3 py-1 rounded-full font-bold text-white whitespace-nowrap ${
                                  idx < 3 ? "bg-black" : "bg-gray-500"
                                }`}
                              >
                                {item.totalSold} pcs
                              </span>
                            </td>
                            <td className="p-4 text-right font-mono font-bold text-green-700 whitespace-nowrap">
                              Rp {item.totalRevenue.toLocaleString("id-ID")}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="6"
                            className="p-8 text-center text-gray-500 italic font-medium"
                          >
                            Tidak ada data penjualan pada periode ini.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LaporanBarangTerlakuCeo;