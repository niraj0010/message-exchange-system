const mongoose = require('mongoose');
require('dotenv').config();

let instance = null;

const connectDB = async () => {
  if (instance) return instance;

  try {
    instance = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      
    });

    console.log('MongoDB connected');

    mongoose.connection.on('disconnected', () => {
      console.error('MongoDB disconnected. Attempting to reconnect...');
      setTimeout(connectDB, 5000);
    });

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err.message);
    });

    return instance;
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    setTimeout(connectDB, 5000);
  }
};

module.exports = connectDB;
