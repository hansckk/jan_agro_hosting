const express = require("express");
const router = express.Router();

const Cart = require("../models/Carts"); 
const Product = require("../models/Product");

const { authenticateToken } = require("../middleware/authenticate");

router.get("/", authenticateToken, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id }).populate(
      "items.productId",
      "name price image stock"
    );
    if (!cart) {
      const newCart = new Cart({ userId: req.user.id, items: [] });
      await newCart.save();
      return res.status(200).json({
        success: true,
        message: "Keranjang baru berhasil dibuat.",
        data: newCart,
      });
    }
    res.status(200).json({
      success: true,
      message: "Keranjang berhasil diambil.",
      data: cart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server: " + error.message,
    });
  }
});

router.post("/add", authenticateToken, async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.user.id;

  if (!productId || !quantity || quantity <= 0) {
    return res.status(400).json({
      success: false,
      message: "Product ID dan kuantitas (harus lebih dari 0) diperlukan.",
    });
  }

  try {
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Produk tidak ditemukan." });
    }
    const existingItemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );
    
    let newQuantity;
    if (existingItemIndex > -1) {
        newQuantity = cart.items[existingItemIndex].quantity + quantity;
    } else {
        newQuantity = quantity;
    }
    if (product.stock < newQuantity) {
        return res.status(400).json({ success: false, message: `Stok produk tidak mencukupi. Sisa stok: ${product.stock}` });
    }
    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity = newQuantity;
    } else {
      cart.items.push({
        productId,
        quantity,
        name: product.name,
        price: product.price,
        image: product.image,
      });
    }
    await cart.save();
    res.status(200).json({
      success: true,
      message: "Produk berhasil ditambahkan ke keranjang.",
      data: cart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server: " + error.message,
    });
  }
});
router.put("/update-quantity", authenticateToken, async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.user.id;

  if (!productId || quantity === undefined || quantity < 0) {
    return res.status(400).json({
      success: false,
      message: "Product ID dan kuantitas (tidak boleh negatif) diperlukan.",
    });
  }

  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ success: false, message: "Keranjang tidak ditemukan." });
    }

    const itemIndex = cart.items.findIndex((item) => item.productId.toString() === productId);

    if (itemIndex > -1) {
      if (quantity === 0) {
        cart.items.splice(itemIndex, 1);
      } else {
        const product = await Product.findById(productId);
        if (!product || product.stock < quantity) {
          return res.status(400).json({ success: false, message: `Stok produk tidak mencukupi. Sisa stok: ${product.stock}` });
        }
        cart.items[itemIndex].quantity = quantity;
      }

      await cart.save();
      res.status(200).json({
        success: true,
        message: "Kuantitas item berhasil diperbarui.",
        data: cart,
      });
    } else {
      return res.status(404).json({ success: false, message: "Item tidak ditemukan di keranjang." });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server: " + error.message,
    });
  }
});
router.delete("/remove/:productId", authenticateToken, async (req, res) => {
  const { productId } = req.params;
  const userId = req.user.id;

  try {
    const cart = await Cart.findOneAndUpdate(
      { userId },
      { $pull: { items: { productId: productId } } }, 
      { new: true } 
    );

    if (!cart) {
      return res.status(404).json({ success: false, message: "Keranjang tidak ditemukan." });
    }

    res.status(200).json({
      success: true,
      message: "Item berhasil dihapus dari keranjang.",
      data: cart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server: " + error.message,
    });
  }
});
router.delete("/clear", authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const cart = await Cart.findOneAndUpdate(
      { userId },
      { $set: { items: [] } },
      { new: true }
    );

    if (!cart) {
      return res.status(404).json({ success: false, message: "Keranjang tidak ditemukan." });
    }

    res.status(200).json({
      success: true,
      message: "Keranjang berhasil dikosongkan.",
      data: cart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server: " + error.message,
    });
  }
});

module.exports = router;