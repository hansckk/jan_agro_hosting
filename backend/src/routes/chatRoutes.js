const express = require("express");
const router = express.Router();
const Chat = require("../models/Chat");
const { authenticateToken, isPemilik } = require("../middleware/authenticate");

// Helper untuk emit status ke socket
const emitStatusUpdate = (io, chatId, userId, status) => {
  // Kirim ke Admin
  io.to("admin_channel").emit("message_status_update", {
    chatId,
    userId,
    status,
  });
  // Kirim ke User spesifik
  io.to(userId.toString()).emit("message_status_update", { chatId, status });
};

router.post("/update-status", authenticateToken, async (req, res) => {
  try {
    console.log("ini testing mengecek update status");

    const { chatId, status } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role?.toLowerCase();

    let chat;
    if (userRole === "pemilik" || userRole === "owner") {
      chat = await Chat.findById(chatId);
    } else {
      chat = await Chat.findOne({ userId });
    }

    if (!chat) return res.status(404).json({ success: false });

    const senderToUpdate =
      userRole === "pemilik" || userRole === "owner" ? "user" : "admin";
    let isUpdated = false;

    chat.messages.forEach((msg) => {
      if (msg.sender === senderToUpdate) {
        if (status === "delivered" && msg.status === "sent") {
          msg.status = "delivered";
          isUpdated = true;
        } else if (status === "read" && msg.status !== "read") {
          msg.status = "read";
          isUpdated = true;
        }
      }
    });

    if (isUpdated) {
      await chat.save();
      // Emit ke socket
      req.io
        .to("admin_channel")
        .emit("message_status_update", { chatId, userId: chat.userId, status });
      req.io
        .to(chat.userId.toString())
        .emit("message_status_update", { chatId, status });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 1. User Kirim Pesan
router.post("/send", authenticateToken, async (req, res) => {
  try {
    const { text } = req.body;
    const userId = req.user.id;

    let chat = await Chat.findOne({ userId });
    if (!chat) chat = new Chat({ userId, messages: [] });

    // Default status masuk DB = 'sent'
    const newMessage = {
      sender: "user",
      text,
      timestamp: new Date(),
      status: "sent",
    };
    chat.messages.push(newMessage);
    chat.lastMessageAt = Date.now();

    await chat.save();

    // Beritahu Admin ada pesan baru
    req.io.to("admin_channel").emit("receive_message", {
      chatId: chat._id,
      userId: userId,
      message: chat.messages[chat.messages.length - 1],
    });

    res.status(200).json({ success: true, data: chat });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 2. Admin Balas Pesan
router.post("/admin/reply", authenticateToken, isPemilik, async (req, res) => {
  try {
    const { targetUserId, text } = req.body;

    const chat = await Chat.findOne({ userId: targetUserId });
    if (!chat)
      return res
        .status(404)
        .json({ success: false, message: "Chat not found" });

    const newMessage = {
      sender: "admin",
      text,
      timestamp: new Date(),
      status: "sent",
    };
    chat.messages.push(newMessage);
    chat.lastMessageAt = Date.now();

    await chat.save();

    // Beritahu User ada pesan baru
    req.io
      .to(targetUserId)
      .emit("receive_message", chat.messages[chat.messages.length - 1]);

    res.status(200).json({ success: true, data: chat });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 4. Get Data
router.get("/my-chat", authenticateToken, async (req, res) => {
  try {
    const chat = await Chat.findOne({ userId: req.user.id });
    res.status(200).json({ success: true, data: chat ? chat.messages : [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/admin/all", authenticateToken, isPemilik, async (req, res) => {
  try {
    const chats = await Chat.find()
      .populate("userId", "name email avatar")
      .sort({ lastMessageAt: -1 });
    res.status(200).json({ success: true, data: chats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
