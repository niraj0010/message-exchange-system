const express = require('express');
const router = express.Router();
const topicController = require('../controllers/topicController')();

// 📄 GET: Browse topics page
router.get('/browse', topicController.renderBrowseTopicsPage.bind(topicController));

// ➕ POST: Create a new topic
router.post('/', topicController.createTopic.bind(topicController));

// ✅ Subscribe and unsubscribe
router.post('/:topicId/subscribe', topicController.subscribeToTopic.bind(topicController));
router.post('/:topicId/unsubscribe', topicController.unsubscribeFromTopic.bind(topicController));

// 📊 GET: Topic stats page
router.get('/stats', topicController.renderStatsPage.bind(topicController));

// 📄 GET: View specific topic (with posts)
router.get('/:topicId', topicController.renderTopicPage.bind(topicController));

// 🔎 GET: Subscribed topics (API)
router.get('/api/subscribed', topicController.getSubscribedTopics.bind(topicController));

// 🔢 GET: Specific topic stats (API)
router.get('/:topicId/stats', topicController.getTopicStats.bind(topicController));

module.exports = router;
