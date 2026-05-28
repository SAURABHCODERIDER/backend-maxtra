const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const {
  isAuthenticated,
  isAdmin,
} = require("../middleware/auth");

const router = express.Router();

// ==============================
// TOKEN GENERATOR
// ==============================

const generateTokens = (user) => {
  const accessToken = jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET || "secret",
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET || "refresh_secret",
    { expiresIn: "7d" }
  );

  return { accessToken, refreshToken };
};

// ==============================
// REGISTER
// ==============================

router.post("/register", async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    const exist = await User.findOne({
      email: email.toLowerCase(),
    });

    if (exist) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    const hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      phone: phone || "",
      password: hash,
      role: "user",
    });

    const tokens = generateTokens(user);

    user.refreshToken = tokens.refreshToken;
    await user.save();

    res.status(201).json({
      success: true,
      message: "Registered",
      ...tokens,
      user,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// ==============================
// LOGIN
// ==============================

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const match = await bcrypt.compare(
      password,
      user.password
    );

    if (!match) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const tokens = generateTokens(user);

    user.refreshToken = tokens.refreshToken;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Login success",
      ...tokens,
      user,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// ==============================
// ME
// ==============================

router.get("/me", isAuthenticated, async (req, res) => {
  const user = await User.findById(req.userId).select(
    "-password -refreshToken"
  );

  res.json({ success: true, user });
});

// ==============================
// USERS (ADMIN)
// ==============================

router.get(
  "/users",
  isAuthenticated,
  isAdmin,
  async (req, res) => {
    const users = await User.find().select(
      "-password -refreshToken"
    );

    res.json({ success: true, users });
  }
);

// ==============================
// LOGOUT
// ==============================

router.post("/logout", isAuthenticated, async (req, res) => {
  await User.findByIdAndUpdate(req.userId, {
    refreshToken: null,
  });

  res.json({
    success: true,
    message: "Logged out",
  });
});

module.exports = router;