const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User'); // Assuming your User model is in ../models/User

// POST /api/register - Register a new user
router.post('/register', async (req, res) => {
  const { email, password /*, other user data */ } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds

    // Create a new user
    const newUser = new User({
      email,
      password: hashedPassword,
      // Add other user data here
      // role: 'user' // Default role could be 'user'
    });

    // Save the user to the database
    const savedUser = await newUser.save();

    // Send a success response
    res.status(201).json({ message: 'User registered successfully', user: savedUser });

  } catch (error) {
    // Basic error handling
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

module.exports = router;