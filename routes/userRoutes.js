const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');


// Register
router.get('/register', (req, res) => res.render('register'));
router.post('/register', userController.registerUser);

// Login
router.get('/login', (req, res) => res.render('login'));
router.post('/login', userController.loginUser);

// Logout
router.post('/logout', userController.logoutUser);

// Dashboard
router.get('/dashboard', userController.getDashboard);
module.exports = router;
