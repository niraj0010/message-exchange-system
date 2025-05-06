// controllers/userController.js

const User         = require('../models/User');
const bcrypt       = require('bcrypt');
const Topic        = require('../models/topic');
const topicModel   = Topic();
const Post         = require('../models/post');
const postModel    = Post();
const Notification = require('../models/notification');

// Register a new user
exports.registerUser = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.send('Username and password are required');
  }

  try {
    const existing = await User.findOne({ username });
    if (existing) {
      return res.send('Username already taken');
    }

    // Let the schema's pre('save') hook hash the password
    const user = new User({ username, password });
    await user.save();

    res.redirect('/api/users/login');
  } catch (err) {
    console.error(' Registration Error:', err);
    res.status(500).send('Server error during registration');
  }
};

// Log in an existing user
exports.loginUser = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.send('Username and password are required');
  }

  try {
    const user = await User.findOne({ username });
    if (!user) {
      console.log(' User not found');
      return res.send('User not found');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log(' Incorrect password');
      return res.send('Incorrect password');
    }

    req.session.user = {
      _id:      user._id,
      username: user.username
    };
    console.log(' Logged in:', req.session.user);

    res.redirect('/api/users/dashboard');
  } catch (err) {
    console.error(' Login Error:', err);
    res.status(500).send('Server error during login');
  }
};

// Render dashboard
// Render dashboard
exports.getDashboard = async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/api/users/login');
  }

  const user = req.session.user;
  const userId = user._id;

  try {
    const topics = await topicModel.getSubscribedTopics(userId);
    const topicPostMap = await postModel.getPostsForUserSubscriptions(userId, 2); // Top 2 per topic

    const unreadCount = await Notification.countDocuments({
      user: userId,
      read: false
    });

    const notifications = await Notification.find({ user: userId })
      .sort('-created')
      .limit(5);

    res.render('dashboard', {
      user,
      userTopics: topics,
      topicPostMap,
      unreadCount,
      notifications
    });
  } catch (err) {
    console.error(' Dashboard load error:', err);
    res.status(500).send('Error loading dashboard');
  }
};


// POST /api/users/logout
exports.logoutUser = (req, res, next) => {
  req.session.destroy(err => {
    if (err) {
      console.error(' Logout error:', err);
      return next(err);
    }
    res.clearCookie('connect.sid');
    res.redirect('/api/users/login');
  });
};
