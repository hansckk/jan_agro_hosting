import React, { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, FileText, Package, AlertTriangle } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useDispatch, useSelector } from "react-redux";
import { fetchOutOfStockReport } from "../../features/admin/adminSlice";
import { janAgroLogoBase64 } from "./logoBase64";

const LaporanStokHabis = () => {
  const dispatch = useDispatch();
  const { outOfStockReportData = [], loading } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchOutOfStockReport());
  }, [dispatch]);

  const stockStats = useMemo(() => {
    return {
      totalOutOfStock: outOfStockReportData.length,
      estimatedLoss: outOfStockReportData.reduce((sum, item) => sum + item.price, 0),
    };
  }, [outOfStockReportData]);

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const tableColumn = [
      "Rank",
      "Product Name",
      "Unit Price",
      "Category",
    ];
    const tableRows = [];

    outOfStockReportData.forEach((item, index) => {
      const rowData = [
        index + 1,
        item.name,
        `Rp ${item.price.toLocaleString("id-ID")}`,
        item.category || "-",
      ];
      tableRows.push(rowData);
    });

    const date = new Date();
    const fullDate = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;

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
        } catch {
          // Logo load error silently handled
        }

        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("PT. Jan Agro Nusantara", margin + logoWidth + 5, 16);
        doc.setFontSize(10);
        doc.text(`Out of Stock Report`, margin + logoWidth + 5, 21);

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
          const currentDate = new Date().toLocaleDateString("en-US", {
            day: "numeric", month: "long", year: "numeric",
          });

          doc.setFontSize(10);
          doc.setFont("helvetica", "normal");
          doc.text(`Surabaya, ${currentDate}`, signatureX, finalY, { align: "right" });
          doc.setFont("helvetica", "bold");
          doc.text("J.Alamsjah, S.H", signatureX, finalY + 20, { align: "right" });
          const nameWidth = doc.getTextWidth("J.Alamsjah, S.H");
          doc.setLineWidth(0.5);
          doc.line(signatureX - nameWidth, finalY + 21, signatureX, finalY + 21);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          doc.text("CEO & Founder", signatureX, finalY + 25, { align: "right" });
        }
      },
    });
    doc.save(`out_of_stock_report_${fullDate}.pdf`);
  };

  return (
    <div className="bg-white min-h-screen pt-24 text-black font-sans pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center border-b-4 border-black pb-4 gap-4">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tight">
              Out of Stock Report
            </h1>
            <p className="text-gray-600 font-medium mt-1">
              Monitor all products that are out of stock.
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border-2 border-black p-6 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-bold">TOTAL OUT OF STOCK</p>
                <p className="text-3xl font-black">{stockStats.totalOutOfStock}</p>
              </div>
              <AlertTriangle className="h-12 w-12 text-red-600" />
            </div>
          </div>
          <div className="bg-white border-2 border-black p-6 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-bold">TOTAL PRODUCT VALUE</p>
                <p className="text-3xl font-black">Rp {stockStats.estimatedLoss.toLocaleString("id-ID")}</p>
              </div>
              <Package className="h-12 w-12 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Export Button */}
        <div className="bg-white border-2 border-black p-6 rounded-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex justify-end">
            <button
              onClick={handleExportPDF}
              className="bg-green-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-green-700 transition-all border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] flex items-center gap-2"
            >
              <FileText size={20} /> Export PDF
            </button>
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
              <Package className="text-black" /> Out of Stock Products
            </h2>
            <div className="bg-white border-2 border-black rounded-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
              <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-black text-white sticky top-0 z-10">
                    <tr>
                      <th className="p-4 font-bold border-r border-gray-700 w-16 text-center">#</th>
                      <th className="p-4 font-bold border-r border-gray-700 w-24 text-center">Gambar</th>
                      <th className="p-4 font-bold border-r border-gray-700">Product Name</th>
                      <th className="p-4 font-bold border-r border-gray-700">Category</th>
                      <th className="p-4 font-bold text-right">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {outOfStockReportData.length > 0 ? (
                      outOfStockReportData.map((item, idx) => (
                        <tr key={idx} className="border-b-2 border-gray-200 hover:bg-gray-50 transition-colors">
                          <td className="p-4 font-black text-center border-r-2 border-gray-200 text-lg">{idx + 1}</td>
                          <td className="p-3 border-r-2 border-gray-200 text-center">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-16 h-16 object-cover border-2 border-black rounded-md mx-auto bg-white"
                              />
                            ) : (
                              <div className="w-16 h-16 bg-gray-200 border-2 border-black rounded-md mx-auto flex items-center justify-center text-xs font-bold">
                                No IMG
                              </div>
                            )}
                          </td>
                          <td className="p-4 border-r-2 border-gray-200 font-bold text-lg">{item.name}</td>
                          <td className="p-4 border-r-2 border-gray-200 text-gray-700">{item.category || "-"}</td>
                          <td className="p-4 text-right font-mono font-bold text-green-700">
                            Rp {item.price.toLocaleString("id-ID")}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="p-8 text-center text-gray-500 italic font-medium">
                          No out-of-stock products.
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

export default LaporanStokHabis;
