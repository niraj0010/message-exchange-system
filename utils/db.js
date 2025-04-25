const mongoose = require('mongoose');

let instance = null;

const connectDB = async () => {
  if (instance) return instance;

  try {
    instance = await mongoose.connect(process.env.MONGO_URI);
    console.log(' MongoDB connected');
  } catch (err) {
    console.error(' MongoDB connection error:', err.message);
    process.exit(1); // Stop the app if DB fails to connect
  }

  return instance;
};

module.exports = connectDB;
