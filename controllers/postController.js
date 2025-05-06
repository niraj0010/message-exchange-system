const postModel = require('../models/post')();
const eventBus = require('../observers/eventBus');
const commentModel = require('../models/comment');

class PostController {
  async createPost(req, res) {
    try {
      const { title, content, topicId } = req.body;
      const sessionUser = req.session.user;
      if (!sessionUser) return res.status(401).send('You must be logged in to post');

      const saved = await postModel.create(title, content, sessionUser._id, topicId);

      eventBus.emit('topic:updated', {
        topicId,
        postTitle: saved.title,
        author: sessionUser.username,
        authorId: sessionUser._id.toString()
      });

      res.redirect('/api/users/dashboard');
    } catch (error) {
      console.error('createPost error:', error);
      res.status(500).send('Error creating post');
    }
  }

  async renderHomePage(req, res) {
    try {
      const user = req.session.user;
      if (!user) return res.redirect('/api/users/login');

      const posts = await postModel.getPostsForUserSubscriptions(user._id, 2); // top 2 recent posts
      res.render('dashboard', { posts, user });
    } catch (error) {
      console.error('renderHomePage error:', error);
      res.status(500).send('Error loading home page');
    }
  }

  async renderAllPostsPage(req, res) {
    try {
      const user = req.session.user;
      if (!user) return res.redirect('/api/users/login');

      const allPosts = await postModel.getAllPosts();
      res.render('allPosts', { allPosts, user });

    } catch (error) {
      console.error('renderAllPostsPage error:', error);
      res.status(500).send('Failed to load all posts');
    }
  }

  async getPostsByTopic(req, res) {
    try {
      const { topicId } = req.params;
      const posts = await postModel.getPostsByTopic(topicId);
      res.json(posts);
    } catch (error) {
      console.error('getPostsByTopic error:', error);
      res.status(500).send('Error retrieving posts');
    }
  }

  async upvotePost(req, res) {
    try {
      const { postId } = req.params;
      const user = req.session.user;
      if (!user) return res.status(401).send('Unauthorized');
      await postModel.upvote(postId, user._id);
      res.redirect('/api/users/dashboard');
    } catch (error) {
      console.error('upvotePost error:', error);
      res.status(500).send('Error upvoting post');
    }
  }

  async downvotePost(req, res) {
    try {
      const { postId } = req.params;
      const user = req.session.user;
      if (!user) return res.status(401).send('Unauthorized');
      await postModel.downvote(postId, user._id);
      res.redirect('/api/users/dashboard');
    } catch (error) {
      console.error('downvotePost error:', error);
      res.status(500).send('Error downvoting post');
    }
  }

  async renderCreatePostPage(req, res) {
    try {
      const { topicId } = req.query; // or req.params depending on your frontend
      const user = req.session.user;
      if (!user) return res.redirect('/api/users/login');
      res.render('create-post', { topicId, user });
    } catch (err) {
      console.error('renderCreatePostPage error:', err);
      res.status(500).send('Failed to render create post page');
    }
  }
  

  async deletePost(req, res) {
    try {
      const { postId } = req.params;
      const user = req.session.user;
      if (!user) return res.status(401).send('Unauthorized');

      await postModel.delete(postId, user._id);
      res.redirect('/api/users/dashboard');
    } catch (error) {
      console.error('deletePost error:', error);
      res.status(500).send('Error deleting post');
    }
  }

  async renderPostDetailPage(req, res) {
    try {
      const { id } = req.params;
      const post = await postModel.getPostById(id).exec();
      if (!post) return res.status(404).send('Post not found');
      res.render('post-detail', { post });
    } catch (error) {
      console.error('renderPostDetailPage error:', error);
      res.status(500).send('Error retrieving post detail');
    }
  }

  async getPostDetail(req, res) {
    try {
      const { id } = req.params;
      const user = req.session.user || req.user;
      if (!user) return res.redirect('/login');

      const post = await postModel.getPostById(id).exec();
      if (!post) return res.status(404).send('Post not found');

      const comments = await commentModel.find({ post: id })
        .populate('user', 'username')
        .sort({ createdAt: 1 });

      res.render('postDetail', { post, comments, user });
    } catch (error) {
      console.error('getPostDetail error:', error);
      res.status(500).render('error', {
        message: 'Failed to load post',
        error: process.env.NODE_ENV === 'development' ? error : {}
      });
    }
  }
}

module.exports = () => new PostController();
