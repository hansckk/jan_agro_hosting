const mongoose = require("mongoose");

const ReturnSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.ObjectId,
      ref: "Checkout",
      required: true,
    },
    reason: { type: String, required: true },
    videos: [{ type: String }],
    photos: [{ type: String }],
    status: {
      type: String,
      enum: ["diajukan", "diterima", "ditolak"],
      default: "diajukan",
    },
    processedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Return", ReturnSchema);
