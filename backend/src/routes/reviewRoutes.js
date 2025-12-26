const express = require("express");
const router = express.Router();
const Review = require("../models/Review");
const Product = require("../models/Product");
const Checkout = require("../models/Checkout");
const { authenticateToken } = require("../middleware/authenticate");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
    
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "reviews",
    resource_type: "auto", 
    allowed_formats: ["jpg", "png", "jpeg", "mp4", "mov"], 
  },
});

const upload = multer({ storage: storage });

router.post("/add", authenticateToken, upload.array("media", 6), async (req, res) => {
  try {
    // TAMBAHAN: Terima orderId dari body
    const { productId, orderId, rating, comment } = req.body;
    const userId = req.user.id;

    if (!productId || !rating || !orderId) {
      return res.status(400).json({ success: false, message: "Product ID, Order ID, and Rating are required." });
    }

    // 1. Cek Validasi Pesanan (Security Check)
    // Pastikan pesanan itu ada, milik user tsb, dan statusnya selesai
    const orderCheck = await Checkout.findOne({ 
        _id: orderId, 
        userId: userId 
    });

    if (!orderCheck) {
        return res.status(404).json({ success: false, message: "Order not found or unauthorized." });
    }

    if (orderCheck.status !== 'selesai') {
        return res.status(400).json({ success: false, message: "You can only review completed orders." });
    }

    // (Opsional) Cek apakah produk benar-benar ada di dalam pesanan tersebut
    const isProductInOrder = orderCheck.items.some(item => 
        (item.product && item.product.toString() === productId) || 
        (item._id && item._id.toString() === productId) // Sesuaikan dengan struktur schema item Anda
    );
    
    // Jika struktur items Anda menyimpan ref product, gunakan ini. Jika tidak, lewati logic ini.

    const productExists = await Product.findById(productId);
    if (!productExists) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }

    // 2. PERBAIKAN LOGIC CEK DUPLIKAT
    // Cek apakah user sudah review produk ini PADA ORDER INI
    const existingReview = await Review.findOne({ 
        user: userId, 
        product: productId,
        order: orderId // Kunci perbaikannya di sini
    });
    
    if (existingReview) {
      return res.status(400).json({ 
        success: false, 
        message: "Anda sudah memberikan review untuk produk ini pada pesanan tersebut." 
      });
    }

    let mediaFiles = [];
    if (req.files && req.files.length > 0) {
      mediaFiles = req.files.map((file) => ({
        url: file.path,
        type: file.mimetype.startsWith("video") ? "video" : "image", 
      }));
    }

    const newReview = new Review({
      user: userId,
      product: productId,
      order: orderId, // Simpan Order ID
      rating: Number(rating),
      comment: comment || "",
      media: mediaFiles, 
    });

    const savedReview = await newReview.save();
    
    // Update rata-rata rating produk
    const reviews = await Review.find({ product: productId });
    const avgRating = reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length;
    
    productExists.rating = avgRating; 
    await productExists.save();

    res.status(201).json({
      success: true,
      message: "Review submitted successfully.",
      data: savedReview,
    });
  } catch (error) {
    console.error("Error adding review:", error);
    res.status(500).json({ success: false, message: "Server error while adding review." });
  }
});

router.get("/product/:productId", async (req, res) => {
  try {
    const { productId } = req.params;

    const reviews = await Review.find({ product: productId })
      .populate("user", "name avatar email") 
      .sort({ createdAt: -1 }); 

    const formattedReviews = reviews.map((r) => ({
      _id: r._id,
      userId: r.user?._id,
      userName: r.user?.name || "Anonymous",
      userAvatar: r.user?.avatar || null, 
      rating: r.rating,
      comment: r.comment,
      media: r.media, 
      createdAt: r.createdAt,
    }));

    res.status(200).json({
      success: true,
      data: formattedReviews,
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ success: false, message: "Server error fetching reviews." });
  }
});


router.get("/all", authenticateToken, async (req, res) => {
  try {
    const reviews = await Review.find({})
      .populate("user", "name avatar email")
      .populate("product", "name image price category") 
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    console.error("Error fetching all reviews:", error);
    res.status(500).json({ success: false, message: "Server error fetching reviews." });
  }
});

module.exports = router;
