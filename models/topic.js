const mongoose = require('mongoose');
const dbInstance = require('../utils/db')();

// Define the Topic schema
const topicSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subscribers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  accessCount: {
    type: Number,
    default: 0
  }
});

// Create the Topic model
const TopicModel = dbInstance.getModel('Topic', topicSchema);

class Topic {
  // Create a new topic
  async create(name, creatorId) {
    const topic = new TopicModel({
      name,
      creator: creatorId,
      subscribers: [creatorId] // Creator is automatically subscribed
    });
    
    return await topic.save();
  }

  // Subscribe a user to a topic
  async subscribe(topicId, userId) {
    return await TopicModel.findByIdAndUpdate(
      topicId,
      { $addToSet: { subscribers: userId }, $set: { updatedAt: new Date() } },
      { new: true }
    );
  }

  // Unsubscribe a user from a topic
  async unsubscribe(topicId, userId) {
    return await TopicModel.findByIdAndUpdate(
      topicId,
      { $pull: { subscribers: userId }, $set: { updatedAt: new Date() } },
      { new: true }
    );
  }

  // Get all topics
  async getAll() {
    return await TopicModel.find().sort({ createdAt: -1 });
  }

  // Get topics a user is subscribed to
  async getSubscribedTopics(userId) {
    return await TopicModel.find({ subscribers: userId }).sort({ updatedAt: -1 });
  }

  // Increment access count for a topic
  async incrementAccessCount(topicId) {
    return await TopicModel.findByIdAndUpdate(
      topicId,
      { $inc: { accessCount: 1 } },
      { new: true }
    );
  }

  // Get topic by ID
  async getById(topicId) {
    return await TopicModel.findById(topicId);
  }
}

// Singleton pattern for Topic model
let topicInstance = null;

module.exports = () => {
  if (!topicInstance) {
    topicInstance = new Topic();
  }
  return topicInstance;
};