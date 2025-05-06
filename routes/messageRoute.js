const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController')();

// Post a message to a specific topic
router.post('/:topicId', messageController.postMessage);

// Get recent messages from all subscribed topics (for dashboard)
router.get('/recent', messageController.getRecentMessagesForUser);
router.delete('/:messageId', messageController.deleteMessage);

module.exports = router;
