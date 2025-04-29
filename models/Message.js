const mongoose = require('mongoose');
const dbInstance = require('../utils/db')();

const messageSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  topic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const MessageModel = dbInstance.getModel('Message', messageSchema);

class Message {
  async create(content, senderId, topicId) {
    const message = new MessageModel({ content, sender: senderId, topic: topicId });
    return await message.save();
  }

  async getRecentMessagesByTopic(topicId, limit = 2) {
    return await MessageModel.find({ topic: topicId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('sender', 'username');
  }

  async getAllByTopic(topicId) {
    return await MessageModel.find({ topic: topicId })
      .sort({ createdAt: -1 })
      .populate('sender', 'username');
  }
}

// Singleton
let messageInstance = null;
module.exports = () => {
  if (!messageInstance) {
    messageInstance = new Message();
  }
  return messageInstance;
};
