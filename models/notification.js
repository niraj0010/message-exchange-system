const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  topic:   { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true },
  message: { type: String, required: true },
  read:    { type: Boolean, default: false },
  created: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);
