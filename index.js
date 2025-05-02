require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const open = require('open'); // ✅ to auto-open browser
const connectDB = require('./utils/db'); // ✅ FIX: This was missing

const userRoutes = require('./routes/userRoutes');
const topicRoutes = require('./routes/topicRoute');
const statsRoute = require('./routes/statsRoute');

const app = express();

// ✅ Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Session middleware
app.use(session({
  secret: 'keyboard-cat', // 🔐 you can replace this with process.env.SESSION_SECRET for production
  resave: false,
  saveUninitialized: true
}));

// ✅ View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ✅ Static files
app.use(express.static(path.join(__dirname, 'public')));

// ✅ Routes
app.use('/api/users', userRoutes);
app.use('/topics', topicRoutes);
app.use('/', statsRoute);

// ✅ Default route
app.get('/', (req, res) => {
  res.redirect('/api/users/login');
});

// ✅ Start server
(async () => {
  try {
    const connectDB = require('./utils/db');
    const db = connectDB();
    
    await db.connect(); // ✅ Correct
    
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
