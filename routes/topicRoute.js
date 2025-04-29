const express = require('express');
const router = express.Router();
const topicController = require('../controllers/topicController')();


// Create a new topic
router.post('/', topicController.createTopic);

// Subscribe to a topic
router.post('/:topicId/subscribe', topicController.subscribeToTopic);

// Unsubscribe from a topic
router.post('/:topicId/unsubscribe', topicController.unsubscribeFromTopic);

// Get all topics (for subscription)
router.get('/', topicController.getAllTopics);

// Get subscribed topics
router.get('/subscribed', topicController.getSubscribedTopics);

// Get topic statistics
router.get('/:topicId/stats', topicController.getTopicStats);

module.exports = router;