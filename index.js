require('dotenv').config();
const express = require('express');
const connectDB = require('./utils/db');

const app = express();
app.use(express.json());

app.get('/', (req, res) => res.send('Message Exchange System API'));

const PORT = process.env.PORT || 3000;

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });
