require('dotenv').config();
const express = require('express');
const path = require('path');
const connectDB = require('./utils/db');
const userRoutes = require('./routes/userRoutes'); // User-related routes

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // To handle form submissions

// Set up EJS view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public'))); // For static files like CSS (optional)

// Routes
app.use('/api/users', userRoutes); // Register/Login form + POST

// Home route
app.get('/', (req, res) => res.send('Message Exchange System API'));

const PORT = process.env.PORT || 3000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(` Server running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error(' MongoDB connection error:', err);
  });
