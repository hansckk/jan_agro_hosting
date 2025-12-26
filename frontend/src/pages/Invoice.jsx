import React, { useEffect, useState, useRef } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { ArrowLeft, Download } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { janAgroLogoBase64 as logo } from "../assets/logoBase64";

const Invoice = () => {
  const { orderId } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!order);
  const invoiceRef = useRef();

  // Fetch data jika tidak ada state (misal user refresh halaman)
  useEffect(() => {
    if (!order) {
      const fetchOrder = async () => {
        try {
          const token = localStorage.getItem("token"); 
          const response = await fetch(
            `http://localhost:3000/api/checkout/detail/${orderId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const data = await response.json();
          if (data.success) {
            setOrder(data.data);
          }
        } catch (error) {
          console.error("Failed to fetch invoice data", error);
        } finally {
          setLoading(false);
        }
      };
      fetchOrder();
    }
  }, [orderId, order]);

  const handleDownloadPDF = async () => {
    const element = invoiceRef.current;
    
    // Perbaikan opsi html2canvas agar hasil cetak lebih rapi
    const canvas = await html2canvas(element, {
      scale: 2, 
      useCORS: true, 
      backgroundColor: "#ffffff", // Pastikan background putih saat dicetak
    });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Invoice-${orderId.substring(0, 8)}.pdf`);
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center pt-24">
        Loading Invoice...
      </div>
    );
  if (!order)
    return (
      <div className="min-h-screen flex items-center justify-center pt-24">
        Order not found.
      </div>
    );

  return (
    // --- PERUBAHAN DI SINI ---
    // Ubah 'py-12' menjadi 'pt-32 pb-12' agar ada jarak cukup dari navbar
    <div className="min-h-screen bg-gray-100 pt-32 pb-12 px-4 sm:px-6 lg:px-8">
      
      {/* Tombol Navigasi & Aksi */}
      <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center no-print">
        <Link
          to="/pesanan"
          className="flex items-center gap-2 text-gray-600 hover:text-black transition"
        >
          <ArrowLeft size={20} /> Back to Orders
        </Link>
        <button
          onClick={handleDownloadPDF}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition shadow-sm"
        >
          <Download size={18} /> Download PDF
        </button>
      </div>

      {/* Area Nota / Invoice */}
      <div
        className="max-w-4xl mx-auto bg-white p-8 shadow-lg rounded-sm animate-fade-in"
        ref={invoiceRef}
      >
        {/* Header Nota */}
        <div className="flex justify-between items-start border-b pb-8 mb-8">
          <div>
            <img src={logo} alt="Company Logo" className="h-16 w-auto mb-4 object-contain" />
            <p className="font-bold text-xl text-black">INVOICE</p>
            <p className="text-gray-500 text-sm">
              INV-{order._id.substring(0, 8).toUpperCase()}
            </p>
          </div>
          <div className="text-right text-sm text-gray-600">
            <h4 className="font-bold text-black mb-1">Jan Agro Nusantara</h4>
            <p>Pondok Chandra Indah No. 69</p>
            <p>Surabaya, Indonesia 10130</p>
            <p>janagronusantara@gmail.com</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h5 className="font-bold text-gray-500 text-sm mb-2 uppercase">
              Billed To
            </h5>
            <p className="font-bold text-black">{order.nama}</p>
            <p className="text-gray-600 text-sm whitespace-pre-line">
              {order.alamat}
            </p>
            <p className="text-gray-600 text-sm mt-1">{order.noTelpPenerima}</p>
          </div>
          <div className="text-right">
            <h5 className="font-bold text-gray-500 text-sm mb-2 uppercase">
              Order Details
            </h5>
            <p className="text-sm">
              <span className="text-gray-600">Order Date:</span>{" "}
              {new Date(order.createdAt).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
            <p className="text-sm">
              <span className="text-gray-600">Payment Method:</span>{" "}
              {order.paymentType || order.metodePembayaran || "Bank Transfer"}
            </p>
            <p className="text-sm">
              <span className="text-gray-600">Status:</span>{" "}
              <span className="capitalize text-green-600 font-medium">
                {order.status}
              </span>
            </p>
          </div>
        </div>

        <div className="mb-8">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="py-3 text-sm font-bold text-gray-600 uppercase">
                  Description
                </th>
                <th className="py-3 text-sm font-bold text-gray-600 uppercase text-right">
                  Price
                </th>
                <th className="py-3 text-sm font-bold text-gray-600 uppercase text-right">
                  Qty
                </th>
                <th className="py-3 text-sm font-bold text-gray-600 uppercase text-right">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, index) => (
                <tr key={index} className="border-b border-gray-100">
                  <td className="py-4 text-black font-medium">{item.name}</td>
                  <td className="py-4 text-right text-gray-600">
                    IDR {item.price.toLocaleString("id-ID")}
                  </td>
                  <td className="py-4 text-right text-gray-600">
                    {item.quantity}
                  </td>
                  <td className="py-4 text-right text-black font-medium">
                    IDR {(item.price * item.quantity).toLocaleString("id-ID")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end">
          <div className="w-full sm:w-1/2 space-y-3">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span>IDR {order.subtotal.toLocaleString("id-ID")}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Shipping Fee ({order.kurir?.nama || "Courier"})</span>
              <span>
                IDR {order.kurir?.biaya?.toLocaleString("id-ID") || 0}
              </span>
            </div>
            {order.diskon > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>
                  Discount {order.kodeVoucher ? `(${order.kodeVoucher})` : ""}
                </span>
                <span>- IDR {order.diskon.toLocaleString("id-ID")}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold text-black border-t-2 border-gray-200 pt-4 mt-2">
              <span>Total</span>
              <span>IDR {order.totalHarga.toLocaleString("id-ID")}</span>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t text-center text-gray-500 text-sm">
          <p>Thank you for your purchase!</p>
          <p>
            If you have any questions about this invoice, please contact
            support.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Invoice;