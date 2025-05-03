const mongoose = require('mongoose');
const dbInstance = require('../utils/db')();

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  topic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic',
    required: true
  },
  upvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  downvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const PostModel = dbInstance.getModel('Post', postSchema);

class Post {
  async create(title, content, authorId, topicId) {
    const post = new PostModel({
      title,
      content,
      author: authorId,
      topic: topicId
    });
    return await post.save();
  }

  async getPostsByTopic(topicId, dateFilter = {}) {
    return await PostModel.find({ topic: topicId, ...dateFilter })
      .populate('author', 'username')
      .sort({ createdAt: -1 });
  }

  async getPostsForUserSubscriptions(userId, limit = 20) {
    // Get user's subscribed topics first
    const Topic = require('./topic')();
    const subscribedTopics = await Topic.getSubscribedTopics(userId);
    const topicIds = subscribedTopics.map(t => t._id);
    
    return await PostModel.find({ topic: { $in: topicIds } })
      .populate('author', 'username')
      .populate('topic', 'name')
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  async upvote(postId, userId) {
    return await PostModel.findByIdAndUpdate(
      postId,
      { 
        $addToSet: { upvotes: userId },
        $pull: { downvotes: userId },
        $set: { updatedAt: new Date() }
      },
      { new: true }
    );
  }

  async downvote(postId, userId) {
    return await PostModel.findByIdAndUpdate(
      postId,
      { 
        $addToSet: { downvotes: userId },
        $pull: { upvotes: userId },
        $set: { updatedAt: new Date() }
      },
      { new: true }
    );
  }
}

let postInstance = null;
module.exports = () => {
  if (!postInstance) {
    postInstance = new Post();
  }
  return postInstance;
};