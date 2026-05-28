const express = require('express');
const router  = express.Router();
const Ticket  = require('../models/Ticket');

// ─────────────────────────────────────────────────────────────────────────────
// POST /support/ticket
// Creates a new support ticket (auth required)
// Body: { subject: string, message: string }
// ─────────────────────────────────────────────────────────────────────────────
router.post('/ticket', async (req, res) => {
  const { subject, message } = req.body;

  // ── Validation ──────────────────────────────────────────────────────────────
  if (!subject || !subject.trim()) {
    return res.status(400).json({ message: 'Subject is required.' });
  }
  if (!message || message.trim().length < 10) {
    return res.status(400).json({ message: 'Message must be at least 10 characters.' });
  }

  try {
    const ticket = await Ticket.create({
      userId:  req.userId,
      subject: subject.trim(),
      message: message.trim(),
      status:  'open',
    });

    return res.status(201).json({
      message: 'Ticket submitted. Our team will get back to you within 24 hours.',
      ticketId: ticket._id,
    });
  } catch (err) {
    console.error('POST /support/ticket error:', err);
    return res.status(500).json({ message: 'Server error. Could not submit ticket.' });
  }
});

module.exports = router;
