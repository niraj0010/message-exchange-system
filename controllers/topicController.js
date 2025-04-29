const Topic = require('../models/topic'); 
const topicModel = Topic();

class TopicController {
    constructor() {
        this.observers = []; // For Observer pattern
    }

    // Observer pattern methods
    addObserver(observer) {
        this.observers.push(observer);
    }

    removeObserver(observer) {
        this.observers = this.observers.filter(obs => obs !== observer);
    }

    notifyObservers(event, data) {
        this.observers.forEach(observer => observer.update(event, data));
    }

    // Create a new topic
    async createTopic(req, res) {
        try {
            const { name } = req.body;
            const creatorId = req.user._id; // Assuming user is authenticated
            
            if (!name) {
                return res.status(400).json({ error: 'Topic name is required' });
            }

            const topic = await topicModel.create(name, creatorId);
            
            // Notify observers about new topic creation
            this.notifyObservers('TOPIC_CREATED', topic);
            
            res.status(201).json(topic);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Subscribe to a topic
    async subscribeToTopic(req, res) {
        try {
            const { topicId } = req.params;
            const userId = req.user._id;
            
            const topic = await topicModel.getById(topicId);
            if (!topic) {
                return res.status(404).json({ error: 'Topic not found' });
            }

            await topicModel.subscribe(topicId, userId);
            
            // Notify observers about subscription
            this.notifyObservers('TOPIC_SUBSCRIBED', { topicId, userId });
            
            res.status(200).json({ message: 'Subscribed successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Unsubscribe from a topic
    async unsubscribeFromTopic(req, res) {
        try {
            const { topicId } = req.params;
            const userId = req.user._id;
            
            const topic = await topicModel.getById(topicId);
            if (!topic) {
                return res.status(404).json({ error: 'Topic not found' });
            }

            await topicModel.unsubscribe(topicId, userId);
            
            // Notify observers about unsubscription
            this.notifyObservers('TOPIC_UNSUBSCRIBED', { topicId, userId });
            
            res.status(200).json({ message: 'Unsubscribed successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Get all topics for subscription
    async getAllTopics(req, res) {
        try {
            const topics = await topicModel.getAll();
            res.status(200).json(topics);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Get subscribed topics
    async getSubscribedTopics(req, res) {
        try {
            const userId = req.user._id;
            const topics = await topicModel.getSubscribedTopics(userId);
            res.status(200).json(topics);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Get topic statistics (access count)
    async getTopicStats(req, res) {
        try {
            const { topicId } = req.params;
            const topic = await topicModel.getById(topicId);
            
            if (!topic) {
                return res.status(404).json({ error: 'Topic not found' });
            }
            
            // Increment access count when stats are viewed
            await topicModel.incrementAccessCount(topicId);
            
            res.status(200).json({
                topicId: topic._id,
                topicName: topic.name,
                accessCount: topic.accessCount
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

// Singleton pattern for TopicController
let topicControllerInstance = null;

module.exports = () => {
    if (!topicControllerInstance) {
        topicControllerInstance = new TopicController();
    }
    return topicControllerInstance;
};