const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const authenticateToken = async (req, res, next) => {
  const authHeader = req.header("Authorization");
  if (!authHeader) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : authHeader;

  try {
    const verified = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    return res.status(400).json({ message: "Invalid Token" });
  }
};

const authenticateRefreshToken = async (req, res, next) => {
  const authHeader = req.header("Authorization");
  if (!authHeader) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : authHeader;
  try {
    const verified = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    return res.status(400).json({ message: "Invalid Token" });
  }
};
const isAdmin = async (req, res, next) => {
  const role = req.user?.role?.toLowerCase(); 
  
  if (role === "admin") {
    next();
  } else {
    return res.status(403).json({ error: "Forbidden" });
  }
};

const isPemilik = async (req, res, next) => {
  const role = req.user?.role?.toLowerCase();

  if (role === "pemilik" || role === "owner" || role === "ceo" || role === "admin") {
    next();
  } else {
    return res.status(403).json({ error: "Forbidden" });
  }
};

module.exports = {
  authenticateToken,
  authenticateRefreshToken,
  isAdmin,
  isPemilik,
};