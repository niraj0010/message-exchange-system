const mongoose   = require('mongoose');
const dbInstance = require('../utils/db')();
const eventBus   = require('../observers/eventBus');

// Post schema
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
  upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  downvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

postSchema.virtual('commentCount').get(function () {
  return this.comments.length;
});

const PostModel = dbInstance.getModel('Post', postSchema);

class Post {
  async create(title, content, authorId, topicId) {
    const post = new PostModel({ title, content, author: authorId, topic: topicId });
    const saved = await post.save();

    eventBus.emit('topic:updated', {
      topicId: saved.topic.toString(),
      postId: saved._id.toString(),
      postTitle: saved.title
    });

    return saved;
  }

  async getPostsByTopic(topicId, dateFilter = {}) {
    return await PostModel.find({ topic: topicId, ...dateFilter })
      .populate('author', 'username')
      .sort({ createdAt: -1 });
  }

  async getPostsForUserSubscriptions(userId, limitPerTopic = 2) {
    const Topic = require('./topic')();
    const subscribedTopics = await Topic.getSubscribedTopics(userId);
  
    const result = {};
  
    for (const topic of subscribedTopics) {
      const posts = await PostModel.find({ topic: topic._id })
        .populate('author', 'username')
        .populate('topic', 'name')
        .sort({ createdAt: -1 })
        .limit(limitPerTopic);
  
      result[topic.name] = posts; // key = topic name for simplicity in EJS
    }
  
    return result;
  }
  
  async getAllPosts() {
    return await PostModel.find({})
      .populate('author', 'username')
      .populate('topic', 'name')
      .sort({ createdAt: -1 });
  }

  async upvote(postId, userId) {
    return await PostModel.findByIdAndUpdate(
      postId,
      {
        $addToSet: { upvotes: userId },
        $pull:     { downvotes: userId },
        $set:      { updatedAt: new Date() }
      },
      { new: true }
    );
  }

  async downvote(postId, userId) {
    return await PostModel.findByIdAndUpdate(
      postId,
      {
        $addToSet: { downvotes: userId },
        $pull:     { upvotes: userId },
        $set:      { updatedAt: new Date() }
      },
      { new: true }
    );
  }

  async delete(postId, userId) {
    const post = await PostModel.findOne({ _id: postId, author: userId });
    if (!post) throw new Error('Post not found or unauthorized');
    return await PostModel.deleteOne({ _id: postId });
  }

  getPostById(postId) {
    return PostModel.findById(postId)
      .populate('author', 'username')
      .populate('topic', 'name');
  }
}

let postInstance = null;

module.exports = () => {
  if (!postInstance) {
    postInstance = new Post();
  }
  return postInstance;
};


module.exports.model = PostModel;

