const postModel = require('../models/post')();
const eventBus = require('../observers/eventBus');
const commentModel = require('../models/comment');

class PostController {
  async createPost(req, res) {
    try {
      const { title, content, topicId } = req.body;
      const sessionUser = req.session.user;
      if (!sessionUser) return res.status(401).send('You must be logged in to post');

      const authorId = sessionUser._id.toString();
      const authorName = sessionUser.username;

      if (!title || !content || !topicId) {
        return res.status(400).send('All fields are required');
      }

      const saved = await postModel.create(title, content, authorId, topicId);

      eventBus.emit('topic:updated', {
        topicId,
        postTitle: saved.title,
        author: authorName,
        authorId
      });

      res.redirect('/api/users/dashboard');
    } catch (error) {
      console.error('createPost error:', error);
      res.status(500).send('Error creating post');
    }
  }

  async getPostsByTopic(req, res) {
    try {
      const { topicId } = req.params;
      const posts = await postModel.getPostsByTopic(topicId);

      // Ensure `commentCount` is populated as a virtual field
      res.json(posts);
    } catch (error) {
      console.error('getPostsByTopic error:', error);
      res.status(500).send('Error retrieving posts');
    }
  }

  async renderCreatePostPage(req, res) {
    const { topicId } = req.params;
    const user = req.session.user;
    if (!user) return res.redirect('/api/users/login');
    res.render('create-post', { topicId, user });
  }

  async renderHomePage(req, res) {
    try {
      const user = req.session.user;
      if (!user) return res.redirect('/api/users/login');
      const posts = await postModel.getPostsForUserSubscriptions(user._id);

      // `commentCount` will be available as a virtual field
      res.render('dashboard', { posts, user });
    } catch (error) {
      console.error('renderHomePage error:', error);
      res.status(500).send('Error loading home page');
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

 
  async updatePost(req, res) {
    try {
      const { postId } = req.params;
      const { title, content } = req.body;
      const user = req.session.user;
      if (!user) return res.status(401).send('Unauthorized');

      const updated = await postModel.update(postId, user._id, { title, content });
      if (!updated) return res.status(403).send('Not authorized to update this post');

      res.redirect('/api/users/dashboard');
    } catch (error) {
      console.error('updatePost error:', error);
      res.status(500).send('Error updating post');
    }
  }

  async renderEditPostPage(req, res) {
    try {
      const { postId } = req.params;
      const user = req.session.user;
      if (!user) return res.redirect('/api/users/login');
      const post = await postModel.getById(postId);
      if (!post || post.authorId.toString() !== user._id.toString()) {
        return res.status(403).send('Unauthorized to edit this post');
      }
      res.render('edit-post', { post, user });
    } catch (error) {
      console.error('renderEditPostPage error:', error);
      res.status(500).send('Error loading edit form');
    }
  }

  async renderPostDetailPage(req, res) {
    try {
      const { id } = req.params;
      const post = await postModel.getPostById(id).exec(); // Ensure virtual fields are populated
      if (!post) {
        return res.status(404).send('Post not found');
      }
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
      
      if (!user) {
        return res.redirect('/login');
      }
  
      // Get post with populated data
      const post = await postModel.getPostById(id)
        .exec(); 
  
      if (!post) {
        return res.status(404).send('Post not found');
      }
  
      // Get comments with populated user data
      const comments = await commentModel.find({ post: id })
        .populate('user', 'username')
        .sort({ createdAt: 1 });
  
      res.render('postDetail', {
        post,
        comments,
        user
      });
      
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
