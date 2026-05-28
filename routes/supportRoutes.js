const express = require('express');
const router  = express.Router();
const Ticket  = require('../models/Ticket');

const {
  isAuthenticated,
} = require('../middleware/auth');

// ─────────────────────────────
// CREATE TICKET
// ─────────────────────────────

router.post(
  '/ticket',
  isAuthenticated,
  async (req, res) => {

    const { subject, message } = req.body;

    if (!subject || !subject.trim()) {
      return res.status(400).json({
        message: 'Subject is required.',
      });
    }

    if (!message || message.trim().length < 10) {
      return res.status(400).json({
        message:
          'Message must be at least 10 characters.',
      });
    }

    try {

      const ticket = await Ticket.create({
        userId : req.userId,
        subject: subject.trim(),
        message: message.trim(),
        status : 'open',
      });

      return res.status(201).json({
        message:
          'Ticket submitted successfully',
        ticketId: ticket._id,
      });

    } catch (err) {

      console.error(err);

      return res.status(500).json({
        message: 'Server error',
      });

    }
  }
);

module.exports = router;