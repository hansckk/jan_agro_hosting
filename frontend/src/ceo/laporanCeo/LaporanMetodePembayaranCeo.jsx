import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  CreditCard,
  Percent,
  TrendingUp,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useDispatch, useSelector } from "react-redux";
import { fetchCeoReport } from "../../features/admin/adminSlice";
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
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const LaporanMetodePembayaranCeo = () => {
  const dispatch = useDispatch();
  const { ceoReportData = [], loading } = useSelector((state) => state.admin);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);

  const mapPaymentMethodLabel = (method) => {
    const map = {
      "Transfer Bank": "Bank Transfer",
      "Kartu Kredit": "Credit Card",
      COD: "Cash on Delivery",
      "Online Payment": "Online Payment",
    };
    return map[method] || method;
  };

  useEffect(() => {
    dispatch(fetchCeoReport({}));
  }, [dispatch]);

  const filteredOrders = useMemo(() => {
    return ceoReportData.filter((order) => {
      const orderDate = new Date(order.tanggal || order.createdAt);
      return (
        orderDate.getFullYear() === filterYear &&
        orderDate.getMonth() + 1 === filterMonth
      );
    });
  }, [ceoReportData, filterYear, filterMonth]);

  const paymentStats = useMemo(() => {
    const stats = {
      "Transfer Bank": { count: 0, total: 0 },
      COD: { count: 0, total: 0 },
      "Kartu Kredit": { count: 0, total: 0 },
      "Online Payment": { count: 0, total: 0 },
    };

    filteredOrders.forEach((order) => {
      const method = order.metodePembayaran || "Transfer Bank";
      if (stats[method]) {
        stats[method].count += 1;
        stats[method].total += order.totalHarga;
      }
    });

    return stats;
  }, [filteredOrders]);

  const chartData = useMemo(() => {
    const methods = Object.keys(paymentStats);
    const counts = methods.map((m) => paymentStats[m].count);

    return {
      labels: methods.map((m) => mapPaymentMethodLabel(m)),
      datasets: [
        {
          label: "Jumlah Transaksi",
          data: counts,
          backgroundColor: [
            "rgba(59, 130, 246, 0.8)",
            "rgba(16, 185, 129, 0.8)",
            "rgba(245, 158, 11, 0.8)",
            "rgba(139, 92, 246, 0.8)",
          ],
          borderColor: [
            "rgba(59, 130, 246, 1)",
            "rgba(16, 185, 129, 1)",
            "rgba(245, 158, 11, 1)",
            "rgba(139, 92, 246, 1)",
          ],
          borderWidth: 2,
        },
      ],
    };
  }, [paymentStats]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true },
      title: {
        display: true,
        text: `Payment Methods Distribution - ${new Date(2024, filterMonth - 1).toLocaleString("en-US", { month: "long" })} ${filterYear}`,
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
        ticks: { color: "#000" },
        grid: { color: "#e5e5e5" },
      },
    },
  };

  const totalRevenue = useMemo(() => {
    return filteredOrders.reduce((sum, order) => sum + order.totalHarga, 0);
  }, [filteredOrders]);

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const tableColumn = ["No", "Payment Method", "Transactions", "Total Revenue", "Percentage"];
    const tableRows = [];

    let rowNum = 1;
    Object.entries(paymentStats).forEach(([method, data]) => {
      const percentage =
        totalRevenue > 0 ? ((data.total / totalRevenue) * 100).toFixed(1) : 0;
      tableRows.push([
        rowNum++,
        method,
        data.count,
        `Rp ${data.total.toLocaleString("id-ID")}`,
        `${percentage}%`,
      ]);
    });

    const date = new Date();
    const fullDate = `${date.getDate()}-${
      date.getMonth() + 1
    }-${date.getFullYear()}`;
      const monthName = new Date(2024, filterMonth - 1).toLocaleString("en-US", { month: "long" });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 60,
      margin: { top: 60 },
      theme: "grid",
      styles: {
        font: "helvetica",
        fontSize: 10,
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
        } catch {
          // Logo load error silently handled
        }

        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("PT. Jan Agro Nusantara", margin + logoWidth + 5, 16);
        doc.setFontSize(10);
        doc.text(`Payment Methods Report - ${monthName} ${filterYear}`, margin + logoWidth + 5, 21);

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

        // Summary
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.text(
          `Total Revenue: Rp ${totalRevenue.toLocaleString("id-ID")}`,
          margin,
          50
        );
        doc.text(`Total Transaksi: ${filteredOrders.length}`, margin + 100, 50);

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
    doc.save(`payment_methods_report_${filterYear}-${filterMonth}_${fullDate}.pdf`);
  };

  const years = useMemo(() => {
    const uniqueYears = new Set(
      ceoReportData.map((c) => new Date(c.tanggal || c.createdAt).getFullYear())
    );
    uniqueYears.add(new Date().getFullYear());
    return Array.from(uniqueYears).sort((a, b) => b - a);
  }, [ceoReportData]);

  return (
    <div className="bg-white min-h-screen pt-20 sm:pt-24 text-black font-sans pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center border-b-4 border-black pb-4 gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight">Payment Methods Report</h1>
            <p className="text-gray-600 font-medium mt-1 text-sm sm:text-base">Distribution and performance analysis for each payment method.</p>
          </div>
          <Link
            to="/ceo"
            className="flex w-full md:w-auto items-center justify-center bg-black text-white px-5 py-2.5 rounded-lg font-bold hover:bg-gray-800 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
          >
            <ArrowLeft className="mr-2 h-5 w-5" /> BACK
          </Link>
        </header>

        {/* Stats Cards - Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(paymentStats).map(([method, data]) => {
            const percentage =
              totalRevenue > 0
                ? ((data.total / totalRevenue) * 100).toFixed(1)
                : 0;
            return (
              <div
                key={method}
                className="bg-white border-2 border-black p-6 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                <div className="flex items-center justify-between">
                  <div className="overflow-hidden">
                    <p className="text-gray-600 text-xs font-bold uppercase truncate">{mapPaymentMethodLabel(method)}</p>
                    <p className="text-2xl font-black">{data.count}</p>
                    <p className="text-sm text-gray-500 mt-1 truncate">{percentage}% of revenue</p>
                  </div>
                  <CreditCard className="h-10 w-10 sm:h-12 sm:w-12 text-blue-600 shrink-0" />
                </div>
              </div>
            );
          })}
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

        {/* Filter & Export - Stack on mobile */}
        <div className="bg-white border-2 border-black p-6 rounded-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="flex flex-col w-full sm:w-auto">
                <label className="text-xs font-bold uppercase mb-1 md:hidden">Bulan</label>
                <select
                  value={filterMonth}
                  onChange={(e) => setFilterMonth(parseInt(e.target.value))}
                  className="border-2 border-black rounded px-3 py-2 font-bold focus:outline-none focus:ring-2 focus:ring-black w-full sm:w-auto"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {new Date(0, i).toLocaleString("id-ID", { month: "long" })}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex flex-col w-full sm:w-auto">
                <label className="text-xs font-bold uppercase mb-1 md:hidden">Tahun</label>
                <select
                  value={filterYear}
                  onChange={(e) => setFilterYear(parseInt(e.target.value))}
                  className="border-2 border-black rounded px-3 py-2 font-bold focus:outline-none focus:ring-2 focus:ring-black w-full sm:w-auto"
                >
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <button
              onClick={handleExportPDF}
              className="w-full sm:w-auto bg-green-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-green-700 transition-all border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] flex items-center justify-center gap-2"
            >
              <FileText size={20} /> Export PDF
            </button>
          </div>
        </div>

        {/* Table - Scrollable */}
        {loading ? (
          <div className="flex justify-center items-center h-64 border-2 border-black rounded-lg bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-black border-t-transparent"></div>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-2xl font-black uppercase flex items-center gap-2">
              <CreditCard className="text-black" /> Payment Method Details
            </h2>
            <div className="bg-white border-2 border-black rounded-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead className="bg-black text-white sticky top-0 z-10">
                    <tr>
                      <th className="p-4 font-bold border-r border-gray-700 w-16 text-center">
                        #
                      </th>
                      <th className="p-4 font-bold border-r border-gray-700">Payment Method</th>
                      <th className="p-4 font-bold border-r border-gray-700 text-center">Transactions</th>
                      <th className="p-4 font-bold border-r border-gray-700 text-right">
                        Total Revenue
                      </th>
                      <th className="p-4 font-bold text-center">Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(paymentStats).map(([method, data], idx) => {
                      const percentage =
                        totalRevenue > 0
                          ? ((data.total / totalRevenue) * 100).toFixed(1)
                          : 0;
                      return (
                        <tr
                          key={method}
                          className="border-b-2 border-gray-200 hover:bg-gray-50 transition-colors"
                        >
                          <td className="p-4 font-black text-center border-r-2 border-gray-200 text-lg">
                            {idx + 1}
                          </td>
                          <td className="p-4 border-r-2 border-gray-200 font-bold">{mapPaymentMethodLabel(method)}</td>
                          <td className="p-4 border-r-2 border-gray-200 text-center font-bold">
                            {data.count}
                          </td>
                          <td className="p-4 border-r-2 border-gray-200 text-right font-mono whitespace-nowrap">
                            Rp {data.total.toLocaleString("id-ID")}
                          </td>
                          <td className="p-4 text-center">
                            <span className="px-3 py-1 rounded-full font-bold text-white bg-blue-600 text-sm">
                              {percentage}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                    <tr className="border-t-4 border-black bg-gray-100">
                      <td colSpan="2" className="p-4 font-black text-lg">
                        TOTAL
                      </td>
                      <td className="p-4 font-black text-center text-lg">
                        {filteredOrders.length}
                      </td>
                      <td className="p-4 text-right font-mono font-black whitespace-nowrap">
                        Rp {totalRevenue.toLocaleString("id-ID")}
                      </td>
                      <td className="p-4 text-center font-bold">100%</td>
                    </tr>
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

export default LaporanMetodePembayaranCeo;