const Post = require('../models/post');
const postModel = Post();

class PostController {
  constructor() {
    this.observers = [];
  }

  addObserver(observer) {
    this.observers.push(observer);
  }

  removeObserver(observer) {
    this.observers = this.observers.filter(obs => obs !== observer);
  }

  notifyObservers(event, data) {
    this.observers.forEach(observer => observer.update(event, data));
  }

  // Create a new post
  async createPost(req, res) {
    try {
      const { title, content, topicId } = req.body;
      const authorId = req.session?.user?._id;

      if (!title || !content || !topicId || !authorId) {
        return res.status(400).json({ error: 'All fields are required' });
      }

      const post = await postModel.create(title, content, authorId, topicId);
      this.notifyObservers('POST_CREATED', post);
      
      // Redirect to the topic page or home
      res.redirect('/api/users/dashboard'); 
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get posts for a specific topic
  async getPostsByTopic(req, res) {
    try {
      const { topicId } = req.params;
      const posts = await postModel.getPostsByTopic(topicId);
      res.json(posts);
    } catch (error) {
      res.status(500).send('Error retrieving posts');
    }
  }
  async renderCreatePostPage(req, res) {
    const { topicId } = req.params;
    const user = req.session?.user;
  
    if (!user?._id) {
      return res.redirect('/login');
    }
  
    res.render('create-post', {
      topicId,
      user
    });
  }
  

  // Render home page with posts from subscribed topics
  async renderHomePage(req, res) {
    try {
      const userId = req.session?.user?._id;
      if (!userId) return res.redirect('/login');

      const posts = await postModel.getPostsForUserSubscriptions(userId);
      
      res.render('home', {
        posts,
        user: req.session.user
      });
    } catch (error) {
      console.error('Error loading home page:', error);
      res.status(500).send('Error loading home page');
    }
  }

  // Upvote a post
async upvotePost(req, res) {
    try {
      const { postId } = req.params;
      const userId = req.session?.user?._id;
      
      if (!userId) return res.status(401).send('Unauthorized');
      
      await postModel.upvote(postId, userId);
      res.redirect('/api/users/dashboard'); // 👈 redirect instead of res.json
    } catch (error) {
      res.status(500).send('Error upvoting post');
    }
  }
  
  // Downvote a post
  async downvotePost(req, res) {
    try {
      const { postId } = req.params;
      const userId = req.session?.user?._id;
      
      if (!userId) return res.status(401).send('Unauthorized');
      
      await postModel.downvote(postId, userId);
      res.redirect('/api/users/dashboard'); // 👈 same here
    } catch (error) {
      res.status(500).send('Error downvoting post');
    }
  }
  
}

let postControllerInstance = null;
module.exports = () => {
  if (!postControllerInstance) {
    postControllerInstance = new PostController();
  }
  return postControllerInstance;
};