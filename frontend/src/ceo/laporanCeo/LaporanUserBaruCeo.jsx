import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Bar } from "react-chartjs-2";
import { ArrowLeft, FileText, Calendar, Users } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserReport } from "../../features/admin/adminSlice";
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

const LaporanUserBaruCeo = () => {
  const dispatch = useDispatch();
  const { userReportData, loading } = useSelector((state) => state.admin);
  const [filterType, setFilterType] = useState("yearly");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  useEffect(() => {
    let params = {};
    if (filterType === "yearly") {
      params = { year: selectedYear };
    } else if (filterType === "monthly") {
      params = { year: selectedYear, month: selectedMonth };
    } else if (filterType === "daily") {
      const dateObj = new Date(selectedDate);
      params = {
        year: dateObj.getFullYear(),
        month: dateObj.getMonth() + 1,
        day: dateObj.getDate(),
      };
    }
    dispatch(fetchUserReport(params));
  }, [dispatch, filterType, selectedYear, selectedMonth, selectedDate]);

  const chartData = useMemo(() => {
    const data = userReportData || [];
    let labels = [];
    let counts = [];
    if (filterType === "yearly") {
      labels = [
        "Jan", "Feb", "Mar", "Apr", "Mei", "Jun", 
        "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
      ];
      counts = Array(12).fill(0);
      data.forEach((user) => {
        counts[new Date(user.createdAt).getMonth()]++;
      });
    } else if (filterType === "monthly") {
      const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
      labels = Array.from({ length: daysInMonth }, (_, i) => i + 1);
      counts = Array(daysInMonth).fill(0);
      data.forEach((user) => {
        counts[new Date(user.createdAt).getDate() - 1]++;
      });
    } else {
      labels = Array.from({ length: 24 }, (_, i) => `${i}:00`);
      counts = Array(24).fill(0);
      data.forEach((user) => {
        counts[new Date(user.createdAt).getHours()]++;
      });
    }
    return {
      labels,
      datasets: [
        {
          label: "User Baru",
          data: counts,
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          borderColor: "rgba(0, 0, 0, 1)",
          borderWidth: 1,
        },
      ],
    };
  }, [userReportData, filterType, selectedYear, selectedMonth, selectedDate]);

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const tableColumn = ["No", "Nama", "Username", "Role", "Tanggal Join"];
    const tableRows = [];

    userReportData.forEach((user, index) => {
      const rowData = [
        index + 1,
        user.name,
        user.username,
        user.role.charAt(0).toUpperCase() + user.role.slice(1),
        new Date(user.createdAt).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      ];
      tableRows.push(rowData);
    });

    let titleText = "";
    if (filterType === "daily")
      titleText = `Harian (${new Date(selectedDate).toLocaleDateString(
        "id-ID",
        { dateStyle: "full" }
      )})`;
    else if (filterType === "monthly")
      titleText = `Bulanan (${selectedMonth}/${selectedYear})`;
    else titleText = `Tahunan (${selectedYear})`;

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 45,
      margin: { top: 45 },
      theme: "grid",
      styles: {
        font: "helvetica",
        fontSize: 9,
        cellPadding: 2,
        textColor: [0, 0, 0],
      },
      headStyles: {
        fillColor: [0, 0, 0],
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
          `Laporan User Baru - ${titleText}`,
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
          let finalY = data.cursor.y + 20;
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
          doc.text("J.Alamsjah, S.H", signatureX, finalY + 25, {
            align: "right",
          });
          doc.setLineWidth(0.5);
          doc.line(signatureX - 30, finalY + 26, signatureX, finalY + 26);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          doc.text("Ceo & Founder", signatureX, finalY + 32, {
            align: "right",
          });
        }
      },
    });
    doc.save(`laporan_user_${filterType}_${new Date().getTime()}.pdf`);
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: `Grafik Pertumbuhan User`,
        font: { size: 16, weight: "bold" },
        color: "#000",
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: "#000" } },
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1, color: "#000" },
        grid: { color: "#e5e5e5" },
      },
    },
  };

  return (
    <div className="bg-white min-h-screen pt-20 sm:pt-24 text-black font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 space-y-8">
        {/* Header - Responsive */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center border-b-4 border-black pb-4 gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight">
              Laporan User Baru
            </h1>
            <p className="text-gray-600 font-medium mt-1 text-sm sm:text-base">
              Analisis pertumbuhan pengguna platform.
            </p>
          </div>
          <Link
            to="/ceo"
            className="flex w-full md:w-auto items-center justify-center bg-black text-white px-5 py-2.5 rounded-lg font-bold hover:bg-gray-800 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)] hover:translate-x-[2px] hover:translate-y-[2px]"
          >
            <ArrowLeft className="mr-2 h-5 w-5" /> BACK
          </Link>
        </header>

        {/* Filter Section - Responsive */}
        <div className="bg-white border-2 border-black p-4 sm:p-6 rounded-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-6 border-b-2 border-gray-200 pb-4 gap-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Calendar className="h-6 w-6" /> Filter Laporan
            </h2>
            <div className="flex bg-gray-100 p-1 rounded-md border border-black w-full md:w-auto gap-1">
              {["daily", "monthly", "yearly"].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`flex-1 md:flex-none px-2 py-1.5 rounded text-sm font-bold transition-all ${
                    filterType === type
                      ? "bg-black text-white shadow-md"
                      : "text-gray-600 hover:text-black"
                  }`}
                >
                  {type === "daily"
                    ? "Harian"
                    : type === "monthly"
                    ? "Bulanan"
                    : "Tahunan"}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row flex-wrap gap-4 items-end sm:items-center">
            {filterType === "daily" && (
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
              </div>
            )}
            {(filterType === "monthly" || filterType === "yearly") && (
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
            {filterType === "monthly" && (
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
            )}
            <button
              onClick={handleExportPDF}
              className="ml-auto w-full sm:w-auto bg-green-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-green-700 transition-all border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] flex items-center justify-center gap-2 mt-4 sm:mt-0"
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
            <div className="bg-white border-2 border-black p-4 sm:p-6 rounded-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <div className="h-64 sm:h-80 w-full">
                <Bar data={chartData} options={chartOptions} />
              </div>
            </div>
            <div className="bg-white border-2 border-black rounded-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
              <div className="p-4 border-b-2 border-black bg-gray-50 flex justify-between items-center">
                <h3 className="text-base sm:text-lg font-black uppercase flex items-center gap-2">
                  <Users size={20} /> Detail Pengguna Baru
                </h3>
                <span className="bg-black text-white px-3 py-1 rounded-full text-xs font-bold">
                  Total: {userReportData.length}
                </span>
              </div>
              <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                <table className="w-full text-left border-collapse relative min-w-[700px]">
                  <thead className="bg-black text-white sticky top-0 z-10 shadow-md">
                    <tr>
                      <th className="p-4 font-bold border-r border-gray-700 w-16 text-center">
                        No
                      </th>
                      <th className="p-4 font-bold border-r border-gray-700">
                        Nama Lengkap
                      </th>
                      <th className="p-4 font-bold border-r border-gray-700">
                        Email / Kontak
                      </th>
                      <th className="p-4 font-bold border-r border-gray-700 text-center">
                        Role
                      </th>
                      <th className="p-4 font-bold text-center">
                        Tanggal Join
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {userReportData.length > 0 ? (
                      userReportData.map((user, idx) => (
                        <tr
                          key={user._id || idx}
                          className="border-b-2 border-gray-200 hover:bg-gray-50 transition-colors"
                        >
                          <td className="p-4 font-bold text-center border-r-2 border-gray-200">
                            {idx + 1}
                          </td>
                          <td className="p-4 border-r-2 border-gray-200">
                            <div className="font-bold">{user.name}</div>
                            <div className="text-xs text-gray-500">
                              @{user.username}
                            </div>
                          </td>
                          <td className="p-4 border-r-2 border-gray-200 text-sm">
                            <div className="break-all">{user.email}</div>
                            <div className="text-gray-500">
                              {user.phone || "-"}
                            </div>
                          </td>
                          <td className="p-4 text-center border-r-2 border-gray-200">
                            <span
                              className={`px-2 py-1 rounded text-xs font-bold border border-black ${
                                user.role === "admin"
                                  ? "bg-blue-100"
                                  : "bg-gray-100"
                              }`}
                            >
                              {user.role.toUpperCase()}
                            </span>
                          </td>
                          <td className="p-4 text-center font-mono text-sm whitespace-nowrap">
                            {new Date(user.createdAt).toLocaleDateString(
                              "id-ID",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="5"
                          className="p-8 text-center text-gray-500 italic font-medium"
                        >
                          Tidak ada user baru pada periode ini.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
export default LaporanUserBaruCeo;