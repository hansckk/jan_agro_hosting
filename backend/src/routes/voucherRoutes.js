const express = require("express");
const router = express.Router();
const Voucher = require("../models/Voucher");
const Checkout = require("../models/Checkout");

router.post("/add-voucher", async (req, res) => {
  try {
    const newVoucher = new Voucher(req.body);
    const savedVoucher = await newVoucher.save();
    res.status(201).json({
      success: true,
      data: savedVoucher,
      message: "Voucher berhasil ditambahkan",
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: "Kode voucher sudah ada." });
    }
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.get("/get-all-vouchers", async (req, res) => {
  try {
    const allVouchers = await Voucher.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      data: allVouchers,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.put("/update-voucher/:id", async (req, res) => {
  try {
    const updatedVoucher = await Voucher.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!updatedVoucher) {
      return res.status(404).json({ success: false, message: "Voucher tidak ditemukan" });
    }
    res.json({
      success: true,
      data: updatedVoucher,
      message: "Voucher berhasil diperbarui",
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: "Kode voucher sudah ada." });
    }
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.delete("/delete-voucher/:id", async (req, res) => {
  try {
    const deletedVoucher = await Voucher.findByIdAndDelete(req.params.id);
    if (!deletedVoucher) {
      return res.status(404).json({ success: false, message: "Voucher tidak ditemukan" });
    }
    res.json({ success: true, message: "Voucher berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.get("/usage-report", async (req, res) => {
  try {
    const { startDate, endDate, search } = req.query;
    let query = { kodeVoucher: { $ne: null } }; // Hanya ambil yg punya kodeVoucher

    // Filter Tanggal
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(new Date(endDate).setHours(23, 59, 59))
      };
    }

    // Filter Search (Kode Voucher)
    if (search) {
      query.kodeVoucher = { $regex: search, $options: "i" };
    }

    const voucherUsage = await Checkout.find(query)
      .select("kodeVoucher nama totalHarga diskon items createdAt")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: voucherUsage });
  } catch (error) {
    console.error("Error voucher report:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;