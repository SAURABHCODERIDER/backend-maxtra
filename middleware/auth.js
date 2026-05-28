const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ==============================
// IS AUTHENTICATED
// ==============================

const isAuthenticated = async (req, res, next) => {
  try {

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token missing",
      });
    }

    // VERIFY TOKEN
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // FIND USER
    const user = await User.findById(decoded.id).select(
      "-password -refreshToken"
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    req.user   = user;
    req.userId = user._id;

    next();

  } catch (error) {

    console.log("AUTH ERROR =>", error.message);

    return res.status(401).json({
      success: false,
      message:
        error.name === "TokenExpiredError"
          ? "Token expired, please login again"
          : "Invalid token",
    });
  }
};

// ==============================
// IS ADMIN
// ==============================

const isAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access denied",
    });
  }
  next();
};

module.exports = { isAuthenticated, isAdmin };
