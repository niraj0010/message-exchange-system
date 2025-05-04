// routes/notificationRoute.js
const express      = require('express');
const router       = express.Router();
const Notification = require('../models/notification');

// GET /notifications — full page (optional)
router.get('/', async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/api/users/login');
  }
  const notifications = await Notification
    .find({ user: req.session.user._id })
    .sort('-created');
  res.render('notifications', { notifications });
});

// POST /notifications/mark-dropdown-read
// Marks the same latest 5 (unread) notifications as read
router.post('/mark-dropdown-read', async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Find up to 5 latest unread notifications
  const latestUnread = await Notification
    .find({ user: req.session.user._id, read: false })
    .sort('-created')
    .limit(5)
    .select('_id');

  const ids = latestUnread.map(n => n._id);
  if (ids.length) {
    await Notification.updateMany(
      { _id: { $in: ids } },
      { read: true }
    );
  }

  // Return a simple JSON so the client JS can reload or update UI
  res.json({ success: true });
});

module.exports = router;
