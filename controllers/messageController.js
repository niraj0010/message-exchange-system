const Message = require('../models/Message')();
const Topic = require('../models/Topic')(); 

class MessageController {
  // Post a message to a topic
  async postMessage(req, res) {
    const { topicId } = req.params;
    const { content } = req.body;
    const senderId = req.user._id;

    if (!content) return res.status(400).json({ error: 'Message content is required' });

    try {
      const topic = await Topic.getById(topicId);
      if (!topic) return res.status(404).json({ error: 'Topic not found' });

      // Check if user is subscribed
      if (!topic.subscribers.includes(senderId)) {
        return res.status(403).json({ error: 'You must be subscribed to post in this topic' });
      }

      const message = await Message.create(content, senderId, topicId);
      res.status(201).json(message);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // Get recent messages from all subscribed topics
  async getRecentMessagesForUser(req, res) {
    const user = req.user;

    try {
      const topics = await Topic.getSubscribedTopics(user._id);
      const messagesByTopic = {};

      for (const topic of topics) {
        const recentMessages = await Message.getRecentMessagesByTopic(topic._id, 2);
        messagesByTopic[topic.name] = recentMessages;
      }

      res.render('dashboard', { user, messagesByTopic });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

// Singleton
let messageControllerInstance = null;
module.exports = () => {
  if (!messageControllerInstance) {
    messageControllerInstance = new MessageController();
  }
  return messageControllerInstance;
};
