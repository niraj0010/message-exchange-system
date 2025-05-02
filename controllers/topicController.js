const Topic = require('../models/topic');
const topicModel = Topic();

class TopicController {
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

  // ✅ Create a new topic
  async createTopic(req, res) {
    try {
      const { name } = req.body;
      const creatorId = req.session?.user?._id;

      if (!name || !creatorId) {
        return res.status(400).json({ error: 'Topic name and user ID are required' });
      }

      const topic = await topicModel.create(name, creatorId);
      this.notifyObservers('TOPIC_CREATED', topic);
      res.redirect('/api/users/dashboard');
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // ✅ Browse all topics (view)
  async renderBrowseTopicsPage(req, res) {
    try {
      const topics = await topicModel.getAll();
      const userId = req.session?.user?._id;
  
      const subscribedTopics = userId
        ? await topicModel.getSubscribedTopics(userId)
        : [];
  
      const subscribedIds = subscribedTopics.map(t => t._id.toString());
  
      res.render('browseTopics', {
        topics,
        subscribedIds,
        user: req.session.user
      });
    } catch (err) {
      console.error('❌ Failed to load browse page:', err);
      res.status(500).send('Failed to load topics');
    }
  }
  

  // ✅ Subscribe to a topic
  async subscribeToTopic(req, res) {
    try {
      const { topicId } = req.params;
      const userId = req.session?.user?._id;

      if (!userId) return res.status(401).send('Unauthorized');

      const topic = await topicModel.getById(topicId);
      if (!topic) return res.status(404).send('Topic not found');

      await topicModel.subscribe(topicId, userId);
      this.notifyObservers('TOPIC_SUBSCRIBED', { topicId, userId });

      res.redirect('/topics/browse');
    } catch (error) {
      res.status(500).send('Error subscribing to topic');
    }
  }

  // ✅ Unsubscribe from a topic
  async unsubscribeFromTopic(req, res) {
    try {
      const { topicId } = req.params;
      const userId = req.session?.user?._id;

      if (!userId) return res.status(401).send('Unauthorized');

      const topic = await topicModel.getById(topicId);
      if (!topic) return res.status(404).send('Topic not found');

      await topicModel.unsubscribe(topicId, userId);
      this.notifyObservers('TOPIC_UNSUBSCRIBED', { topicId, userId });

      res.redirect('/topics/browse');
    } catch (error) {
      res.status(500).send('Error unsubscribing from topic');
    }
  }

  // ✅ Get all topics (API)
  async getAllTopics(req, res) {
    try {
      const topics = await topicModel.getAll();
      res.json(topics);
    } catch (error) {
      res.status(500).send('Error retrieving topics');
    }
  }

  // ✅ Get subscribed topics for current user
  async getSubscribedTopics(req, res) {
    try {
      const userId = req.session?.user?._id;
      if (!userId) return res.status(401).send('Unauthorized');

      const topics = await topicModel.getSubscribedTopics(userId);
      res.json(topics);
    } catch (error) {
      res.status(500).send('Error retrieving subscribed topics');
    }
  }
  async renderStatsPage(req, res) {
    try {
      const allTopics = await topicModel.getAll();
  
      const stats = allTopics.map(topic => ({
        name: topic.name,
        subscribersCount: topic.subscribers?.length || 0
      }));
  
      res.render('stats', { stats }); // Only send subscriber data now
    } catch (err) {
      console.error('❌ Failed to load topic stats:', err);
      res.status(500).send('Failed to load topic stats');
    }
  } 
  
  

  // ✅ Topic statistics
  async getTopicStats(req, res) {
    try {
      const { topicId } = req.params;
      const topic = await topicModel.getById(topicId);

      if (!topic) return res.status(404).send('Topic not found');

      await topicModel.incrementAccessCount(topicId);

      res.json({
        topicId: topic._id,
        topicName: topic.name,
        accessCount: topic.accessCount
      });
    } catch (error) {
      res.status(500).send('Error retrieving topic stats');
    }
  }
}

// Singleton export
let topicControllerInstance = null;
module.exports = () => {
  if (!topicControllerInstance) {
    topicControllerInstance = new TopicController();
  }
  return topicControllerInstance;
};
