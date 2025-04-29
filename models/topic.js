const { MongoClient } = require('mongodb');
const dbInstance = require('../db'); 

class Topic {
    constructor() {
        this.collection = dbInstance.getDb().collection('topics');
    }

    // Create a new topic
    async create(name, creatorId) {
        const topic = {
            name,
            creator: creatorId,
            subscribers: [creatorId], 
            createdAt: new Date(),
            updatedAt: new Date(),
            accessCount: 0
        };
        
        const result = await this.collection.insertOne(topic);
        return result.ops[0];
    }

    // Subscribe a user to a topic
    async subscribe(topicId, userId) {
        return await this.collection.updateOne(
            { _id: topicId },
            { $addToSet: { subscribers: userId }, $set: { updatedAt: new Date() } }
        );
    }

    // Unsubscribe a user from a topic
    async unsubscribe(topicId, userId) {
        return await this.collection.updateOne(
            { _id: topicId },
            { $pull: { subscribers: userId }, $set: { updatedAt: new Date() } }
        );
    }

    // Get all topics
    async getAll() {
        return await this.collection.find().toArray();
    }

    // Get topics a user is subscribed to
    async getSubscribedTopics(userId) {
        return await this.collection.find({ subscribers: userId }).toArray();
    }

    // Increment access count for a topic
    async incrementAccessCount(topicId) {
        return await this.collection.updateOne(
            { _id: topicId },
            { $inc: { accessCount: 1 } }
        );
    }

    // Get topic by ID
    async getById(topicId) {
        return await this.collection.findOne({ _id: topicId });
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