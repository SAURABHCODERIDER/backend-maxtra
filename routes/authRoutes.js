const express = require("express");

const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

const User = require("../models/User");

const router = express.Router();

// ==============================
// GENERATE TOKEN
// ==============================

const generateToken = user => {
  return jwt.sign(
    {
      _id: user._id,
      id: user._id,

      name: user.name,
      email: user.email,

      // ✅ IMPORTANT
      role: user.role || "user",
    },

    process.env.JWT_SECRET,

    {
      expiresIn: "30d",
    },
  );
};

// ==============================
// REGISTER USER
// ==============================

router.post(
  "/register",

  async (req, res) => {
    try {
      const {
        name,
        email,
        password,
      } = req.body;

      // ==============================
      // VALIDATION
      // ==============================

      if (
        !name?.trim() ||
        !email?.trim() ||
        !password?.trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "All fields are required",
        });
      }

      // ==============================
      // CHECK USER
      // ==============================

      const userExists =
        await User.findOne({
          email:
            email.toLowerCase(),
        });

      if (userExists) {
        return res.status(400).json({
          success: false,
          message:
            "User already exists",
        });
      }

      // ==============================
      // HASH PASSWORD
      // ==============================

      const hashedPassword =
        await bcrypt.hash(
          password,
          10,
        );

      // ==============================
      // CREATE USER
      // ==============================

      const user =
        await User.create({
          name: name.trim(),

          email:
            email.toLowerCase(),

          password:
            hashedPassword,

          // ✅ DEFAULT ROLE
          role: "user",
        });

      // ==============================
      // TOKEN
      // ==============================

      const token =
        generateToken(user);

      // ==============================
      // RESPONSE
      // ==============================

      return res.status(201).json({
        success: true,

        message:
          "Registration Successful",

        token,

        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.log(
        "REGISTER ERROR =>",
        error,
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Server Error",
      });
    }
  },
);

// ==============================
// LOGIN USER
// ==============================

router.post(
  "/login",

  async (req, res) => {
    try {
      const {
        email,
        password,
      } = req.body;

      // ==============================
      // VALIDATION
      // ==============================

      if (
        !email?.trim() ||
        !password?.trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Email & Password required",
        });
      }

      // ==============================
      // FIND USER
      // ==============================

      const user =
        await User.findOne({
          email:
            email.toLowerCase(),
        });

      if (!user) {
        return res.status(400).json({
          success: false,
          message:
            "User not found",
        });
      }

      // ==============================
      // CHECK PASSWORD
      // ==============================

      const isMatch =
        await bcrypt.compare(
          password,
          user.password,
        );

      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid password",
        });
      }

      // ==============================
      // TOKEN
      // ==============================

      const token =
        generateToken(user);

      // ==============================
      // RESPONSE
      // ==============================

      return res.status(200).json({
        success: true,

        message:
          "Login Successful",

        token,

        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.log(
        "LOGIN ERROR =>",
        error,
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Server Error",
      });
    }
  },
);

// ==============================
// GET ALL USERS
// ==============================

router.get(
  "/users",

  async (req, res) => {
    try {
      const users =
        await User.find().select(
          "-password",
        );

      return res.status(200).json({
        success: true,
        users,
      });
    } catch (error) {
      console.log(
        "GET USERS ERROR =>",
        error,
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Server Error",
      });
    }
  },
);

module.exports = router;