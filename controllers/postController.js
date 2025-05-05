// controllers/postController.js

const postModel = require('../models/post')();
const eventBus  = require('../observers/eventBus');

class PostController {
  // Create a new post
  async createPost(req, res) {
    try {
      const { title, content, topicId } = req.body;

      // Ensure user is logged in
      const sessionUser = req.session.user;
      if (!sessionUser) {
        return res.status(401).send('You must be logged in to post');
      }

      const authorId   = sessionUser._id.toString();
      const authorName = sessionUser.username;

      if (!title || !content || !topicId) {
        return res.status(400).send('All fields are required');
      }

      // Save the post
      const saved = await postModel.create(title, content, authorId, topicId);

      // Emit the notification event with exact keys
      eventBus.emit('topic:updated', {
        topicId,
        postTitle: saved.title,
        author:    authorName,
        authorId
      });

      // Redirect back to the dashboard
      res.redirect('/api/users/dashboard');
    } catch (error) {
      console.error(' createPost error:', error);
      res.status(500).send('Error creating post');
    }
  }

  // JSON endpoint: get posts by topic
  async getPostsByTopic(req, res) {
    try {
      const { topicId } = req.params;
      const posts = await postModel.getPostsByTopic(topicId);
      res.json(posts);
    } catch (error) {
      console.error(' getPostsByTopic error:', error);
      res.status(500).send('Error retrieving posts');
    }
  }

  // Render the page to create a new post
  async renderCreatePostPage(req, res) {
    const { topicId } = req.params;
    const user = req.session.user;
    if (!user) {
      return res.redirect('/api/users/login');
    }
    res.render('create-post', { topicId, user });
  }

  // Render the dashboard/home page with subscribed posts
  async renderHomePage(req, res) {
    try {
      const user = req.session.user;
      if (!user) {
        return res.redirect('/api/users/login');
      }
      const posts = await postModel.getPostsForUserSubscriptions(user._id);
      res.render('dashboard', { posts, user });
    } catch (error) {
      console.error(' renderHomePage error:', error);
      res.status(500).send('Error loading home page');
    }
  }

  // Upvote a post
  async upvotePost(req, res) {
    try {
      const { postId } = req.params;
      const user = req.session.user;
      if (!user) {
        return res.status(401).send('Unauthorized');
      }
      await postModel.upvote(postId, user._id);
      res.redirect('/api/users/dashboard');
    } catch (error) {
      console.error(' upvotePost error:', error);
      res.status(500).send('Error upvoting post');
    }
  }

  // Downvote a post
  async downvotePost(req, res) {
    try {
      const { postId } = req.params;
      const user = req.session.user;
      if (!user) {
        return res.status(401).send('Unauthorized');
      }
      await postModel.downvote(postId, user._id);
      res.redirect('/api/users/dashboard');
    } catch (error) {
      console.error(' downvotePost error:', error);
      res.status(500).send('Error downvoting post');
    }
  }
  async deletePost(req, res) {
    try {
      const { postId } = req.params;
      const user = req.session.user;
      if (!user) {
        return res.status(401).send('Unauthorized');
      }
  
      await postModel.delete(postId, user._id);
      res.redirect('/api/users/dashboard');
    } catch (error) {
      console.error('deletePost error:', error);
      res.status(500).send('Error deleting post');
    }
  }
}

module.exports = () => new PostController();
