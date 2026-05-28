const express  = require('express');
const router   = express.Router();
const bcrypt   = require('bcryptjs');
const User     = require('../models/User');
const NotifSettings = require('../models/NotifSettings');
const {
  isAuthenticated,
} = require('../middleware/auth');
// ─────────────────────────────────────────────────────────────────────────────
// GET /user/notification-settings
// Returns current notification preferences for logged-in user
// ─────────────────────────────────────────────────────────────────────────────
router.get(
  '/notification-settings',
  isAuthenticated,
  async (req, res) => {
  try {
    let settings = await NotifSettings.findOne({ userId: req.userId });

    // Create defaults if first time
    if (!settings) {
      settings = await NotifSettings.create({
        userId:       req.userId,
        pushEnabled:  true,
        emailEnabled: true,
        smsEnabled:   false,
        orderUpdates: true,
        promotions:   false,
        reminders:    true,
      });
    }

    return res.status(200).json({
      settings: {
        pushEnabled:  settings.pushEnabled,
        emailEnabled: settings.emailEnabled,
        smsEnabled:   settings.smsEnabled,
        orderUpdates: settings.orderUpdates,
        promotions:   settings.promotions,
        reminders:    settings.reminders,
      },
    });
  } catch (err) {
    console.error('GET /notification-settings error:', err);
    return res.status(500).json({ message: 'Server error.' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /user/notification-settings
// Updates one or more notification toggles
// Body: any subset of { pushEnabled, emailEnabled, smsEnabled,
//                       orderUpdates, promotions, reminders }
// ─────────────────────────────────────────────────────────────────────────────
const VALID_KEYS = [
  'pushEnabled', 'emailEnabled', 'smsEnabled',
  'orderUpdates', 'promotions', 'reminders',
];

router.patch(
  '/notification-settings',
  isAuthenticated,
  async (req, res) => {
  const update = {};

  // Allow only recognised boolean keys
  for (const key of VALID_KEYS) {
    if (typeof req.body[key] === 'boolean') {
      update[key] = req.body[key];
    }
  }

  if (Object.keys(update).length === 0) {
    return res.status(400).json({ message: 'No valid fields provided.' });
  }

  try {
    const settings = await NotifSettings.findOneAndUpdate(
      { userId: req.userId },
      { $set: update },
      { new: true, upsert: true }
    );

    return res.status(200).json({
      message:  'Settings updated.',
      settings: {
        pushEnabled:  settings.pushEnabled,
        emailEnabled: settings.emailEnabled,
        smsEnabled:   settings.smsEnabled,
        orderUpdates: settings.orderUpdates,
        promotions:   settings.promotions,
        reminders:    settings.reminders,
      },
    });
  } catch (err) {
    console.error('PATCH /notification-settings error:', err);
    return res.status(500).json({ message: 'Server error.' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /user/profile
// Updates name, phone and optionally password
// Body: { name, phone, currentPassword?, newPassword? }
// ─────────────────────────────────────────────────────────────────────────────
router.put(
  '/profile',
  isAuthenticated,
  async (req, res) => {
  const { name, phone, currentPassword, newPassword } = req.body;

  // ── Validation ──────────────────────────────────────────────────────────────
  if (!name || !name.trim()) {
    return res.status(400).json({ message: 'Name cannot be empty.' });
  }
  if (phone && !/^\d{10}$/.test(phone.trim())) {
    return res.status(400).json({ message: 'Enter a valid 10-digit phone number.' });
  }
  if (newPassword) {
    if (!currentPassword) {
      return res.status(400).json({ message: 'Enter your current password.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters.' });
    }
  }

  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // ── Password change ────────────────────────────────────────────────────────
    if (newPassword) {
      const match = await bcrypt.compare(currentPassword, user.password);
      if (!match) {
        return res.status(400).json({ message: 'Current password is incorrect.' });
      }
      user.password = await bcrypt.hash(newPassword, 10);
    }

    user.name  = name.trim();
    if (phone !== undefined) user.phone = phone.trim();

    await user.save();

    return res.status(200).json({
  success: true,
  message: 'Profile updated successfully.',
  user: {
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
  },
});
  } catch (err) {
    console.error('PUT /user/profile error:', err);
    return res.status(500).json({ message: 'Server error. Could not update profile.' });
  }
});

module.exports = router;
