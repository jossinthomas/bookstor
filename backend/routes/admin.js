const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // Import jsonwebtoken
const Order = require('../models/Order'); // Assuming the Order model is in ../models/Order
const router = express.Router();
const User = require('../models/User'); // Import the User model
const Book = require('../models/Book'); // Import the Book model

const FinancialReportProxy = require('../utils/FinancialReportProxy'); // Import the FinancialReportProxy\
const { checkRequiredFields, validateEmailFormat, checkGmailDomain } = require('../middleware/authValidation');
// TODO: Rename this file or integrate these routes into a more general auth route file later.

const authMiddleware = require('../middleware/auth'); // Import authentication middleware

router.post('/login',
  checkRequiredFields,
  validateEmailFormat,
  checkGmailDomain,
  async (req, res) => { // Added async here
    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email });

      // Check if user exists and is an admin
      if (!user || user.role !== 'admin') {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Compare provided password with hashed password
      const isMatch = await bcrypt.compare(password, user.password); // Assuming password field stores hashed password
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Generate JWT
      // TODO: Use a strong secret from environment variables
      const token = jwt.sign({ id: user._id, role: user.role }, 'your_jwt_secret', { expiresIn: '1h' }); // Token expires in 1 hour
      // Basic password comparison (for simplicity, replace with hashing in production)
    // TODO: Generate and send a JWT token for authentication
    res.json({ message: 'Admin login successful', token: 'placeholder_token' });
});
 } catch (error) {
    res.status(500).json({ message: error.message });
  }
router.get('/sales', authMiddleware, async (req, res) => { // Added authMiddleware here
  // TODO: The user object should come from authentication middleware
  const user = req.user; // Assuming user object is attached to request by middleware

  try {
    const salesReport = await FinancialReportProxy.getReport(user);
    res.json(salesReport);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
});


// Admin Book Management Routes

// POST /api/admin/books - Add a new book
  // TODO: Add authentication/authorization middleware to ensure only admins can add books
  const { title, author, price, description, category, image } = req.body;

  try {
    const newBook = new Book({
      title,
      author,
      price,
      description,
      category,
      image,
      // TODO: Add stock quantity if needed
    });

    const savedBook = await newBook.save();
    res.status(201).json(savedBook);
  } catch (error) {
    // TODO: Add comprehensive error handling
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/admin/books/:id - Edit an existing book
router.put('/books/:id', authMiddleware, async (req, res) => {
  // TODO: Add authentication/authorization middleware to ensure only admins can edit books
  const { id } = req.params;
  const updates = req.body;

  try {
    const updatedBook = await Book.findByIdAndUpdate(id, updates, { new: true });
    res.json(updatedBook);
  } catch (error) {
    // TODO: Add comprehensive error handling
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/admin/books/:id - Delete a book
router.post('/books', authMiddleware, async (req, res) => {
  // TODO: Add authentication/authorization middleware to ensure only admins can add books
  const { title, author, price, description, category, image } = req.body;

  try {
    const newBook = new Book({
      title,
      author,
      price,
      description,
      category,
      image,
      // TODO: Add stock quantity if needed
    });

    const savedBook = await newBook.save();
    res.status(201).json(savedBook);
  } catch (error) {
    // TODO: Add comprehensive error handling
    res.status(500).json({ message: error.message });
  }
});

router.delete('/books/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    const deletedBook = await Book.findByIdAndDelete(id);
    if (!deletedBook) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    // TODO: Add comprehensive error handling
    res.status(500).json({ message: error.message });
  }
});
module.exports = router;