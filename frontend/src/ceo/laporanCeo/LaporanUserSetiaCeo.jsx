import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  User,
  ShoppingBag,
  Calendar,
  DollarSign,
  FileText,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchLoyalUsersReport } from "../../features/admin/adminSlice";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { janAgroLogoBase64 } from "./logoBase64";

const LaporanUserSetiaCeo = () => {
  const dispatch = useDispatch();
  const { loyalUsersData, loading } = useSelector((state) => state.admin);
  const [expandedUser, setExpandedUser] = useState(null);

  useEffect(() => {
    dispatch(fetchLoyalUsersReport());
  }, [dispatch]);

  const toggleExpand = (userId) => {
    setExpandedUser(expandedUser === userId ? null : userId);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const tableColumn = [
      "Peringkat",
      "Nama Pelanggan",
      "Total Belanja",
      "Frekuensi Order",
      "Barang Sering Dibeli",
    ];
    const tableRows = [];

    loyalUsersData.forEach((user, index) => {
      const uniqueItems = [...new Set(user.allItems.map((item) => item.name))]
        .slice(0, 5)
        .join(", ");
      const rowData = [
        index + 1,
        user.name,
        `Rp ${user.totalSpent.toLocaleString("id-ID")}`,
        `${user.orderCount}x`,
        uniqueItems + (user.allItems.length > 5 ? "..." : ""),
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
        fontSize: 9,
        cellPadding: 3,
        textColor: [0, 0, 0],
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
        doc.text(
          `Laporan Pelanggan Setia (Top Spenders)`,
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
        doc.line(
          margin,
          35,
          doc.internal.pageSize.getWidth() - data.settings.margin.right,
          35
        );

        // --- FOOTER ---
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
    doc.save(`laporan_user_setia_${fullDate}.pdf`);
  };

  const groupItems = (items) => {
    const grouped = {};
    items.forEach((item) => {
      if (grouped[item.name]) {
        grouped[item.name].quantity += item.quantity;
        grouped[item.name].totalPrice += item.price * item.quantity;
      } else {
        grouped[item.name] = {
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          image: item.image,
          totalPrice: item.price * item.quantity,
        };
      }
    });
    return Object.values(grouped).sort((a, b) => b.quantity - a.quantity);
  };

  return (
    <div className="bg-white min-h-screen pt-20 sm:pt-24 text-black font-sans pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header - Responsive */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center border-b-4 border-black pb-4 gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight">
              Top Loyal Customers
            </h1>
            <p className="text-gray-600 font-medium mt-1 text-sm sm:text-base">
              Pelanggan dengan total belanja & frekuensi tertinggi.
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

        {loading ? (
          <div className="flex justify-center items-center h-64 border-2 border-black rounded-lg bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-black border-t-transparent"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {loyalUsersData.map((user, index) => (
              <div
                key={user._id}
                className="border-2 border-black rounded-lg overflow-hidden shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-y-1"
              >
                <div
                  className="p-4 sm:p-6 bg-white flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 sm:gap-6 cursor-pointer hover:bg-gray-50"
                  onClick={() => toggleExpand(user._id)}
                >
                  {/* User Profile */}
                  <div className="flex items-center gap-4 w-full lg:w-auto">
                    <div
                      className={`flex-shrink-0 h-12 w-12 sm:h-16 sm:w-16 rounded-full border-2 border-black flex items-center justify-center text-lg sm:text-xl font-black ${
                        index < 3 ? "bg-yellow-400" : "bg-gray-200"
                      }`}
                    >
                      #{index + 1}
                    </div>
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="h-12 w-12 sm:h-16 sm:w-16 rounded-full border-2 border-black object-cover"
                      />
                    ) : (
                      <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full border-2 border-black bg-black text-white flex items-center justify-center">
                        <User size={24} />
                      </div>
                    )}
                    <div className="overflow-hidden">
                      <h3 className="text-lg sm:text-xl font-black uppercase truncate">
                        {user.name}
                      </h3>
                      <p className="text-gray-500 font-medium text-xs sm:text-sm truncate">
                        @{user.username}
                      </p>
                      <p className="text-gray-500 font-medium text-xs sm:text-sm truncate hidden sm:block">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex flex-wrap gap-4 w-full lg:w-auto justify-between lg:justify-end border-t lg:border-t-0 pt-4 lg:pt-0">
                    <div className="text-left lg:text-center min-w-[100px]">
                      <p className="text-xs font-bold text-gray-500 uppercase mb-1">
                        Total Belanja
                      </p>
                      <p className="text-lg sm:text-xl font-black flex items-center lg:justify-center gap-1">
                        <DollarSign size={18} className="text-green-600" /> Rp{" "}
                        {user.totalSpent.toLocaleString("id-ID")}
                      </p>
                    </div>
                    <div className="text-left lg:text-center min-w-[80px]">
                      <p className="text-xs font-bold text-gray-500 uppercase mb-1">
                        Frekuensi
                      </p>
                      <p className="text-lg sm:text-xl font-black flex items-center lg:justify-center gap-1">
                        <ShoppingBag size={18} /> {user.orderCount}x
                      </p>
                    </div>
                    <div className="text-left lg:text-center min-w-[120px] hidden sm:block">
                      <p className="text-xs font-bold text-gray-500 uppercase mb-1">
                        Terakhir Order
                      </p>
                      <p className="text-base sm:text-lg font-bold flex items-center lg:justify-center gap-1">
                        <Calendar size={16} />{" "}
                        {new Date(user.lastOrderDate).toLocaleDateString(
                          "id-ID",
                          { day: "2-digit", month: "short", year: "2-digit" }
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedUser === user._id && (
                  <div className="bg-gray-100 border-t-2 border-black p-4 sm:p-6 animate-fade-in">
                    <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                      <ShoppingBag className="text-black" size={20} /> Riwayat
                      Barang yang Dibeli
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {groupItems(user.allItems).map((item, i) => (
                        <div
                          key={i}
                          className="bg-white border border-black p-3 rounded flex items-center gap-3 shadow-sm"
                        >
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-12 h-12 object-cover border border-gray-300 rounded shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-xs font-bold shrink-0">
                              No IMG
                            </div>
                          )}
                          <div className="overflow-hidden w-full">
                            <p
                              className="font-bold text-sm truncate"
                              title={item.name}
                            >
                              {item.name}
                            </p>
                            <div className="flex justify-between items-center text-xs text-gray-600 mt-1">
                              <span className="bg-black text-white px-1.5 rounded font-bold">
                                {item.quantity}x
                              </span>
                              <span className="font-mono">
                                Rp {item.totalPrice.toLocaleString("id-ID")}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default LaporanUserSetiaCeo;