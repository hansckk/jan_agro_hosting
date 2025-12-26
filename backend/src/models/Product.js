const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, default: "" },
    description: { type: String, default: "" },
    stock: { type: Number, default: 0 },
    detail: { type: String, required: true },
    rating: { type: Number, default: 0 },
  },
  { timestamps: true }
);
module.exports = mongoose.model("Product", ProductSchema);
