import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, FileText, Search, Ticket, Calendar } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useDispatch, useSelector } from "react-redux";
import { fetchVoucherUsageReport } from "../../features/admin/adminSlice";
import { janAgroLogoBase64 } from "./logoBase64";

const LaporanVoucherCeo = () => {
  const dispatch = useDispatch();
  const { voucherReportData, loading } = useSelector((state) => state.admin);

  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    dispatch(fetchVoucherUsageReport({}));
  }, [dispatch]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      dispatch(
        fetchVoucherUsageReport({
          search: searchTerm,
          startDate,
          endDate,
        })
      );
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [dispatch, searchTerm, startDate, endDate]);

  // --- EXPORT PDF ---
  const handleExportPDF = () => {
    const doc = new jsPDF();

    const tableColumn = [
      "No",
      "Tanggal",
      "Kode Voucher",
      "Pengguna",
      "Produk Dibeli",
      "Diskon",
      "Total Bayar",
    ];
    const tableRows = [];

    voucherReportData.forEach((item, index) => {
      const productList = item.items
        .map((i) => `${i.name} (${i.quantity}x)`)
        .join(", ");

      const rowData = [
        index + 1,
        new Date(item.createdAt).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "short",
          year: "2-digit",
        }),
        item.kodeVoucher,
        item.nama,
        productList,
        `Rp ${item.diskon.toLocaleString("id-ID")}`,
        `Rp ${item.totalHarga.toLocaleString("id-ID")}`,
      ];
      tableRows.push(rowData);
    });

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
        fontSize: 7,
        cellPadding: 2,
        valign: "middle",
        textColor: [0, 0, 0],
      },
      headStyles: {
        fillColor: [20, 20, 20],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      columnStyles: { 4: { cellWidth: 50 } },
      didDrawPage: function (data) {
        const logoWidth = 22;
        const logoHeight = 22;
        const margin = data.settings.margin.left;
        const pageWidth = doc.internal.pageSize.getWidth();

        // --- HEADER ---
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
        doc.text(`Laporan Penggunaan Voucher`, margin + logoWidth + 5, 21);

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

        // --- FOOTER (Hanya di halaman terakhir) ---
        if (data.pageNumber === doc.internal.getNumberOfPages()) {
          const pageHeight = doc.internal.pageSize.getHeight();
          let finalY = data.cursor.y + 15;

          // Cek jika tidak cukup ruang, buat halaman baru
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

          // Garis bawah nama
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
    doc.save(`laporan_voucher_${fullDate}.pdf`);
  };

  return (
    <div className="bg-white min-h-screen pt-20 sm:pt-24 text-black font-sans pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header - Responsive */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center border-b-4 border-black pb-4 gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight">
              Voucher Usage Report
            </h1>
            <p className="text-gray-600 font-medium mt-1 text-sm sm:text-base">
              Laporan detail riwayat penggunaan voucher oleh pelanggan.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <button
              onClick={handleExportPDF}
              className="flex-1 md:flex-none flex items-center justify-center bg-green-600 text-white border-2 border-black px-5 py-2.5 rounded-lg font-bold hover:bg-green-600 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
            >
              <FileText className="mr-2 h-5 w-5" /> EXPORT PDF
            </button>
            <Link
              to="/ceo"
              className="flex-1 md:flex-none flex items-center justify-center bg-black text-white px-5 py-2.5 rounded-lg font-bold hover:bg-gray-800 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
            >
              <ArrowLeft className="mr-2 h-5 w-5" /> BACK
            </Link>
          </div>
        </header>

        {/* Filter Section - Responsive Grid */}
        <div className="bg-white border-2 border-black p-4 sm:p-6 rounded-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex-1">
              <label className="text-xs font-bold uppercase mb-2 block">
                Cari Voucher
              </label>
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Kode voucher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-black rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>
            <div className="flex-1">
              <label className="text-xs font-bold uppercase mb-2 block flex items-center gap-1">
                <Calendar size={14} /> Rentang Tanggal
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-2 py-2.5 border-2 border-black rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black"
                />
                <span className="self-center hidden sm:block">-</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-2 py-2.5 border-2 border-black rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>
            <div className="flex items-end justify-start md:justify-end">
              <div className="bg-black text-white px-6 py-3 rounded-lg font-bold flex items-center gap-3 w-full md:w-auto justify-center shadow-md">
                <Ticket size={24} />
                <div className="text-left">
                  <p className="text-xs font-normal text-gray-300">
                    Total Transaksi
                  </p>
                  <p className="text-xl leading-none">
                    {voucherReportData.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Table - Scrollable */}
        {loading ? (
          <div className="flex justify-center items-center h-64 border-2 border-black rounded-lg bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-black border-t-transparent"></div>
          </div>
        ) : (
          <div className="bg-white border-2 border-black rounded-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead className="bg-black text-white sticky top-0 z-10">
                  <tr>
                    <th className="p-4 font-bold border-r border-gray-700 w-12 text-center">
                      No
                    </th>
                    <th className="p-4 font-bold border-r border-gray-700 w-32 text-center">
                      Tanggal
                    </th>
                    <th className="p-4 font-bold border-r border-gray-700 w-40">
                      Kode Voucher
                    </th>
                    <th className="p-4 font-bold border-r border-gray-700 w-48">
                      Pengguna
                    </th>
                    <th className="p-4 font-bold border-r border-gray-700">
                      Produk Dibeli
                    </th>
                    <th className="p-4 font-bold border-r border-gray-700 text-right w-32">
                      Diskon
                    </th>
                    <th className="p-4 font-bold text-right w-36">
                      Total Bayar
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {voucherReportData.length > 0 ? (
                    voucherReportData.map((item, idx) => (
                      <tr
                        key={item._id || idx}
                        className="border-b-2 border-gray-200 hover:bg-gray-50 transition-colors"
                      >
                        <td className="p-4 text-center border-r-2 border-gray-200 font-bold">
                          {idx + 1}
                        </td>
                        <td className="p-4 text-center border-r-2 border-gray-200 font-mono text-sm text-gray-600">
                          {new Date(item.createdAt).toLocaleDateString(
                            "id-ID",
                            { day: "2-digit", month: "short", year: "numeric" }
                          )}
                        </td>
                        <td className="p-4 border-r-2 border-gray-200">
                          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded border border-yellow-300 font-bold text-xs font-mono whitespace-nowrap">
                            {item.kodeVoucher}
                          </span>
                        </td>
                        <td className="p-4 border-r-2 border-gray-200 font-semibold text-gray-800">
                          {item.nama}
                        </td>
                        <td className="p-4 border-r-2 border-gray-200 text-sm text-gray-600">
                          <ul className="list-disc pl-4 space-y-1">
                            {item.items.map((prod, i) => (
                              <li key={i}>
                                {prod.name} <b>({prod.quantity}x)</b>
                              </li>
                            ))}
                          </ul>
                        </td>
                        <td className="p-4 text-right border-r-2 border-gray-200 font-mono text-red-600 font-bold whitespace-nowrap">
                          -Rp {item.diskon.toLocaleString("id-ID")}
                        </td>
                        <td className="p-4 text-right font-mono font-bold text-black whitespace-nowrap">
                          Rp {item.totalHarga.toLocaleString("id-ID")}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="7"
                        className="p-8 text-center text-gray-500 italic font-medium"
                      >
                        Tidak ada data penggunaan voucher ditemukan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default LaporanVoucherCeo;
