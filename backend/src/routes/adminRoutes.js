const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { hashPassword } = require("../functions/passwordHasing");
const Checkout = require("../models/Checkout");
const StockMovement = require("../models/StockMovement");


router.put("/checkout/cancel/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;
    const { decision } = req.body; // "approve" or "reject"

    const checkout = await Checkout.findById(orderId);
    if (!checkout) return res.status(404).json({ success: false, message: "Order not found" });

    if (checkout.status !== "pembatalan diajukan") {
      return res.status(400).json({ success: false, message: "No cancellation request to process" });
    }

    if (decision === "approve") {
      checkout.status = "dibatalkan";
    } else if (decision === "reject") {
      checkout.status = "diproses";
    } else {
      return res.status(400).json({ success: false, message: "Invalid decision" });
    }

    await checkout.save();
    res.status(200).json({ success: true, data: checkout });
  } catch (error) {
    console.error("Admin cancellation error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.get("/get-all-users", async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});



router.put("/update-user/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body; 

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: "Pengguna tidak ditemukan" });
    }

    user.name = updateData.name || user.name;
    user.username = updateData.username || user.username;
    user.email = updateData.email || user.email;
    user.phone = updateData.phone; 
    user.address = updateData.address; 

    if (updateData.password && updateData.password.trim() !== "") {
      user.password = await hashPassword(updateData.password);
      console.log("Password baru sedang di-hash untuk pengguna:", user.username);
    }

    const updatedUser = await user.save();

    const userResponse = updatedUser.toObject();
    delete userResponse.password;

    res.status(200).json({ success: true, data: userResponse });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: `Gagal memperbarui: ${Object.keys(error.keyValue)[0]} sudah digunakan.`,
      });
    }
    console.error("Error updating user:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan pada server" });
  }
});


router.delete("/delete-user/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser)
      return res.status(404).json({ success: false, message: "User not found" });

    res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.put("/toggle-ban/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    user.isBanned = !user.isBanned;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${user.isBanned ? "banned" : "unbanned"} successfully`,
      data: user,
    });
  } catch (error) {
    console.error("Error toggling ban:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


router.post("/create-admin", async (req, res) => {
  try {
    const { name, username, email, password, phone } = req.body;

    if (!name || !username || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Nama, username, email, dan password harus diisi" });
    }

    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Username atau email sudah digunakan.",
      });
    }

    if (typeof hashPassword !== 'function') {
        console.error("hashPassword is not a function!", hashPassword);
        return res.status(500).json({ success: false, message: "Server configuration error." });
    }

    const hashedPassword = await hashPassword(password);

    const newAdmin = new User({
      name,
      username,
      email,
      phone,
      password: hashedPassword,
      role: "admin",
    });

    await newAdmin.save();

    const adminResponse = newAdmin.toObject();
    delete adminResponse.password;

    res.status(201).json({
      success: true,
      message: "Admin baru berhasil dibuat!",
      data: adminResponse,
    });
  } catch (error) {
    console.error("Error creating admin:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan pada server" });
  }
});


// ==========================================
// STOCK MOVEMENT REPORTS
// ==========================================

// Get all stock movements with filters
router.get("/stock-movement-report", async (req, res) => {
  try {
    const { startDate, endDate, productId, movementType, reason } = req.query;
    let filter = {};

    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    if (productId) {
      filter.productId = productId;
    }

    if (movementType) {
      filter.movementType = movementType;
    }

    if (reason) {
      filter.reason = reason;
    }

    const stockMovements = await StockMovement.find(filter)
      .populate("productId", "name price")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: stockMovements });
  } catch (error) {
    console.error("Error fetching stock movements:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan pada server" });
  }
});

// Get stock movement summary
router.get("/stock-movement-summary", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let filter = {};

    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const summary = await StockMovement.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$productId",
          productName: { $first: "$productName" },
          totalIn: {
            $sum: {
              $cond: [{ $eq: ["$movementType", "in"] }, "$quantity", 0],
            },
          },
          totalOut: {
            $sum: {
              $cond: [{ $eq: ["$movementType", "out"] }, "$quantity", 0],
            },
          },
          movementCount: { $sum: 1 },
        },
      },
      { $sort: { movementCount: -1 } },
    ]);

    res.status(200).json({ success: true, data: summary });
  } catch (error) {
    console.error("Error fetching stock movement summary:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan pada server" });
  }
});

module.exports = router;

