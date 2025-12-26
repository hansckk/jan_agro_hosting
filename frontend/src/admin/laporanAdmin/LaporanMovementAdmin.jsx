import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, FileText, TrendingUp, TrendingDown, Calendar } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useDispatch, useSelector } from "react-redux";
import { fetchStockMovementReport } from "../../features/admin/adminSlice";
import { janAgroLogoBase64 } from "../../ceo/laporanCeo/logoBase64";

const LaporanMovementAdmin = () => {
  const dispatch = useDispatch();
  const { stockMovementData = [], loading } = useSelector((state) => state.admin);
  const [filterType, setFilterType] = useState("all");
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());

  useEffect(() => {
    dispatch(fetchStockMovementReport());
  }, [dispatch]);

  const filteredMovements = useMemo(() => {
    return stockMovementData.filter((movement) => {
      const movementDate = new Date(movement.createdAt);
      const yearMatch = movementDate.getFullYear() === filterYear;
      const monthMatch = movementDate.getMonth() + 1 === filterMonth;

      if (filterType === "in") {
        return movement.movementType === "in" && yearMatch && monthMatch;
      } else if (filterType === "out") {
        return movement.movementType === "out" && yearMatch && monthMatch;
      } else {
        return yearMatch && monthMatch;
      }
    });
  }, [stockMovementData, filterType, filterMonth, filterYear]);

  const stats = useMemo(() => {
    const inMovements = filteredMovements.filter((m) => m.movementType === "in");
    const outMovements = filteredMovements.filter((m) => m.movementType === "out");

    const totalInQuantity = inMovements.reduce((sum, m) => sum + m.quantity, 0);
    const totalOutQuantity = outMovements.reduce((sum, m) => sum + m.quantity, 0);

    return {
      inCount: inMovements.length,
      outCount: outMovements.length,
      totalInQuantity,
      totalOutQuantity,
    };
  }, [filteredMovements]);

  const reasonTranslation = {
    pembelian: "Purchase",
    penjualan: "Sale",
    retur: "Return",
    pembatalan: "Cancellation",
    penyesuaian: "Adjustment",
  };

  const handleExportPDF = () => {
    const doc = new jsPDF("l");
    const tableColumn = [
      "#",
      "Date",
      "Product",
      "Type",
      "Qty",
      "Reason",
      "Previous Stock",
      "Current Stock",
    ];
    const tableRows = [];

    filteredMovements.forEach((movement, idx) => {
      const moveDate = new Date(movement.createdAt);
      const rowData = [
        idx + 1,
        moveDate.toLocaleDateString("en-US"),
        movement.productName,
        movement.movementType === "in" ? "IN" : "OUT",
        movement.quantity,
        reasonTranslation[movement.reason] || movement.reason,
        movement.previousStock,
        movement.currentStock,
      ];
      tableRows.push(rowData);
    });

    const date = new Date();
    const fullDate = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
    const monthName = new Date(2024, filterMonth - 1).toLocaleString("en-US", { month: "long" });

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
        doc.text(
          `Stock Movement Report - ${monthName} ${filterYear}`,
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
        doc.text(`Qty In: ${stats.totalInQuantity}`, margin, 50);
        doc.text(`Qty Out: ${stats.totalOutQuantity}`, margin + 80, 50);
        doc.text(
          `Balance: ${stats.totalInQuantity - stats.totalOutQuantity}`,
          margin + 160,
          50
        );

        if (data.pageNumber === doc.internal.getNumberOfPages()) {
          const pageHeight = doc.internal.pageSize.getHeight();
          let finalY = data.cursor.y + 15;
          if (finalY + 40 > pageHeight) {
            doc.addPage();
            finalY = 40;
          }

          const signatureX = pageWidth - data.settings.margin.right;
          const currentDate = new Date().toLocaleDateString("en-US", {
            day: "numeric",
            month: "long",
            year: "numeric",
          });

          doc.setFontSize(10);
          doc.setFont("helvetica", "normal");
          doc.text(`Surabaya, ${currentDate}`, signatureX, finalY, { align: "right" });
          doc.setFont("helvetica", "bold");
          doc.text("Approved by Admin", signatureX, finalY + 20, { align: "right" });
          const nameWidth = doc.getTextWidth("Approved by Admin");
          doc.setLineWidth(0.5);
          doc.line(signatureX - nameWidth, finalY + 21, signatureX, finalY + 21);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          doc.text("Admin Staff", signatureX, finalY + 25, { align: "right" });
        }
      },
    });
    doc.save(`stock_movement_report_${filterYear}-${filterMonth}_${fullDate}.pdf`);
  };

  const years = useMemo(() => {
    const uniqueYears = new Set(
      stockMovementData.map((m) => new Date(m.createdAt).getFullYear())
    );
    uniqueYears.add(new Date().getFullYear());
    return Array.from(uniqueYears).sort((a, b) => b - a);
  }, [stockMovementData]);

  return (
    <div className="bg-white min-h-screen pt-24 text-black font-sans pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center border-b-4 border-black pb-4 gap-4">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tight">
              Stock Movement Report
            </h1>
            <p className="text-gray-600 font-medium mt-1">
              Track incoming and outgoing stock movements per product.
            </p>
          </div>
          <Link
            to="/admin"
            className="flex items-center bg-black text-white px-5 py-2.5 rounded-lg font-bold hover:bg-gray-800 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
          >
            <ArrowLeft className="mr-2 h-5 w-5" /> BACK
          </Link>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white border-2 border-black p-6 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-bold">IN MOVEMENTS</p>
                <p className="text-3xl font-black">{stats.inCount}</p>
              </div>
              <TrendingUp className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <div className="bg-white border-2 border-black p-6 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-bold">OUT MOVEMENTS</p>
                <p className="text-3xl font-black">{stats.outCount}</p>
              </div>
              <TrendingDown className="h-12 w-12 text-red-600" />
            </div>
          </div>
          <div className="bg-white border-2 border-black p-6 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-bold">QTY IN</p>
                <p className="text-3xl font-black">{stats.totalInQuantity}</p>
              </div>
              <TrendingUp className="h-12 w-12 text-blue-600" />
            </div>
          </div>
          <div className="bg-white border-2 border-black p-6 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-bold">QTY OUT</p>
                <p className="text-3xl font-black">{stats.totalOutQuantity}</p>
              </div>
              <TrendingDown className="h-12 w-12 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Filter & Export */}
        <div className="bg-white border-2 border-black p-6 rounded-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
            <div className="flex gap-2 flex-wrap">
                {[
                { id: "all", label: "All" },
                { id: "in", label: "In", icon: TrendingUp },
                { id: "out", label: "Out", icon: TrendingDown },
              ].map((type) => (
                <button
                  key={type.id}
                  onClick={() => setFilterType(type.id)}
                  className={`px-4 py-2 rounded font-bold text-sm transition-all flex items-center gap-2 ${
                    filterType === type.id
                      ? "bg-black text-white shadow-md"
                      : "bg-gray-100 text-gray-600 hover:text-black"
                  }`}
                >
                  {type.icon && <type.icon size={16} />}
                  {type.label}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <select
                value={filterMonth}
                onChange={(e) => setFilterMonth(parseInt(e.target.value))}
                className="border-2 border-black rounded px-3 py-2 font-bold focus:outline-none focus:ring-2 focus:ring-black"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(0, i).toLocaleString("en-US", { month: "long" })}
                  </option>
                ))}
              </select>
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(parseInt(e.target.value))}
                className="border-2 border-black rounded px-3 py-2 font-bold focus:outline-none focus:ring-2 focus:ring-black"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
              <button
                onClick={handleExportPDF}
                className="bg-green-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-green-700 transition-all border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] flex items-center gap-2"
              >
                <FileText size={20} /> Export PDF
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center items-center h-64 border-2 border-black rounded-lg bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-black border-t-transparent"></div>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-2xl font-black uppercase flex items-center gap-2">
              <Calendar className="text-black" /> Stock Movement Details
            </h2>
            <div className="bg-white border-2 border-black rounded-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
              <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-black text-white sticky top-0 z-10">
                    <tr>
                        <th className="p-4 font-bold border-r border-gray-700 w-16 text-center">#</th>
                        <th className="p-4 font-bold border-r border-gray-700">Date</th>
                        <th className="p-4 font-bold border-r border-gray-700">Product</th>
                        <th className="p-4 font-bold border-r border-gray-700 text-center">Type</th>
                        <th className="p-4 font-bold border-r border-gray-700 text-center">Qty</th>
                        <th className="p-4 font-bold border-r border-gray-700">Reason</th>
                        <th className="p-4 font-bold border-r border-gray-700 text-center">Prev Stock</th>
                        <th className="p-4 font-bold text-center">Curr Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMovements.length > 0 ? (
                      filteredMovements.map((movement, idx) => (
                        <tr
                          key={idx}
                          className="border-b-2 border-gray-200 hover:bg-gray-50 transition-colors"
                        >
                          <td className="p-4 font-black text-center border-r-2 border-gray-200 text-lg">
                            {idx + 1}
                          </td>
                          <td className="p-4 border-r-2 border-gray-200 font-bold">
                            {new Date(movement.createdAt).toLocaleDateString("en-US")}
                          </td>
                          <td className="p-4 border-r-2 border-gray-200 font-bold">
                            {movement.productName}
                          </td>
                          <td className="p-4 border-r-2 border-gray-200 text-center">
                            <span
                              className={`px-3 py-1 rounded-full font-bold text-white text-sm ${
                                movement.movementType === "in"
                                  ? "bg-green-600"
                                  : "bg-red-600"
                              }`}
                            >
                              {movement.movementType === "in" ? "IN" : "OUT"}
                            </span>
                          </td>
                          <td className="p-4 border-r-2 border-gray-200 text-center font-bold">
                            {movement.quantity}
                          </td>
                          <td className="p-4 border-r-2 border-gray-200">
                            {reasonTranslation[movement.reason] || movement.reason}
                          </td>
                          <td className="p-4 border-r-2 border-gray-200 text-center font-mono">
                            {movement.previousStock}
                          </td>
                          <td className="p-4 text-center font-mono font-bold">
                            {movement.currentStock}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="8"
                          className="p-8 text-center text-gray-500 italic font-medium"
                        >
                          No stock movements in this period.
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

export default LaporanMovementAdmin;
