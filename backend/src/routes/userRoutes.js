const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { authenticateToken } = require("../middleware/authenticate");
const multer = require("multer");
const { Storage } = require("@google-cloud/storage");
const path = require("path");
const bcrypt = require("bcrypt");
const fs = require("fs");

const serviceKeyPath = path.join(__dirname, "../jan-agro-889a63abb48a.json");

if (!fs.existsSync(serviceKeyPath)) {
  console.error(
    "❌ CRITICAL ERROR: Google Cloud Key File NOT FOUND at:",
    serviceKeyPath,
  );
} else {
  console.log("✅ Google Cloud Key File found at:", serviceKeyPath);
}

const storageGCS = new Storage({
  keyFilename: serviceKeyPath,
  projectId: "jan-agro",
});

const bucketName = "jan-agro-storage";
const bucket = storageGCS.bucket(bucketName);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === "image/jpeg" ||
      file.mimetype === "image/png" ||
      file.mimetype === "image/jpg"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Format file tidak didukung! Hanya JPG/PNG."), false);
    }
  },
});

const uploadToGCS = (file, userId) => {
  return new Promise((resolve, reject) => {
    if (!file) return reject("No file received");

    const fileExtension = file.mimetype.split("/")[1];
    const newFileName = `user/avatar-${userId}-${Date.now()}.${fileExtension}`;

    const blob = bucket.file(newFileName);
    const blobStream = blob.createWriteStream({
      resumable: false,

      metadata: {
        contentType: file.mimetype,
      },
    });

    blobStream.on("error", (err) => {
      console.error("[GCS ERROR] Detailed error:", err);
      reject(new Error(`Google Storage Upload Failed: ${err.message}`));
    });

    blobStream.on("finish", () => {
      const publicUrl = `https://storage.googleapis.com/${bucketName}/${newFileName}`;
      console.log("[GCS SUCCESS] File uploaded to:", publicUrl);
      resolve(publicUrl);
    });

    blobStream.end(file.buffer);
  });
};

router.put(
  "/update-avatar/:userId",
  authenticateToken,
  upload.single("avatar"),
  async (req, res) => {
    if (req.user.id !== req.params.userId) {
      return res
        .status(403)
        .json({ success: false, message: "Akses ditolak." });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Tidak ada file gambar yang dikirim.",
      });
    }

    try {
      console.log(`[GCS] Starting avatar upload for user: ${req.user.id}`);
      console.log(`[GCS] File info:`, {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
      });

      const publicUrl = await uploadToGCS(req.file, req.user.id);

      console.log(`[GCS] Upload successful: ${publicUrl}`);

      const user = await User.findById(req.params.userId);
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "Pengguna tidak ditemukan." });
      }

      user.avatar = publicUrl;
      await user.save();

      const userResponse = user.toObject();
      delete userResponse.password;

      res.status(200).json({
        success: true,
        message: "Avatar berhasil diperbarui!",
        user: userResponse,
      });
    } catch (error) {
      console.error("[GCS ERROR] Avatar upload failed:", {
        errorMessage: error.message,
        errorStack: error.stack,
        userId: req.user.id,
      });
      res.status(500).json({
        success: false,
        message: "Gagal memperbarui avatar (Server Error).",
        error: error.message,
      });
    }
  },
);

router.put("/update-address/:userId", authenticateToken, async (req, res) => {
  if (req.user.id !== req.params.userId) {
    return res.status(403).json({ success: false, message: "Akses ditolak." });
  }

  try {
    const { address } = req.body;
    if (!address) {
      return res
        .status(400)
        .json({ success: false, message: "Alamat tidak boleh kosong." });
    }

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Pengguna tidak ditemukan." });
    }

    user.address = address;
    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      success: true,
      message: "Alamat berhasil diperbarui!",
      user: userResponse,
    });
  } catch (error) {
    console.error("Error updating address:", error);
    res
      .status(500)
      .json({ success: false, message: "Terjadi kesalahan pada server." });
  }
});

router.put("/update-profile/:userId", authenticateToken, async (req, res) => {
  if (req.user.id !== req.params.userId) {
    return res.status(403).json({ success: false, message: "Akses ditolak." });
  }
  try {
    const { profileData, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Pengguna tidak ditemukan." });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Password saat ini salah." });
    }

    user.name = profileData.name;
    user.username = profileData.username;
    user.email = profileData.email;
    user.phone = profileData.phone;
    user.address = profileData.address;

    if (newPassword) {
      const saltRounds = 10;
      user.password = await bcrypt.hash(newPassword, saltRounds);
    }

    const updatedUser = await user.save();
    const userResponse = updatedUser.toObject();
    delete userResponse.password;

    res.status(200).json({
      success: true,
      message: "Profil berhasil diperbarui!",
      user: userResponse,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: `Gagal memperbarui: ${
          Object.keys(error.keyValue)[0]
        } sudah digunakan.`,
      });
    }
    console.error("Error updating profile:", error);
    res
      .status(500)
      .json({ success: false, message: "Terjadi kesalahan pada server." });
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

router.get("/user-report", authenticateToken, async (req, res) => {
  try {
    const { year, month, day } = req.query;
    let query = {};

    if (year) {
      const y = parseInt(year);
      let start, end;

      if (day && month) {
        const m = parseInt(month) - 1;
        const d = parseInt(day);
        start = new Date(y, m, d, 0, 0, 0);
        end = new Date(y, m, d, 23, 59, 59);
      } else if (month) {
        const m = parseInt(month) - 1;
        start = new Date(y, m, 1);
        end = new Date(y, m + 1, 0, 23, 59, 59);
      } else {
        start = new Date(y, 0, 1);
        end = new Date(y, 11, 31, 23, 59, 59);
      }

      query.createdAt = { $gte: start, $lte: end };
    }

    const users = await User.find(query)
      .select("name username email role phone createdAt address")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.error("Error user report:", error);
    res
      .status(500)
      .json({ success: false, message: "Gagal mengambil laporan user" });
  }
});

module.exports = router;
