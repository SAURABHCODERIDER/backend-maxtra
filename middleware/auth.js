const jwt = require("jsonwebtoken");

const User = require("../models/User");

// ===================================
// AUTHENTICATION
// ===================================

const isAuthenticated = async (
  req,
  res,
  next,
) => {
  try {
    const authHeader =
      req.headers.authorization;

    // =========================
    // TOKEN CHECK
    // =========================

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message:
          "No token provided",
      });
    }

    // =========================
    // GET TOKEN
    // =========================

    const token =
      authHeader.startsWith(
        "Bearer ",
      )
        ? authHeader.split(" ")[1]
        : authHeader;

    // =========================
    // VERIFY TOKEN
    // =========================

    const decoded =
      jwt.verify(
        token,
        process.env.JWT_SECRET,
      );

    console.log(
      "DECODED TOKEN =>",
      decoded,
    );

    // =========================
    // USER ID FIX
    // =========================

    const userId =
      decoded.userId ||
      decoded._id ||
      decoded.id;

    // =========================
    // FIND USER
    // =========================

    const user =
      await User.findById(
        userId,
      ).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message:
          "User not found",
      });
    }

    console.log(
      "AUTH USER =>",
      user,
    );

    // =========================
    // SAVE USER
    // =========================

    req.user = user;

    next();
  } catch (error) {
    console.log(
      "AUTH ERROR =>",
      error,
    );

    return res.status(401).json({
      success: false,
      message:
        "Invalid token",
    });
  }
};

// ===================================
// ADMIN CHECK
// ===================================

const isAdmin = (
  req,
  res,
  next,
) => {
  try {
    console.log(
      "USER ROLE =>",
      req.user?.role,
    );

    if (
      req.user?.role !==
      "admin"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Admin access denied",
      });
    }

    next();
  } catch (error) {
    console.log(
      "ADMIN ERROR =>",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        error.message,
    });
  }
};

module.exports = {
  isAuthenticated,
  isAdmin,
};