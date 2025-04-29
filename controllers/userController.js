const User = require('../models/User');
const bcrypt = require('bcrypt');

// Register a new user
exports.registerUser = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) return res.send('Username and password are required');

  try {
    const existing = await User.findOne({ username });
    if (existing) return res.send('Username already taken');

    const user = new User({ username, password });
    await user.save();

    res.redirect('/api/users/login'); // redirect to login page after success
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error during registration');
  }
};

/// Log in an existing user
exports.loginUser = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) return res.send('Username and password are required');

  try {
    const user = await User.findOne({ username });
    if (!user) return res.send('User not found');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.send('Incorrect password');

    // Render dashboard with just user info for now
    res.render('dashboard', { 
      user: {
        _id: user._id,
        username: user.username
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error during login');
  }
};