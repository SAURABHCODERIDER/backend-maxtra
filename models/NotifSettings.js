const mongoose = require('mongoose');

const NotifSettingsSchema = new mongoose.Schema({
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  pushEnabled:  { type: Boolean, default: true },
  emailEnabled: { type: Boolean, default: true },
  smsEnabled:   { type: Boolean, default: false },
  orderUpdates: { type: Boolean, default: true },
  promotions:   { type: Boolean, default: false },
  reminders:    { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('NotifSettings', NotifSettingsSchema);
