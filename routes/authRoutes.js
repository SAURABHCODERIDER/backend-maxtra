const express = require("express");

const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

const User = require("../models/User");

const router = express.Router();

// ======================
// REGISTER
// ======================

router.post(
  "/register",
  async (req, res) => {

    try {

      const {
        name,
        email,
        password,
      } = req.body;

      const userExists =
        await User.findOne({
          email,
        });

      if (userExists) {

        return res
          .status(400)
          .json({
            message:
              "User already exists",
          });

      }

      const hashedPassword =
        await bcrypt.hash(
          password,
          10
        );

      const user =
        await User.create({
          name,
          email,
          password:
            hashedPassword,
        });

      res.json({
        success: true,
        user,
      });

    } catch (error) {

      res.status(500).json({
        message: error.message,
      });

    }
  }
);

// ======================
// LOGIN
// ======================

router.post(
  "/login",
  async (req, res) => {

    try {

      const {
        email,
        password,
      } = req.body;

      const user =
        await User.findOne({
          email,
        });

      if (!user) {

        return res
          .status(400)
          .json({
            message:
              "User not found",
          });

      }

      const isMatch =
        await bcrypt.compare(
          password,
          user.password
        );

      if (!isMatch) {

        return res
          .status(400)
          .json({
            message:
              "Invalid password",
          });

      }

      const token = jwt.sign(
        {
          userId: user._id,
          email: user.email,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "7d",
        }
      );

      res.json({
        success: true,
        token,
        user,
      });

    } catch (error) {

      res.status(500).json({
        message: error.message,
      });

    }
  }
);

// ======================
// GET USERS
// ======================

router.get(
  "/users",
  async (req, res) => {

    try {

      const users =
        await User.find().select(
          "-password"
        );

      res.json(users);

    } catch (error) {

      res.status(500).json({
        message: error.message,
      });

    }
  }
);

module.exports = router;