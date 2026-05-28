const express = require('express');
const router  = express.Router();
const FAQ     = require('../models/FAQ');
const Policy  = require('../models/Policy');

// ─────────────────────────────────────────────────────────────────────────────
// GET /content/faqs
// Returns list of all active FAQs
// ─────────────────────────────────────────────────────────────────────────────
router.get('/faqs', async (req, res) => {
  try {
    const faqs = await FAQ.find({ active: true })
      .select('question answer -_id')
      .sort({ order: 1 });

    return res.status(200).json({ faqs });
  } catch (err) {
    console.error('GET /faqs error:', err);
    return res.status(500).json({ message: 'Server error. Could not fetch FAQs.' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /content/privacy-policy
// Returns full privacy policy with sections
// ─────────────────────────────────────────────────────────────────────────────
router.get('/privacy-policy', async (req, res) => {
  try {
    const policy = await Policy.findOne({ type: 'privacy' })
      .select('title lastUpdated sections -_id');

    if (!policy) {
      return res.status(404).json({ message: 'Privacy policy not found.' });
    }

    return res.status(200).json(policy);
  } catch (err) {
    console.error('GET /privacy-policy error:', err);
    return res.status(500).json({ message: 'Server error. Could not fetch policy.' });
  }
});

module.exports = router;

