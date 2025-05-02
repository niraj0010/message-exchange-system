require('dotenv').config();
const express = require('express');
const path = require('path');
const open = require('open'); // Automatically opens browser
const connectDB = require('./utils/db');
const userRoutes = require('./routes/userRoutes');
const topicRoutes = require('./routes/topicRoute');
const statsRoute = require('./routes/statsRoute'); // ✅ Added

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/users', userRoutes);
app.use('/topics', topicRoutes);
app.use('/', statsRoute); // ✅ Add the stats route here

// Home redirect
app.get('/', (req, res) => {
  res.redirect('/api/users/login');
});

// Start server
(async () => {
  try {
    await connectDB().connect();
    const PORT = process.env.PORT || 3000;

    app.listen(PORT, async () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
      await open(`http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
})();
