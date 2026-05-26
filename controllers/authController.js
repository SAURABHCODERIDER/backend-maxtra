const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ==========================
// GENERATE JWT TOKEN
// ==========================

const generateToken = (user) => {
  return jwt.sign(
    {
      // USER ID
      id: user._id,
      _id: user._id,

      // USER INFO
      name: user.name,
      email: user.email,

      // ✅ IMPORTANT
      role: user.role || "user",
    },

    process.env.JWT_SECRET,

    {
      expiresIn: "30d",
    }
  );
};

// ==========================
// REGISTER USER
// ==========================

const registerUser = async (
  req,
  res
) => {
  try {
    const {
      name,
      email,
      password,
    } = req.body;

    // ==========================
    // VALIDATION
    // ==========================

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

    // ==========================
    // CHECK EXISTING USER
    // ==========================

    const existingUser =
      await User.findOne({
        email:
          email.toLowerCase(),
      });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message:
          "User already exists",
      });
    }

    // ==========================
    // HASH PASSWORD
    // ==========================

    const salt =
      await bcrypt.genSalt(10);

    const hashedPassword =
      await bcrypt.hash(
        password,
        salt
      );

    // ==========================
    // CREATE USER
    // ==========================

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

    // ==========================
    // GENERATE TOKEN
    // ==========================

    const token =
      generateToken(user);

    // ==========================
    // RESPONSE
    // ==========================

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
      "REGISTER ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server Error",
    });
  }
};

// ==========================
// LOGIN USER
// ==========================

const loginUser = async (
  req,
  res
) => {
  try {
    const {
      email,
      password,
    } = req.body;

    // ==========================
    // VALIDATION
    // ==========================

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

    // ==========================
    // FIND USER
    // ==========================

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

    // ==========================
    // CHECK PASSWORD
    // ==========================

    const isMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid Credentials",
      });
    }

    // ==========================
    // GENERATE TOKEN
    // ==========================

    const token =
      generateToken(user);

    // ==========================
    // RESPONSE
    // ==========================

    return res.status(200).json({
      success: true,

      message:
        "Login Successful",

      token,

      user: {
        _id: user._id,
        name: user.name,
        email: user.email,

        // ✅ SEND ROLE
        role: user.role,
      },
    });
  } catch (error) {
    console.log(
      "LOGIN ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server Error",
    });
  }
};

// ==========================
// GET ALL USERS
// ==========================

const getAllUsers = async (
  req,
  res
) => {
  try {
    const users =
      await User.find().select(
        "-password"
      );

    return res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.log(
      "GET USERS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server Error",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getAllUsers,
};