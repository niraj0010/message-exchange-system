require('dotenv').config();
const express = require('express');
const path = require('path');
const connectDB = require('./utils/db');
const userRoutes = require('./routes/userRoutes');

const app = express();
const topicRoutes = require('./routes/topicRoute');
app.use('/topics', topicRoutes);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up EJS view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/users', userRoutes);

// Home route
// In your index.js
app.get('/', (req, res) => {
  res.redirect('/api/users/login');
});

(async () => {
  try {
    await connectDB().connect();
    
    // Start your server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
})();
