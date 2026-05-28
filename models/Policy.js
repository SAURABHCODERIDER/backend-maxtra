const mongoose = require('mongoose');

const SectionSchema = new mongoose.Schema({
  title:   { type: String, required: true },
  content: { type: String, required: true },
}, { _id: false });

const PolicySchema = new mongoose.Schema({
  type:        { type: String, enum: ['privacy', 'terms'], required: true, unique: true },
  title:       { type: String, required: true },
  lastUpdated: { type: String },   // e.g. "May 28, 2026"
  sections:    [SectionSchema],
}, { timestamps: true });

module.exports = mongoose.model('Policy', PolicySchema);
