require('dotenv').config();
const express = require('express');
const connectDB = require('./utils/db');

const userRoutes = require('./routes/userRoutes'); //  Import user routes

const app = express();
app.use(express.json());

// Routes
app.use('/api/users', userRoutes); //  Use the routes here

app.get('/', (req, res) => res.send('Message Exchange System API'));

const PORT = process.env.PORT || 3000;

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(` Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error(' MongoDB connection error:', err);
  });
