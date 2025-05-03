const mongoose = require('mongoose');
require('dotenv').config();

class DB {
  constructor() {
    this.connection = null;
  }

  async connect() {
    if (this.connection) return this.connection;

    try {
      this.connection = await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      console.log('✅ MongoDB connected');

      mongoose.connection.on('disconnected', () => {
        console.warn('⚠️ MongoDB disconnected. Attempting to reconnect...');
        setTimeout(() => this.connect(), 5000);
      });

      mongoose.connection.on('error', (err) => {
        console.error('MongoDB connection error:', err.message);
      });

      return this.connection;
    } catch (err) {
      console.error('❌ MongoDB connection error:', err.message);
      setTimeout(() => this.connect(), 5000);
    }
  }

  getConnection() {
    if (!this.connection) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.connection;
  }

  getModel(name, schema) {
    return mongoose.model(name, schema);
  }
}

let dbInstance = null;

module.exports = () => {
  if (!dbInstance) {
    dbInstance = new DB();
  }
  return dbInstance;
};
