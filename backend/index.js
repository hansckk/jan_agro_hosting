const express = require("express");
require("dotenv").config(); 
const app = express();

app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.url}`);
  next();
});

const port = process.env.PORT || 3000;
const cors = require("cors");
const path = require("path");
const http = require("http"); 
const { Server } = require("socket.io");
const { connectDatabase } = require("./src/database/database");

app.use(express.static(path.join(__dirname, "public")));

console.log("Starting server...");
console.log("PORT:", process.env.PORT);

connectDatabase();
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: true,
    methods: ["GET", "POST"],
    credentials: true,
  },
});
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Logic Socket
io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  // User join room sesuai ID mereka
  socket.on("join_chat", (userId) => {
    socket.join(userId);
    console.log(`User joined room: ${userId}`);
  });

  // Admin join room admin
  socket.on("join_admin", () => {
    socket.join("admin_channel");
    console.log("Admin joined admin channel");
  });

  socket.on("disconnect", () => console.log("User Disconnected"));
});

const authRoutes = require("./src/routes/authRoutes");
const productsRoutes = require("./src/routes/productsRoutes");
const voucherRoutes = require("./src/routes/voucherRoutes");
const adminRoutes = require("./src/routes/adminRoutes");
const userRoutes = require("./src/routes/userRoutes");
const cartRoutes = require("./src/routes/cartRoutes");
const checkoutRoutes = require("./src/routes/checkoutRoutes");
const reviewRoutes = require("./src/routes/reviewRoutes");
const chatRoutes = require("./src/routes/chatRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/vouchers", voucherRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/checkouts", checkoutRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/chat", chatRoutes);

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

server.listen(port, "0.0.0.0", () => {
  console.log(`✅ Server (Express + Socket.io) running on port ${port}`);
});
