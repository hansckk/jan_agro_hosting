const mongoose = require("mongoose");

const StockMovementSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    movementType: {
      type: String,
      enum: ["in", "out"],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      enum: ["pembelian", "penjualan", "retur", "pembatalan", "penyesuaian"],
      required: true,
    },
    relatedOrderId: {
      type: String,
      default: null,
    },
    previousStock: {
      type: Number,
      required: true,
    },
    currentStock: {
      type: Number,
      required: true,
    },
    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("StockMovement", StockMovementSchema);
