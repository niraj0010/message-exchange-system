require('dotenv').config();
require('./observers/notificationObserver');  // wire up notifications

const express   = require('express');
const session   = require('express-session');
const path      = require('path');
const open      = require('open');
const connectDB = require('./utils/db');

const userRoutes    = require('./routes/userRoutes');
const topicRoutes   = require('./routes/topicRoute');
const postRoutes    = require('./routes/postRoute');
const statsRoute    = require('./routes/statsRoute');
const commentRoutes = require('./routes/commentRoute'); // 👈 Add this line

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'keyboard-cat',
  resave: false,
  saveUninitialized: true
}));

// ─── Views & Static ────────────────────────────────────────────────────────────
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/users',    userRoutes);
app.use('/topics',       topicRoutes);
app.use('/posts',        postRoutes);
app.use('/notifications', require('./routes/notificationRoute'));
app.use('/api/comments', commentRoutes); // 👈 Register the route here
app.use('/',             statsRoute);

// ─── Default Redirect ─────────────────────────────────────────────────────────
app.get('/', (req, res) => res.redirect('/api/users/login'));

// ─── Start Server ─────────────────────────────────────────────────────────────
(async () => {
  try {
    const db = connectDB();
    await db.connect();

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
