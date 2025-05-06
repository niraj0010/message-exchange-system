const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController')();

// Post routes
router.get('/', postController.renderHomePage.bind(postController));
router.post('/', postController.createPost.bind(postController));
router.get('/create', postController.renderCreatePostPage.bind(postController));
router.post('/:postId/upvote', postController.upvotePost.bind(postController));
router.post('/:postId/downvote', postController.downvotePost.bind(postController));
router.post('/:postId/delete', postController.deletePost);
router.get('/:id', postController.getPostDetail.bind(postController)); 

module.exports = router;