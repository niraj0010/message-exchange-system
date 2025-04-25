const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Show registration form
router.get('/register', (req, res) => res.render('register'));

// Handle registration
router.post('/register', userController.registerUser);

// Show login form
router.get('/login', (req, res) => res.render('login'));

// Handle login
router.post('/login', userController.loginUser);

module.exports = router;
