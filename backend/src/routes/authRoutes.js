const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Product = require("../models/Product");
const Checkout = require("../models/Checkout");
const jwt = require("jsonwebtoken");
const {
  hashPassword,
  comparePassword,
} = require("../functions/passwordHasing");
const {
  registerSchema,
  loginSchema,
} = require("../schema/schemaLoginRegister");

const { authenticateToken, isPemilik } = require("../middleware/authenticate");

router.post("/register", async (req, res) => {
  try {
    const { error } = registerSchema.validate({
      name: req.body.name,
      username: req.body.username,
      email: req.body.email,
      phone: req.body.phone,
      password: req.body.password,
    });
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const findExistingUser = await User.findOne({
      username: req.body.username,
    });
    if (findExistingUser) {
      return res.status(400).json({ message: "Username sudah digunakan" });
    }

    const findExistingEmail = await User.findOne({ email: req.body.email });
    if (findExistingEmail) {
      return res.status(400).json({ message: "Email sudah digunakan" });
    }

    const hashedPassword = await hashPassword(req.body.password);
    const newUser = new User({
      username: req.body.username,
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      password: hashedPassword,
    });

    await newUser.save();
    return res.status(201).json({
      message: "User berhasil didaftarkan",
      data: {
        username: newUser.username,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { identifier, password } = req.body;
    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (user.isBanned) {
      return res.status(403).json({ message: "Akun ini telah ditangguhkan." });
    }

    const payload = { id: user._id, username: user.username, role: user.role };

    const secret = process.env.JWT_ACCESS_SECRET;
    if (!secret) {
      console.error(
        "FATAL ERROR: JWT_ACCESS_SECRET is not defined in .env file."
      );
      return res.status(500).json({ message: "Server configuration error." });
    }

    const token = jwt.sign(payload, secret, { expiresIn: "1h" });

    const userResponse = user.toObject();

    delete userResponse.password;

    return res.status(200).json({
      message: "Login successful",
      token: token,
      user: userResponse,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});

router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("name username email phone address createdAt avatar role")
      .lean();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userForFrontend = {
      ...user,
      phone: user.phone || "",
      address: user.address || "",
    };

    res.status(200).json({ user: userForFrontend });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

router.get(
  "/pemilik/dashboard-stats",
  [authenticateToken, isPemilik],
  async (req, res) => {
    try {
      const [
        totalUsers,
        totalProducts,
        totalOrders,
        revenueAgg,
        successfulOrders,
        pendingOrders,
        lowStockProducts,
      ] = await Promise.all([
        User.countDocuments(),
        Product.countDocuments(),
        Checkout.countDocuments(),
        Checkout.aggregate([
          { $match: { status: { $in: ["selesai", "sampai"] } } },
          { $group: { _id: null, totalRevenue: { $sum: "$totalHarga" } } },
        ]),
        Checkout.countDocuments({ status: { $in: ["selesai", "sampai"] } }),
        Checkout.countDocuments({
          status: { $in: ["diproses", "dikirim", "pending"] },
        }),
        Product.countDocuments({ stock: { $lte: 10 } }),
      ]);

      const totalRevenue =
        revenueAgg.length > 0 ? revenueAgg[0].totalRevenue : 0;

      // Recent activities - latest 5 checkouts
      const recentActivities = await Checkout.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .select("_id nama totalHarga status createdAt")
        .lean();

      res.status(200).json({
        message: "Data statistik berhasil diambil",
        data: {
          totalUsers,
          totalProducts,
          totalOrders,
          totalRevenue,
          successfulOrders,
          pendingOrders,
          lowStockProducts,
          recentActivities,
        },
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
  }
);

router.get(
  "/pemilik/users",
  [authenticateToken, isPemilik],
  async (req, res) => {
    try {
      const users = await User.find().select("-password");
      res.status(200).json({
        message: "Data semua pengguna berhasil diambil",
        data: users,
      });
    } catch (error) {
      console.error("Error fetching all users:", error);
      res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
  }
);

router.put(
  "/pemilik/users/:id/ban",
  [authenticateToken, isPemilik],
  async (req, res) => {
    try {
      const userToUpdate = await User.findById(req.params.id);
      if (!userToUpdate) {
        return res.status(404).json({ message: "Pengguna tidak ditemukan" });
      }
      if (req.user.id === userToUpdate._id.toString()) {
        return res
          .status(403)
          .json({
            message: "Anda tidak dapat menangguhkan akun Anda sendiri.",
          });
      }
      userToUpdate.isBanned = !userToUpdate.isBanned;
      await userToUpdate.save();
      const userResponse = userToUpdate.toObject();
      delete userResponse.password;
      res.status(200).json({
        message: `Pengguna '${userToUpdate.username}' telah berhasil ${
          userToUpdate.isBanned ? "ditangguhkan" : "diaktifkan kembali"
        }`,
        data: userResponse,
      });
    } catch (error) {
      console.error("Error toggling user ban status:", error);
      res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
  }
);

module.exports = router;
