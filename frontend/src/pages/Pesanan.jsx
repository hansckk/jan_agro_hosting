import React, { useState, useEffect } from "react";
import { getStatusLabel } from "../i18n/labels";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  MessageSquare,
  PackageCheck,
  AlertCircle,
  XCircle,
  FileText,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux"; // Tambah useSelector
import { requestOrderCancellation } from "../features/cart/checkoutSlice";
import axios from "axios"; // Import Axios

// GANTI URL INI SESUAI BACKEND ANDA
const API_URL = "http://localhost:3000/api"; 

// --- MODALS COMPONENTS (Tidak Berubah) ---
const ConfirmationModal = ({ order, onConfirm, onCancel }) => {
  if (!order) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-sm animate-fade-in">
        <h2 className="text-xl font-bold mb-4">Complete Order?</h2>
        <p className="text-gray-600 mb-6">
          Are you sure you want to complete order #{order._id.substring(0, 8)}
          ...? This action cannot be undone.
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onCancel}
            className="py-2 px-6 bg-gray-200 text-black rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(order._id)}
            className="py-2 px-6 bg-black text-white rounded-md hover:bg-gray-800"
          >
            Yes, Complete
          </button>
        </div>
      </div>
    </div>
  );
};

const CancellationModal = ({ order, onCancel, onSubmit }) => {
  const [reason, setReason] = useState("");
  if (!order) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md animate-fade-in">
        <h2 className="text-xl font-bold mb-4">Request Order Cancellation?</h2>
        <p className="text-gray-600 mb-4">
          Please enter the reason for cancelling order #
          {order._id.substring(0, 8)}....
        </p>
        <textarea
          rows="4"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Example: I ordered the wrong product..."
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-black focus:border-black"
        ></textarea>
        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={onCancel}
            className="py-2 px-6 bg-gray-200 text-black rounded-md hover:bg-gray-300"
          >
            Close
          </button>
          <button
            onClick={() => onSubmit(order._id, reason)}
            disabled={!reason.trim()}
            className="py-2 px-6 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400"
          >
            Submit Cancellation
          </button>
        </div>
      </div>
    </div>
  );
};

// --- HELPER FUNCTIONS ---
const formatPhoneNumber = (phone) => {
  if (!phone) return "-";
  const digits = String(phone).replace(/\D/g, "");
  let formatted = "+62 ";
  if (digits.length > 4) {
    let remaining = digits;
    if (remaining.length > 4) {
      formatted += remaining.substring(0, 4) + "-";
      remaining = remaining.substring(4);
    }
    if (remaining.length > 4) {
      formatted += remaining.substring(0, 4) + "-";
      remaining = remaining.substring(4);
    }
    formatted += remaining;
  } else {
    formatted += digits;
  }
  return formatted;
};

const TrackerStep = ({ icon, label, isActive, isCompleted }) => {
  return (
    <div className="flex flex-col items-center text-center w-24 z-10">
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
          isActive
            ? "bg-black border-black scale-110"
            : "bg-white border-gray-300"
        } ${isCompleted ? "bg-black border-black" : ""}`}
      >
        {React.cloneElement(icon, {
          size: 24,
          className: `transition-colors duration-300 ${
            isActive || isCompleted ? "text-white" : "text-gray-400"
          }`,
        })}
      </div>
      <p
        className={`mt-2 text-sm font-semibold transition-colors duration-300 ${
          isActive || isCompleted ? "text-black" : "text-gray-500"
        }`}
      >
        {label}
      </p>
    </div>
  );
};

// --- FUNGSI CEK REVIEW ---
const checkIsReviewed = (orderId, productId, reviewsList, userId) => {
  if (!reviewsList || !Array.isArray(reviewsList)) return false;

  return reviewsList.some((review) => {
    // 1. Normalisasi ID (String)
    const rUserId = String(review.userId || review.user?._id || review.user || "");
    const rProductId = String(review.productId || review.product?._id || review.product || "");
    const rOrderId = String(review.order?._id || review.order || "");

    // 2. Bandingkan
    return (
      rUserId === String(userId) &&
      rProductId === String(productId) &&
      rOrderId === String(orderId)
    );
  });
};

// --- MAIN COMPONENT ---
const Pesanan = ({
  checkouts,
  user,
  // Kita abaikan 'reviews' dari props karena itu data dummy
  // reviews, 
  onConfirmFinished,
  onRequestCancellation,
}) => {
  const [confirmingOrder, setConfirmingOrder] = useState(null);
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const [statusOverrides, setStatusOverrides] = useState({});
  
  // STATE BARU: Untuk menyimpan review asli dari API
  const [realReviews, setRealReviews] = useState([]);
  const dispatch = useDispatch();
  
  // Ambil token dari redux untuk auth fetch
  const { token } = useSelector((state) => state.users);

  // --- FETCH REVIEWS FROM API ---
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        // Panggil endpoint /all yang Anda buat di backend
        const response = await axios.get(`${API_URL}/reviews/all`, {
          headers: {
             Authorization: `Bearer ${token}` // Sertakan token jika perlu
          }
        });
        
        if (response.data && response.data.success) {
          console.log("✅ Real Reviews Fetched:", response.data.data);
          setRealReviews(response.data.data);
        }
      } catch (error) {
        console.error("❌ Failed to fetch reviews:", error);
      }
    };

    if (token) {
      fetchReviews();
    }
  }, [token]);


  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h1 className="text-3xl font-bold text-black mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-8">
            Please log in to view your order history.
          </p>
          <Link
            to="/"
            className="bg-black text-white py-3 px-8 rounded-sm font-medium hover:bg-gray-800 transition"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const userCheckouts = checkouts || [];

  const statusLevels = {
    pending: 0,
    diproses: 1,
    "pembatalan diajukan": 1,
    dikirim: 2,
    sampai: 3,
    "pengembalian diajukan": 3,
    "pengembalian ditolak": 3,
    selesai: 4,
    "pengembalian berhasil": 4,
    dibatalkan: 4,
  };

  const handleConfirm = (orderId) => {
    // Prefer parent handler if provided, otherwise call API and update local override
    if (typeof onConfirmFinished === "function") {
      onConfirmFinished(orderId);
      setConfirmingOrder(null);
      return;
    }

    // Fallback: call backend to set status to 'selesai'
    (async () => {
      try {
        const token = (window.localStorage.getItem("token") || window.localStorage.getItem("accessToken")) || null;
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        await axios.put(`${API_URL}/checkouts/${orderId}/status`, { status: "selesai" }, { headers });
        setStatusOverrides((s) => ({ ...s, [orderId]: "selesai" }));
        alert("Order marked as completed.");
      } catch (err) {
        console.error(err);
        alert("Failed to complete order.");
      } finally {
        setConfirmingOrder(null);
      }
    })();
  };

  const handleSubmitCancellation = async (orderId, reason) => {
    const resultAction = await dispatch(
      requestOrderCancellation({ orderId, reason })
    );

    console.log("Cancellation resultAction:", resultAction);

    if (requestOrderCancellation.fulfilled.match(resultAction)) {
      // Update local status to 'dicancel' to reflect immediate cancellation in UI
      setStatusOverrides((s) => ({ ...s, [orderId]: "dicancel" }));
      alert("Cancellation submitted!");
    } else {
      // resultAction.payload may be an object; extract a message or stringify
      const payload = resultAction.payload;
      let errMsg = "Failed to request cancellation";
      if (payload) {
        if (typeof payload === "string") errMsg = payload;
        else if (payload.message) errMsg = payload.message;
        else if (payload.error) errMsg = payload.error;
        else errMsg = JSON.stringify(payload);
      } else if (resultAction.error) {
        errMsg = resultAction.error.message || JSON.stringify(resultAction.error);
      }
      alert(errMsg);
    }

    setCancellingOrder(null);
  };

  return (
    <>
      <ConfirmationModal
        order={confirmingOrder}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmingOrder(null)}
      />
      <CancellationModal
        order={cancellingOrder}
        onSubmit={handleSubmitCancellation}
        onCancel={() => setCancellingOrder(null)}
      />

      <div className="min-h-screen bg-gray-50 pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link
            to="/shop"
            className="flex items-center gap-2 text-gray-600 hover:text-black mb-8 transition"
          >
            <ArrowLeft size={20} /> Back to Shop
          </Link>
          <h1 className="text-4xl font-bold text-black mb-8">
            Your Order History
          </h1>

          {userCheckouts.length > 0 ? (
            <div className="space-y-8">
              {userCheckouts.map((order) => {
                const displayStatus = statusOverrides[order._id] || order.status;
                const isReturnSuccess = displayStatus === "pengembalian berhasil";
                const isCancelled = displayStatus === "dibatalkan" || displayStatus === "dicancel";
                const currentStatusLevel = statusLevels[displayStatus] || 0;

                // --- LOGIC 1: Cek Semua Item menggunakan realReviews ---
                const allItemsReviewed =
                  order.items.length > 0 &&
                  order.items.every((item) => {
                    const itemId = item.product?._id || item.product;
                    // GUNAKAN realReviews di sini
                    return checkIsReviewed(order._id, itemId, realReviews, user._id);
                  });

                return (
                  <div
                    key={order._id}
                    className="bg-white p-6 rounded-sm border"
                  >
                    {/* Header Order */}
                    <div className="flex flex-col md:flex-row justify-between md:items-center border-b pb-4 mb-6">
                      <div>
                        <p className="font-bold text-lg">
                          Order #{order._id.substring(0, 8)}...
                        </p>
                        <p className="text-sm text-gray-500">
                          Date:{" "}
                          {new Date(order.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            }
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 mt-2 md:mt-0">
                        <span className="text-sm text-gray-500">Status:</span>
                        <span className="font-semibold capitalize text-black">
                          {getStatusLabel(displayStatus)}
                        </span>
                      </div>
                    </div>

                    {/* Progress Tracker */}
                    <div className="flex items-center justify-between px-2 sm:px-4 my-8 relative">
                      <div className="absolute top-6 left-0 w-full h-1 bg-gray-300 -translate-y-1/2"></div>
                      <div
                        className="absolute top-6 left-0 h-1 bg-black -translate-y-1/2 transition-all duration-500"
                        style={{
                          width: `${
                            currentStatusLevel > 0
                              ? (currentStatusLevel - 1) * 33.3
                              : 0
                          }%`,
                        }}
                      ></div>
                      <TrackerStep
                        icon={<Package />}
                        label="Processed"
                        isActive={currentStatusLevel === 1}
                        isCompleted={currentStatusLevel >= 1}
                      />
                      <TrackerStep
                        icon={<Truck />}
                        label="Shipped"
                        isActive={currentStatusLevel === 2}
                        isCompleted={currentStatusLevel >= 2}
                      />
                      <TrackerStep
                        icon={<CheckCircle />}
                        label="Delivered"
                        isActive={currentStatusLevel === 3}
                        isCompleted={currentStatusLevel >= 3}
                      />
                      <TrackerStep
                        icon={isCancelled ? <XCircle /> : <PackageCheck />}
                        label={
                          isReturnSuccess
                            ? "Returned"
                            : isCancelled
                            ? "Cancelled"
                            : "Completed"
                        }
                        isActive={currentStatusLevel === 4}
                        isCompleted={currentStatusLevel >= 4}
                      />
                    </div>
                    
                    {/* ... (Status Banners Sama Seperti Sebelumnya) ... */}
                     {/* Copy Paste bagian banner status (Pending, Diproses, Sampai, dll) di sini */}
                     {displayStatus === "selesai" && (
                       <div className="text-center border-t border-b py-6 my-6 bg-gray-50">
                         <h3 className="font-semibold text-black mb-4">
                           Order Completed.
                         </h3>
                         <p className="text-sm text-gray-500">
                           Thank you for shopping with us!
                         </p>
                       </div>
                     )}


                    {/* Grid Detail Pesanan */}
                    <div className="border-t grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
                      {/* Left Column: Products List */}
                      <div>
                        <h4 className="font-semibold mb-3 text-lg">
                          Order Details
                        </h4>
                        <div className="space-y-4">
                          {order.items.map((item) => {
                            const itemId = item.product?._id || item.product;
                            // GUNAKAN realReviews
                            const hasReviewed = checkIsReviewed(order._id, itemId, realReviews, user._id);

                            return (
                              <div
                                key={itemId}
                                className="flex flex-col sm:flex-row gap-4 justify-between sm:items-center border-b pb-4 last:border-b-0"
                              >
                                <div className="flex gap-4">
                                  <div className="w-16 h-16 bg-gray-100 rounded-md flex-shrink-0 overflow-hidden">
                                    {item.image ? (
                                      <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-3xl">
                                        🪴
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <p className="font-bold text-black">
                                      {item.name}
                                    </p>
                                    <p className="text-gray-500 text-sm">
                                      {item.quantity} x IDR{" "}
                                      {item.price.toLocaleString("id-ID")}
                                    </p>
                                  </div>
                                </div>

                                {displayStatus === "selesai" && (
                                  <div className="mt-2 sm:mt-0">
                                    {hasReviewed ? (
                                      <span className="flex items-center gap-1 text-green-600 font-medium text-sm border border-green-200 bg-green-50 px-3 py-1 rounded-full">
                                        <CheckCircle size={14} /> Reviewed
                                      </span>
                                    ) : (
                                      <Link
                                        to={`/review/${itemId}`}
                                        state={{ orderId: order._id }}
                                        className="flex items-center gap-2 text-sm bg-black text-white py-2 px-4 rounded-md font-medium hover:bg-gray-800 transition"
                                      >
                                        <MessageSquare size={16} /> Write Review
                                      </Link>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* --- TOMBOL INVOICE --- */}
                        {displayStatus === "selesai" && allItemsReviewed && (
                          <div className="mt-6 pt-6 border-t border-dashed border-gray-300 animate-fade-in flex flex-col items-start sm:items-center text-center bg-gray-50 p-4 rounded-md">
                            <p className="text-sm text-gray-600 mb-3">
                              Terima kasih! Seluruh pesanan telah selesai dan
                              diulas.
                            </p>
                            <Link
                              to={`/invoice/${order._id}`}
                              state={{ order: order }}
                              className="inline-flex items-center justify-center gap-2 bg-white border-2 border-black text-black px-6 py-2.5 rounded-md hover:bg-black hover:text-white transition font-medium w-full sm:w-auto shadow-sm"
                            >
                              <FileText size={18} /> Download / See Invoice
                            </Link>
                          </div>
                        )}
                      </div>

                      {/* Right Column: Payment & Address */}
                      <div className="space-y-6">
                        {/* Copy Payment & Address Section */}
                        <div>
                          <h4 className="font-semibold mb-3 text-lg">
                            Payment Details
                          </h4>
                          <div className="text-sm p-4 bg-gray-50 rounded-md space-y-2">
                             <div className="flex justify-between">
                              <span className="text-gray-600">Subtotal:</span>
                              <span className="font-medium text-black">
                                IDR {order.subtotal.toLocaleString("id-ID")}
                              </span>
                            </div>
                             <div className="flex justify-between">
                              <span className="text-gray-600">
                                Courier Fee:
                              </span>
                              <span className="font-medium text-black">
                                IDR {order.kurir.biaya.toLocaleString("id-ID")}
                              </span>
                            </div>
                            <div className="flex justify-between font-bold text-base border-t border-gray-300 pt-2 mt-2">
                              <span>Total Paid:</span>
                              <span>
                                IDR {order.totalHarga.toLocaleString("id-ID")}
                              </span>
                            </div>
                          </div>
                          {/* Action Buttons: Cancel (visible when pending/diproses) and Complete Order (always visible, enabled when delivered) */}
                          <div className="mt-4 flex flex-col sm:flex-row gap-3">
                            {/* Cancel button - only when order originally pending or diproses */}
                            { (displayStatus === 'pending' || displayStatus === 'diproses') && (
                              <button
                                onClick={() => setCancellingOrder(order)}
                                className="w-full sm:w-auto bg-red-600 text-white px-4 py-2 rounded font-bold hover:bg-red-700 transition"
                              >
                                Cancel Order
                              </button>
                            ) }

                            {/* Complete Order - visible always but disabled until delivered ('sampai') */}
                            <button
                              onClick={() => setConfirmingOrder(order)}
                              disabled={displayStatus !== 'sampai'}
                              className={`w-full sm:w-auto px-4 py-2 rounded font-bold transition ${displayStatus === 'sampai' ? 'bg-black text-white hover:bg-gray-800' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
                            >
                              Complete Order
                            </button>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-3 text-lg">Shipping Address</h4>
                          <div className="text-sm p-4 bg-gray-50 rounded-md">
                            <p className="font-bold text-black">{order.nama}</p>
                            <p className="text-gray-600">{formatPhoneNumber(order.noTelpPenerima)}</p>
                            <p className="text-gray-600 mt-1 whitespace-pre-line">{order.alamat}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-white border rounded-sm">
              <h2 className="text-2xl font-semibold text-black">
                No Order History
              </h2>
              <p className="text-gray-500 mt-2">
                You haven't placed any orders yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Pesanan;