import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllReviews } from "../features/admin/adminSlice";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { janAgroLogoBase64 } from "./laporanCeo/logoBase64";
import {
  Search,
  PlayCircle,
  FileText,
  Calendar,
  Filter,
  MessageSquare,
  Star,
} from "lucide-react";

import { Card, Button, Badge, Avatar, Spinner } from "flowbite-react";

const StarRating = ({ rating }) => (
  <div className="flex items-center shrink-0">
    {[...Array(5)].map((_, index) => (
      <Star
        key={index}
        size={14}
        className={
          index < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
        }
      />
    ))}
  </div>
);

const UlasanCeo = () => {
  const dispatch = useDispatch();
  const { reviews, loading } = useSelector((state) => state.admin);
  const [ratingFilter, setRatingFilter] = useState(0);
  const [mediaFilter, setMediaFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    dispatch(fetchAllReviews());
  }, [dispatch]);

  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      const matchRating = ratingFilter === 0 || r.rating === ratingFilter;
      const hasMedia = r.media && r.media.length > 0;
      const matchMedia =
        mediaFilter === "all" ||
        (mediaFilter === "with-media" && hasMedia) ||
        (mediaFilter === "text-only" && !hasMedia);
      const searchLower = searchTerm.toLowerCase();
      const matchSearch =
        (r.user?.name || "").toLowerCase().includes(searchLower) ||
        (r.product?.name || "").toLowerCase().includes(searchLower) ||
        (r.comment || "").toLowerCase().includes(searchLower);
      let matchDate = true;
      if (startDate || endDate) {
        const reviewDate = new Date(r.createdAt);
        const start = startDate ? new Date(startDate) : new Date("1970-01-01");
        const end = endDate ? new Date(endDate) : new Date();
        end.setHours(23, 59, 59, 999);
        matchDate = reviewDate >= start && reviewDate <= end;
      }
      return matchRating && matchMedia && matchSearch && matchDate;
    });
  }, [reviews, ratingFilter, mediaFilter, searchTerm, startDate, endDate]);

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const tableColumn = [
      "No",
      "Tanggal",
      "Nama Pelanggan",
      "Produk",
      "Kategori",
      "Harga",
      "Rating",
      "Komentar",
    ];
    const tableRows = [];

    filteredReviews.forEach((review, index) => {
      const category = review.product?.category || "-";
      const price = review.product?.price
        ? `Rp ${review.product.price.toLocaleString("id-ID")}`
        : "-";
      const rowData = [
        index + 1,
        new Date(review.createdAt).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "short",
          year: "2-digit",
        }),
        review.user?.name || "Anonymous",
        review.product?.name || "Produk Dihapus",
        category,
        price,
        `${review.rating}`,
        review.comment || "-",
      ];
      tableRows.push(rowData);
    });

    const fullDateFile = `${new Date().getDate()}-${
      new Date().getMonth() + 1
    }-${new Date().getFullYear()}`;

    // Construct Filter Text
    let filterInfoParts = [];
    if (ratingFilter > 0) filterInfoParts.push(`Rating: ${ratingFilter}`);
    if (mediaFilter !== "all")
      filterInfoParts.push(
        `Media: ${mediaFilter === "with-media" ? "Foto/Video" : "Teks"}`
      );
    if (startDate || endDate) {
      const s = startDate
        ? new Date(startDate).toLocaleDateString("id-ID")
        : "Awal";
      const e = endDate
        ? new Date(endDate).toLocaleDateString("id-ID")
        : "Sekarang";
      filterInfoParts.push(`${s} - ${e}`);
    }
    const filterText =
      filterInfoParts.length > 0
        ? `Filter: ${filterInfoParts.join(" | ")}`
        : "Filter: Semua Data";

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 50,
      margin: { top: 50, left: 10, right: 10 },
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
        halign: "center",
      },
      didDrawPage: function (data) {
        const logoWidth = 22;
        const logoHeight = 22;
        const margin = data.settings.margin.left;
        const pageWidth = doc.internal.pageSize.getWidth();
        const textX = margin + logoWidth + 5;

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
        } catch (e) {}

        doc.setFontSize(14).setFont("helvetica", "bold");
        doc.text("PT. Jan Agro Nusantara", textX, 15);

        doc.setFontSize(10);
        doc.text("Laporan Ulasan Pelanggan (Feedback)", textX, 20);

        doc.setFontSize(8).setFont("helvetica", "normal");
        doc.text(
          "Jan Agro Nusantara Indonesia Pondok Chandra Indah No. 69 Surabaya 10130",
          textX,
          24
        );
        doc.text(
          "Email: janagronusantara@gmail.com | Contact Person: +62 811 762 788",
          textX,
          28
        );

        doc.setFontSize(8).setFont("helvetica", "italic");
        doc.text(filterText, textX, 32);

        doc.setDrawColor(0, 0, 0).setLineWidth(1);
        doc.line(margin, 36, pageWidth - data.settings.margin.right, 36);
      },
    });
    doc.save(`laporan_ulasan_${fullDateFile}.pdf`);
  };

  const inputClass =
    "bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5";
  const btnWhite =
    "border border-gray-300 bg-white text-gray-900 enabled:hover:bg-gray-100 focus:ring-0 focus:bg-white";
  const cardStyle =
    "bg-white border border-gray-200 shadow-md [&>div]:bg-white";

  return (
    <div className="w-full min-h-screen bg-white text-gray-900 p-6 space-y-8 font-sans">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Customer Reviews
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Monitor feedback dan kepuasan pelanggan secara real-time.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 w-full lg:w-auto">
          {/* Button Flowbite Aman */}
          <Button
            color="success"
            onClick={handleExportPDF}
            className="font-bold"
          >
            <FileText size={18} className="mr-2" /> Export PDF
          </Button>

          <div className="flex items-center justify-center px-4 py-2 bg-gray-900 text-white rounded-lg font-bold gap-2 shadow-md">
            <MessageSquare size={18} />
            <span>Total: {filteredReviews.length}</span>
          </div>
        </div>
      </div>

      {/* FILTER SECTION */}
      <Card className={cardStyle}>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* SEARCH (Native Input) */}
          <div className="col-span-1 sm:col-span-2 xl:col-span-1">
            <label className="text-xs font-bold uppercase mb-1.5 block text-gray-700">
              Cari Review
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search size={18} className="text-gray-500" />
              </div>
              <input
                type="text"
                className={`${inputClass} pl-10`}
                placeholder="User, produk, atau komentar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* DATE RANGE (Native Input) */}
          <div className="col-span-1 sm:col-span-2 xl:col-span-1">
            <label className="text-xs font-bold uppercase mb-1.5 block flex items-center gap-1 text-gray-700">
              <Calendar size={14} /> Rentang Tanggal
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={inputClass}
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {/* RATING FILTER (Manual Buttons) */}
          <div className="col-span-1">
            <label className="text-xs font-bold uppercase mb-1.5 block text-gray-700">
              Filter Rating
            </label>
            <div className="flex flex-wrap gap-1.5">
              {[0, 5, 4, 3, 2, 1].map((star) => (
                <button
                  key={star}
                  onClick={() => setRatingFilter(star)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                    ratingFilter === star
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {star === 0 ? (
                    "All"
                  ) : (
                    <span className="flex items-center gap-1">
                      {star} <Star size={10} fill="currentColor" />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* MEDIA TYPE SELECT (Native Select) */}
          <div className="col-span-1">
            <label className="text-xs font-bold uppercase mb-1.5 block text-gray-700">
              Tipe Konten
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Filter size={18} className="text-gray-500" />
              </div>
              <select
                value={mediaFilter}
                onChange={(e) => setMediaFilter(e.target.value)}
                className={`${inputClass} pl-10`}
              >
                <option value="all">Semua Tipe</option>
                <option value="with-media">Dengan Foto/Video</option>
                <option value="text-only">Hanya Teks</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* REVIEWS LIST */}
      {loading ? (
        <div className="flex justify-center items-center py-20 bg-white">
          <Spinner size="xl" color="gray" aria-label="Loading..." />
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.length > 0 ? (
            filteredReviews.map((review) => (
              <Card key={review._id} className={cardStyle}>
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* LEFT: PRODUCT INFO */}
                  <div className="w-full lg:w-1/4 flex flex-row lg:flex-col items-center lg:items-start gap-4 border-b lg:border-b-0 lg:border-r border-gray-100 pb-4 lg:pb-0 lg:pr-4">
                    <div className="w-20 h-20 lg:w-full lg:h-40 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex-shrink-0">
                      {review.product?.image ? (
                        <img
                          src={review.product.image}
                          alt={review.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-xs text-gray-400">
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Badge color="gray" className="w-fit mb-1 text-white">
                        {review.product?.category || "UMUM"}
                      </Badge>
                      <h3 className="font-bold text-gray-900 text-sm sm:text-base leading-tight line-clamp-2 mb-1">
                        {review.product?.name || "Produk Dihapus"}
                      </h3>
                      <p className="text-sm font-mono text-gray-600">
                        {review.product?.price
                          ? `Rp ${review.product.price.toLocaleString("id-ID")}`
                          : "-"}
                      </p>
                    </div>
                  </div>

                  {/* RIGHT: REVIEW CONTENT */}
                  <div className="flex-1 min-w-0">
                    {/* User Header */}
                    <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
                      <div className="flex items-center gap-3">
                        <Avatar
                          img={review.user?.avatar}
                          rounded
                          placeholderInitials={
                            review.user?.name?.charAt(0) || "U"
                          }
                        />
                        <div>
                          <p className="font-bold text-gray-900 text-sm">
                            {review.user?.name || "Anonymous"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(review.createdAt).toLocaleString(
                              "id-ID",
                              { dateStyle: "long", timeStyle: "short" }
                            )}
                          </p>
                        </div>
                      </div>
                      {/* Manual Star Rating (Safe) */}
                      <div className="bg-white border border-gray-200 rounded px-2 py-1">
                        <StarRating rating={review.rating} />
                      </div>
                    </div>

                    {/* Comment Box */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
                      <p className="text-gray-800 text-sm leading-relaxed">
                        "{review.comment}"
                      </p>
                    </div>

                    {/* Media Gallery */}
                    {review.media && review.media.length > 0 && (
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {review.media.map((m, idx) => (
                          <div
                            key={idx}
                            className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 bg-black flex-shrink-0 group cursor-pointer"
                          >
                            {m.type === "video" ? (
                              <>
                                <video
                                  src={m.url}
                                  className="w-full h-full object-cover opacity-80"
                                />
                                <div className="absolute inset-0 flex items-center justify-center text-white">
                                  <PlayCircle size={24} />
                                </div>
                              </>
                            ) : (
                              <a
                                href={m.url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <img
                                  src={m.url}
                                  alt="review media"
                                  className="w-full h-full object-cover hover:opacity-90 transition-opacity"
                                />
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card className={`${cardStyle} py-12`}>
              <div className="flex flex-col items-center justify-center text-gray-400">
                <Search size={48} className="mb-2 opacity-20" />
                <p className="font-medium text-sm">
                  Tidak ada ulasan yang sesuai filter.
                </p>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default UlasanCeo;
