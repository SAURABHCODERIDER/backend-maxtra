const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");


// ======================================================
// AUTH MIDDLEWARE
// ======================================================

const isAuthenticated = async (
  req,
  res,
  next,
) => {
  try {

    const authHeader =
      req.headers.authorization;

    // ===================================
    // CHECK TOKEN
    // ===================================

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    // ===================================
    // GET TOKEN
    // ===================================

    const token =
      authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : authHeader;

    // ===================================
    // VERIFY TOKEN
    // ===================================

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "secret",
    );

    // ===================================
    // GET USER ID
    // ===================================

    const userId =
      decoded.userId ||
      decoded.id ||
      decoded._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload",
      });
    }

    // ===================================
    // FIND USER
    // ===================================

    const user =
      await User.findById(userId)
        .select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // ===================================
    // SAVE USER
    // ===================================

    req.user = user;
    req.userId = user._id;

    next();

  } catch (error) {

    console.log(
      "AUTH ERROR => ",
      error,
    );

    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
};


// ======================================================
// ADMIN MIDDLEWARE
// ======================================================

const isAdmin = (
  req,
  res,
  next,
) => {

  try {

    if (
      req.user?.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Admin access denied",
      });
    }

    next();

  } catch (error) {

    console.log(
      "ADMIN ERROR => ",
      error,
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ======================================================
// GENERATE TOKENS
// ======================================================

const generateTokens = (
  userId,
) => {

  const accessToken =
    jwt.sign(
      { id: userId },
      process.env.JWT_SECRET || "secret",
      {
        expiresIn: "15m",
      },
    );

  const refreshToken =
    jwt.sign(
      { id: userId },
      process.env.JWT_REFRESH_SECRET ||
        "refresh_secret",
      {
        expiresIn: "7d",
      },
    );

  return {
    accessToken,
    refreshToken,
  };
};


// ======================================================
// REGISTER
// POST /auth/register
// ======================================================

router.post(
  "/register",
  async (req, res) => {

    const {
      name,
      email,
      phone,
      password,
    } = req.body;

    // ===================================
    // VALIDATION
    // ===================================

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message:
          "Name is required.",
      });
    }

    if (
      !email ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email,
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Valid email is required.",
      });
    }

    if (
      !password ||
      password.length < 6
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 6 characters.",
      });
    }

    if (
      phone &&
      !/^\d{10}$/.test(
        phone.trim(),
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Enter valid 10-digit phone number.",
      });
    }

    try {

      // ===================================
      // CHECK EXISTING USER
      // ===================================

      const existingUser =
        await User.findOne({
          email:
            email.toLowerCase(),
        });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message:
            "Email already registered.",
        });
      }

      // ===================================
      // HASH PASSWORD
      // ===================================

      const hashedPassword =
        await bcrypt.hash(
          password,
          10,
        );

      // ===================================
      // CREATE USER
      // ===================================

      const user =
        await User.create({
          name: name.trim(),
          email:
            email.toLowerCase(),
          phone: phone
            ? phone.trim()
            : "",
          password:
            hashedPassword,
        });

      // ===================================
      // GENERATE TOKENS
      // ===================================

      const {
        accessToken,
        refreshToken,
      } = generateTokens(
        user._id,
      );

      // ===================================
      // SAVE REFRESH TOKEN
      // ===================================

      user.refreshToken =
        refreshToken;

      await user.save();

      // ===================================
      // RESPONSE
      // ===================================

      return res.status(201).json({
        success: true,
        message:
          "Registration successful",

        accessToken,
        refreshToken,

        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
        },
      });

    } catch (error) {

      console.log(
        "REGISTER ERROR => ",
        error,
      );

      return res.status(500).json({
        success: false,
        message:
          "Server error. Could not register.",
      });
    }
  },
);


// ======================================================
// LOGIN
// POST /auth/login
// ======================================================

router.post(
  "/login",
  async (req, res) => {

    const {
      email,
      password,
    } = req.body;

    // ===================================
    // VALIDATION
    // ===================================

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Email and password are required.",
      });
    }

    try {

      // ===================================
      // FIND USER
      // ===================================

      const user =
        await User.findOne({
          email:
            email.toLowerCase(),
        });

      if (!user) {
        return res.status(401).json({
          success: false,
          message:
            "Invalid email or password.",
        });
      }

      // ===================================
      // CHECK PASSWORD
      // ===================================

      const isMatch =
        await bcrypt.compare(
          password,
          user.password,
        );

      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message:
            "Invalid email or password.",
        });
      }

      // ===================================
      // GENERATE TOKENS
      // ===================================

      const {
        accessToken,
        refreshToken,
      } = generateTokens(
        user._id,
      );

      // ===================================
      // SAVE REFRESH TOKEN
      // ===================================

      user.refreshToken =
        refreshToken;

      await user.save();

      // ===================================
      // RESPONSE
      // ===================================

      return res.status(200).json({
        success: true,
        message:
          "Login successful",

        accessToken,
        refreshToken,

        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
      });

    } catch (error) {

      console.log(
        "LOGIN ERROR => ",
        error,
      );

      return res.status(500).json({
        success: false,
        message:
          "Server error. Could not login.",
      });
    }
  },
);


// ======================================================
// REFRESH TOKEN
// POST /auth/refresh-token
// ======================================================

router.post(
  "/refresh-token",
  async (req, res) => {

    const {
      refreshToken,
    } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message:
          "Refresh token required",
      });
    }

    try {

      // ===================================
      // VERIFY REFRESH TOKEN
      // ===================================

      const decoded =
        jwt.verify(
          refreshToken,
          process.env
            .JWT_REFRESH_SECRET ||
            "refresh_secret",
        );

      // ===================================
      // FIND USER
      // ===================================

      const user =
        await User.findById(
          decoded.id,
        );

      if (
        !user ||
        user.refreshToken !==
          refreshToken
      ) {
        return res.status(401).json({
          success: false,
          message:
            "Invalid refresh token",
        });
      }

      // ===================================
      // GENERATE NEW TOKENS
      // ===================================

      const tokens =
        generateTokens(
          user._id,
        );

      user.refreshToken =
        tokens.refreshToken;

      await user.save();

      // ===================================
      // RESPONSE
      // ===================================

      return res.status(200).json({
        success: true,
        accessToken:
          tokens.accessToken,
        refreshToken:
          tokens.refreshToken,
      });

    } catch (error) {

      console.log(
        "REFRESH TOKEN ERROR => ",
        error,
      );

      return res.status(401).json({
        success: false,
        message:
          "Invalid or expired refresh token",
      });
    }
  },
);


// ======================================================
// LOGOUT
// POST /auth/logout
// ======================================================

router.post(
  "/logout",
  isAuthenticated,
  async (req, res) => {

    try {

      await User.findByIdAndUpdate(
        req.userId,
        {
          refreshToken: null,
        },
      );

      return res.status(200).json({
        success: true,
        message:
          "Logged out successfully",
      });

    } catch (error) {

      console.log(
        "LOGOUT ERROR => ",
        error,
      );

      return res.status(500).json({
        success: false,
        message:
          "Server error",
      });
    }
  },
);


// ======================================================
// GET CURRENT USER
// GET /auth/me
// ======================================================

router.get(
  "/me",
  isAuthenticated,
  async (req, res) => {

    try {

      const user =
        await User.findById(
          req.userId,
        ).select(
          "-password -refreshToken",
        );

      if (!user) {
        return res.status(404).json({
          success: false,
          message:
            "User not found",
        });
      }

      return res.status(200).json({
        success: true,
        user,
      });

    } catch (error) {

      console.log(
        "ME ERROR => ",
        error,
      );

      return res.status(500).json({
        success: false,
        message:
          "Server error",
      });
    }
  },
);


// ======================================================
// ADMIN ROUTE EXAMPLE
// ======================================================

router.get(
  "/admin-only",
  isAuthenticated,
  isAdmin,
  async (req, res) => {

    return res.status(200).json({
      success: true,
      message:
        "Welcome Admin",
    });
  },
);


// ======================================================
// EXPORT
// ======================================================

module.exports = router;