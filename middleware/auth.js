const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ==============================
// AUTH MIDDLEWARE
// ==============================
const isAuthenticated = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // ❌ NO HEADER
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Authorization header missing",
      });
    }

    // ✅ TOKEN EXTRACT
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : authHeader;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token not provided",
      });
    }

    // ✅ VERIFY TOKEN
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "secret"
    );

    // 🔥 FIX: unified id handling
    const userId = decoded.id || decoded._id || decoded.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload",
      });
    }

    // ✅ FIND USER
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // ✅ ATTACH USER
    req.user = user;
    req.userId = user._id.toString();

    next();

  } catch (error) {
    console.log("AUTH ERROR:", error.message);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

// ==============================
// ADMIN MIDDLEWARE
// ==============================
const isAdmin = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access denied",
      });
    }

    next();

  } catch (error) {
    console.log("ADMIN ERROR:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  isAuthenticated,
  isAdmin,
};