const mongoose = require("mongoose");
const { Schema } = mongoose;

const CartItemSchema = new Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product", 
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, "Kuantitas tidak boleh kurang dari 1"],
      default: 1,
    },
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    image: {
      type: String, 
    },
  },
  { _id: false } 
);

const CartSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", 
      required: true,
      unique: true,
    },
    items: [CartItemSchema],
  },
  {
    timestamps: true, 
  }
);

const Cart = mongoose.model("Cart", CartSchema);

module.exports = Cart;