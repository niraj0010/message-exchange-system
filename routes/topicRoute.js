const express = require('express');
const router = express.Router();
const controller = require('../controllers/topicController')();
const postController = require('../controllers/postController')();

// Topic routes
router.post('/', controller.createTopic.bind(controller));
router.post('/:topicId/subscribe', controller.subscribeToTopic.bind(controller));
router.post('/:topicId/unsubscribe', controller.unsubscribeFromTopic.bind(controller));
router.get('/', controller.getAllTopics.bind(controller));
router.get('/subscribed', controller.getSubscribedTopics.bind(controller));
router.get('/:topicId/stats', controller.getTopicStats.bind(controller));
router.get('/browse', controller.renderBrowseTopicsPage.bind(controller));
router.get('/stats', controller.renderStatsPage.bind(controller));

// Topic-specific post creation
router.get('/:topicId/posts/create', postController.renderCreatePostPage.bind(postController));
router.post('/:topicId/posts', postController.createPost.bind(postController));

module.exports = router;