const express = require("express");
const router = express.Router();
const Ticket = require("../models/Ticket");

// CREATE SUPPORT TICKET
router.post("/ticket", async (req, res) => {
  const { subject, message } = req.body;

  if (!subject || !subject.trim()) {
    return res.status(400).json({
      success: false,
      message: "Subject is required",
    });
  }

  if (!message || message.trim().length < 10) {
    return res.status(400).json({
      success: false,
      message: "Message must be at least 10 characters",
    });
  }

  try {
    const ticket = await Ticket.create({
      userId: req.userId,
      subject: subject.trim(),
      message: message.trim(),
      status: "open",
    });

    return res.status(201).json({
      success: true,
      message: "Ticket created",
      ticket,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

module.exports = router;   // ✅ MOST IMPORTANT