const express = require("express");

const Message = require("../models/Message");

const authMiddleware = require(
  "../Middleware"
);

const router = express.Router();

// ======================
// GET CHAT MESSAGES
// ======================

router.get(
  "/:room",
  authMiddleware,

  async (req, res) => {

    try {

      const messages =
        await Message.find({
          room: req.params.room,
        }).sort({
          createdAt: 1,
        });

      res.json(messages);

    } catch (error) {

      res.status(500).json({
        message: error.message,
      });

    }
  }
);

module.exports = router;