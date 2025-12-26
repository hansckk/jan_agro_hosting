const mongoose = require("mongoose");

const VoucherSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true, 
      uppercase: true,
    },
    discountPercentage: {
      type: Number,
      required: true,
      min: 1,
      max: 100,
    },
    maxUses: {
      type: Number,
      required: true,
      min: 1,
    },
    currentUses: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Voucher", VoucherSchema);