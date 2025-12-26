// File: src/models/Checkout.js

const mongoose = require("mongoose");

const CheckoutSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.ObjectId, ref: "User", required: true },
    nama: { type: String, ref: "User", required: true },
    alamat: { type: String, ref: "User", required: true },
    noTelpPenerima: { type: String, required: true },
    items: [
      {
        product: { type: mongoose.Schema.ObjectId, ref: "Product", required: true },
        name: { type: String, required: true },
        image: { type: String },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],
    subtotal: { type: Number, required: true },
    diskon: { type: Number, default: 0 },
    kodeVoucher: { type: String, default: null },
    kurir: {
      nama: { type: String, default: "jne" },
      biaya: { type: Number, required: true },
    },
    totalHarga: { type: Number, required: true },

    // --- PERBAIKAN DI SINI ---
    metodePembayaran: {
      type: String,
      enum: ["Transfer Bank", "COD", "Kartu Kredit", "Online Payment"],
      required: true,
    },
    
    // Actual Midtrans payment type
    paymentType: {
      type: String,
      default: null,
      // Examples: credit_card, bank_transfer, gopay, qris, cstore, echannel, etc.
    },
    
    status: {
      type: String,
      enum: [
        "pending",
        "pembatalan diajukan",
        "diproses",
        "dikirim",
        "sampai",
        "selesai",
        "dibatalkan",
        "pengembalian diajukan",
        "pengembalian ditolak",
      ],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Checkout", CheckoutSchema);