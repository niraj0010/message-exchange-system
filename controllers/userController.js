const User = require('../models/User');
const bcrypt = require('bcrypt');
const Topic = require('../models/topic'); // Import your Topic model singleton
const topicModel = Topic(); // Call it to get the instance


// Register a new user
exports.registerUser = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) return res.send('Username and password are required');

  try {
    const existing = await User.findOne({ username });
    if (existing) return res.send('Username already taken');

    const user = new User({ username, password });
    await user.save();

    res.redirect('/api/users/login'); // Redirect to login after success
  } catch (err) {
    console.error('❌ Registration Error:', err);
    res.status(500).send('Server error during registration');
  }
};

// Log in an existing user
exports.loginUser = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) return res.send('Username and password are required');

  try {
    const user = await User.findOne({ username });
    if (!user) {
      console.log('❌ User not found');
      return res.send('User not found');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('❌ Incorrect password');
      return res.send('Incorrect password');
    }

    // Store in session
    req.session.user = {
      _id: user._id,
      username: user.username
    };

    console.log('✅ Logged in:', req.session.user);
    res.redirect('/api/users/dashboard');
  } catch (err) {
    console.error('❌ Login Error:', err);
    res.status(500).send('Server error during login');
  }
};

// Render dashboard
exports.getDashboard = async (req, res) => {
  if (!req.session.user) return res.redirect('/api/users/login');

  try {
    const topics = await topicModel.getSubscribedTopics(req.session.user._id);
    res.render('dashboard', {
      user: req.session.user,
      userTopics: topics // Pass subscribed topics to the view
    });
  } catch (err) {
    console.error('❌ Dashboard load error:', err);
    res.status(500).send('Error loading dashboard');
  }
};