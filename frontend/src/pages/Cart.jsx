import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Trash2, AlertCircle, CheckCircle } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import L from "leaflet";
import MapComponent from "../components/MapComponent";
import axios from "axios";
import {
  updateCartQuantity,
  removeCartItem,
  fetchCart,
  clearCart,
} from "../features/cart/cartSlice";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const Notification = ({ message, type, onClose }) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => onClose(), 3000);
    return () => clearTimeout(timer);
  }, [message, onClose]);
  if (!message) return null;
  const bgColor = type === "success" ? "bg-green-600" : "bg-red-600";
  const Icon = type === "success" ? CheckCircle : AlertCircle;
  return (
    <div
      className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 p-4 rounded-md shadow-lg flex items-center gap-3 transition-transform animate-fade-in-down ${bgColor} text-white`}
    >
      <Icon size={20} /> <span>{message}</span>
    </div>
  );
};

const VoucherCard = ({ voucher, onSelect, isSelected }) => {
  const isAvailable = voucher.isActive && voucher.currentUses < voucher.maxUses;
  return (
    <div
      onClick={() => isAvailable && onSelect(voucher)}
      className={`p-3 border rounded-md flex-shrink-0 ${
        isAvailable ? "cursor-pointer" : "cursor-not-allowed"
      } ${
        isSelected
          ? "border-green-500 bg-green-50 border-2"
          : "border-gray-300 bg-white"
      } ${
        !isAvailable ? "bg-gray-100 opacity-60" : "hover:border-green-400"
      } transition-all duration-200`}
    >
      <div className="flex items-center gap-3">
        <img
          src="/image/janAgroVoucher.png"
          alt="Voucher Icon"
          className="w-12 h-12 object-contain"
        />
        <div>
          <p className="font-bold text-sm text-gray-800">{voucher.code}</p>
          <p className="text-xs text-gray-600">
            Discount {voucher.discountPercentage}%
          </p>
          {!isAvailable && (
            <p className="text-xs text-red-500 font-semibold">Unavailable</p>
          )}
        </div>
      </div>
    </div>
  );
};

const Cart = ({ produk, vouchers }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { items: cart, loading } = useSelector((state) => state.cart);
  const { user, token } = useSelector((state) => state.users);
  const userPhone = useSelector((state) => state.users.user?.phone || "");

  const [customerName, setCustomerName] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [useProfileName, setUseProfileName] = useState(false);
  const [useProfileAddress, setUseProfileAddress] = useState(false);
  const [useProfilePhone, setUseProfilePhone] = useState(false);
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState({ message: "", type: "" });

  const hasFetched = useRef(false);
  const [mapPos, setMapPos] = useState([-6.2, 106.8]);
  const [distanceKm, setDistanceKm] = useState(0);
  const warehousePos = L.latLng(-6.2, 106.816666);

  useEffect(() => {
    const pointB = L.latLng(mapPos[0], mapPos[1]);
    const distanceMeters = warehousePos.distanceTo(pointB);
    setDistanceKm((distanceMeters / 1000).toFixed(2));
  }, [mapPos]);

  useEffect(() => {
    fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${mapPos[0]}&lon=${mapPos[1]}`
    )
      .then((res) => res.json())
      .then((data) => setCustomerAddress(data.display_name))
      .catch(() => setCustomerAddress(""));
  }, [mapPos]);

  useEffect(() => {
    if (!hasFetched.current && token) {
      dispatch(fetchCart());
      hasFetched.current = true;
    }
  }, [dispatch, token]);

  const onCloseNotification = useCallback(() => {
    setNotification({ message: "", type: "" });
  }, []);

  const handleCheckboxChange = (type, isChecked) => {
    setError("");
    onCloseNotification();
    switch (type) {
      case "name":
        setUseProfileName(isChecked);
        setCustomerName(isChecked && user ? user.name || "" : "");
        break;
      case "address":
        setUseProfileAddress(isChecked);
        setCustomerAddress(
          isChecked && user ? user.address || user.alamat || "" : ""
        );
        break;
      case "phone":
        setUseProfilePhone(isChecked);
        if (isChecked) {
          if (!userPhone) {
            setError(
              "Your profile phone number is empty. Please add it first."
            );
            return;
          }
          setCustomerPhone(userPhone);
        } else {
          setCustomerPhone("");
        }
        break;
      default:
        break;
    }
  };

  const handlePhoneChange = (e) => {
    const onlyDigits = e.target.value.replace(/\D/g, "");
    setCustomerPhone(onlyDigits);
  };

  const cartDetails = cart
    .map((item) => {
      let productData =
        item.productId && typeof item.productId === "object"
          ? item.productId
          : produk.find((p) => p._id === item.productId);
      if (!productData) return null;
      return { ...productData, quantity: item.quantity };
    })
    .filter(Boolean);

  const subtotal = cartDetails.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const totalQuantity = cartDetails.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const feePerKm = 1000;
  const kurirFee = distanceKm ? Math.ceil(distanceKm) * feePerKm : feePerKm;

  const discountAmount = appliedVoucher
    ? (subtotal * appliedVoucher.discountPercentage) / 100
    : 0;
  const totalHarga = subtotal - discountAmount + kurirFee;

  const handleSelectVoucher = (voucher) => {
    setError("");
    onCloseNotification();
    if (appliedVoucher && appliedVoucher._id === voucher._id) {
      setAppliedVoucher(null);
      setNotification({
        message: `Voucher ${voucher.code} Cancelled.`,
        type: "error",
      });
    } else {
      setAppliedVoucher(voucher);
      setNotification({
        message: `Voucher ${voucher.code} Successfully applied!`,
        type: "success",
      });
    }
  };

  const handleDecreaseQuantity = (item) => {
    if (item.quantity > 1) {
      dispatch(
        updateCartQuantity({
          productId: item._id,
          quantity: item.quantity - 1,
        })
      );
    } else {
      dispatch(removeCartItem(item._id));
    }
  };

  const handleCheckoutClick = async () => {
    setError("");
    if (!user) {
      setError("Please log in.");
      return;
    }
    if (!customerName || !customerAddress || !customerPhone) {
      setError("Data incomplete.");
      return;
    }
    if (totalQuantity === 0) {
      setError("Cart empty.");
      return;
    }

    const checkoutData = {
      userId: user._id,
      nama: customerName,
      alamat: customerAddress,
      noTelpPenerima: customerPhone,
      items: cartDetails,
      subtotal,
      diskon: discountAmount,
      kodeVoucher: appliedVoucher ? appliedVoucher.code : null,
      kurir: { nama: "JanAgro Courier", biaya: kurirFee },
      totalHarga,
      metodePembayaran: "Online Payment",
    };

    try {
      const response = await axios.post(
        `${API_URL}/checkouts/create`,
        checkoutData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { token: transactionToken, orderId } = response.data;

      if (!transactionToken || !orderId) throw new Error("Transaction failed.");

      window.snap.pay(transactionToken, {
        onSuccess: async (result) => {
          console.log("Payment Success! Verifying...", result);

          try {
            await axios.post(
              `${API_URL}/checkouts/verify-payment/${orderId}`,
              {},
              { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log("Verification success. Stock updated.");

            // 4. Update UI
            dispatch(clearCart());
            setNotification({
              message: "Payment successful! Order processed.",
              type: "success",
            });
            setTimeout(() => navigate("/pesanan"), 2000);
          } catch (verifyError) {
            console.error("Verification failed:", verifyError);
            navigate("/pesanan");
          }
        },
        onPending: (result) => {
          console.log("Pending:", result);
          setNotification({ message: "Waiting for payment.", type: "info" });
          setTimeout(() => navigate("/pesanan"), 2000);
        },
        onError: (result) => {
          console.log("Error:", result);
          setError("Payment failed.");
        },
        onClose: () => console.log("Closed"),
      });
    } catch (err) {
      console.error(err);
      setError("Failed to process checkout.");
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      {notification.message && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={onCloseNotification}
        />
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          to="/shop"
          className="flex items-center gap-2 text-gray-600 hover:text-black mb-8 transition"
        >
          <ArrowLeft size={20} /> Continue Shopping
        </Link>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-6 rounded-sm border">
              <h2 className="text-xl font-bold mb-4">
                Shopping Cart ({totalQuantity} item)
              </h2>
              {cartDetails.length > 0 ? (
                <div className="space-y-4">
                  {cartDetails.map((item) => (
                    <div
                      key={item._id}
                      className="flex items-center gap-4 border-b pb-4 last:border-b-0 last:pb-0"
                    >
                      <div className="w-20 h-20 bg-gray-100 rounded-sm flex-shrink-0 overflow-hidden">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-4xl flex items-center justify-center h-full">
                            🪴
                          </span>
                        )}
                      </div>
                      <div className="flex-grow">
                        <p className="font-bold">{item.name}</p>
                        <p className="text-sm text-gray-500">
                          Rp {item.price.toLocaleString("id-ID")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 border rounded-sm">
                        {/* BUTTON MINUS DENGAN LOGIKA HAPUS */}
                        <button
                          onClick={() => handleDecreaseQuantity(item)}
                          disabled={loading}
                          className="px-3 py-1 hover:bg-gray-100 disabled:opacity-50"
                        >
                          -
                        </button>
                        <span className="px-2 font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            dispatch(
                              updateCartQuantity({
                                productId: item._id,
                                quantity: item.quantity + 1,
                              })
                            )
                          }
                          disabled={loading}
                          className="px-3 py-1 hover:bg-gray-100 disabled:opacity-50"
                        >
                          +
                        </button>
                      </div>
                      <p className="font-semibold w-28 text-right">
                        Rp{" "}
                        {(item.price * item.quantity).toLocaleString("id-ID")}
                      </p>
                      <button
                        onClick={() => dispatch(removeCartItem(item._id))}
                        disabled={loading}
                        className="text-gray-400 hover:text-red-500 disabled:opacity-50"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <h3 className="text-xl font-semibold text-black">
                    Your Cart is Empty
                  </h3>
                  <p className="text-gray-500 mt-2">
                    Looks like you haven't added anything to your cart yet.
                  </p>
                </div>
              )}
            </div>

            {/* Bagian Form Address (Sama) */}
            <div className="bg-white p-6 rounded-sm border">
              <h2 className="text-xl font-bold mb-4">Delivery Details</h2>
              {/* ... (Konten Address sama dengan kode Anda sebelumnya) ... */}
              {user && (
                <div className="space-y-2 mb-4 p-3 bg-gray-50 rounded-md border">
                  <label className="flex items-center gap-2 cursor-pointer text-sm">
                    <input
                      type="checkbox"
                      checked={useProfileName}
                      onChange={(e) =>
                        handleCheckboxChange("name", e.target.checked)
                      }
                      className="form-checkbox"
                    />{" "}
                    Use Profile Name
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm">
                    <input
                      type="checkbox"
                      checked={useProfileAddress}
                      onChange={(e) =>
                        handleCheckboxChange("address", e.target.checked)
                      }
                      className="form-checkbox"
                    />{" "}
                    Use Profile Address
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm">
                    <input
                      type="checkbox"
                      checked={useProfilePhone}
                      onChange={(e) =>
                        handleCheckboxChange("phone", e.target.checked)
                      }
                      className="form-checkbox"
                    />{" "}
                    Use Profile Phone Number
                  </label>
                </div>
              )}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Receiver Name
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    disabled={useProfileName}
                    className="w-full p-3 border rounded-sm focus:ring-2 focus:ring-black disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Address
                  </label>
                  <div className="sticky top-24 z-20 bg-white shadow-lg rounded-lg overflow-hidden mb-4 border border-gray-200">
                    <div className="h-64 w-full relative">
                      <MapComponent
                        mapPos={mapPos}
                        setMapPos={setMapPos}
                        setDistanceKm={setDistanceKm}
                      />
                    </div>
                    <div className="p-3 bg-gray-50 border-t text-xs text-gray-600 flex justify-between items-center">
                      <span>Drag marker to set location</span>
                      <span className="font-bold">
                        Distance: {distanceKm} km
                      </span>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    placeholder="Selected address will appear here..."
                    className="w-full p-3 border rounded-sm focus:ring-2 focus:ring-black mt-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Receiver Phone Number
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                      +62
                    </span>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={handlePhoneChange}
                      disabled={useProfilePhone}
                      className="w-full pl-12 pr-4 py-3 border rounded-sm focus:ring-2 focus:ring-black disabled:bg-gray-100"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Kolom Kanan - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-sm border sticky top-24 space-y-6">
              <h2 className="text-xl font-bold text-center mb-4">
                Order Summary
              </h2>
              <div>
                <h3 className="text-lg font-bold mb-3">Available Vouchers</h3>
                {vouchers && vouchers.length > 0 ? (
                  <div className="flex flex-col space-y-3 overflow-y-auto max-h-48 pr-2">
                    {vouchers.map((voucher) => (
                      <VoucherCard
                        key={voucher._id}
                        voucher={voucher}
                        onSelect={handleSelectVoucher}
                        isSelected={
                          appliedVoucher && appliedVoucher._id === voucher._id
                        }
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-md">
                    No vouchers available at the moment.
                  </p>
                )}
              </div>
              <div className="space-y-2 border-t pt-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">
                    Rp {subtotal.toLocaleString("id-ID")}
                  </span>
                </div>
                {appliedVoucher && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({appliedVoucher.discountPercentage}%)</span>
                    <span className="font-medium">
                      - Rp {discountAmount.toLocaleString("id-ID")}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Courier Fee</span>
                  <span className="font-medium">
                    Rp {kurirFee.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
                  <span>Total Price</span>
                  <span>Rp {totalHarga.toLocaleString("id-ID")}</span>
                </div>
              </div>
              {error && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
                  <AlertCircle size={16} /> {error}
                </div>
              )}
              <button
                onClick={handleCheckoutClick}
                disabled={totalQuantity === 0 || loading}
                className="w-full bg-black text-white py-4 rounded-sm font-medium text-lg hover:bg-gray-800 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Pay Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
