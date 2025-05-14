const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const User = require('../models/User'); // Assuming you'll need to link cart to user
const authenticateJWT = require('../middleware/auth'); // Import authentication middleware

// Ensure these routes are protected by authentication middleware

// GET user's cart - Protected
router.get('/', authenticateJWT, async (req, res) => {
  try {
    // Get the user ID from the authenticated user (attached by authenticateJWT middleware)
    const userId = req.user.id; // Assuming the JWT payload has an 'id' field
    if (!userId) {
        // This should not happen if authenticateJWT works correctly, but good for safety
        return res.status(401).json({ message: 'User not authenticated' });
    }

    // Find the user document and populate the cart items with book details
    // Ensure your User model's cart field has 'ref: 'Book''

    // Example assuming cart is embedded in User model:
    const user = await User.findById(userId).populate('cart.bookId'); // Populate bookId field in cart

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.cart || []); // Return the user's cart array, or an empty array if undefined
  } catch (err) {
    console.error('Error fetching cart:', err);
    res.status(500).json({ message: err.message });
  }
});

// POST add item to cart - Protected
router.post('/add', authenticateJWT, async (req, res) => {
  const { bookId } = req.body; // We'll add quantity as 1 initially in frontend logic usually
  const quantity = 1; // Assuming adding one item at a time

  try {
    // Get the user ID from the authenticated user (attached by authenticateJWT middleware)
    const userId = req.user.id; // Assuming the JWT payload has an 'id' field
     if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
    }

    // Find the user document
    const user = await User.findById(userId);

    if (!user) {
         return res.status(404).json({ message: 'User not found' });
    }

    // Validate bookId
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Ensure the cart array exists
    user.cart = user.cart || [];

    // Check if the book is already in the cart
    const itemIndex = user.cart.findIndex(item => item.bookId && item.bookId.toString() === bookId);

    if (itemIndex > -1) {
      // Book exists in the cart, update quantity
      user.cart[itemIndex].quantity += quantity;
    } else {
      // Book does not exist in cart, add new item
      user.cart.push({ bookId: bookId, quantity: quantity });
    }

    await user.save();
    // Populate the updated cart item(s) before sending back
    const updatedUser = await User.findById(userId).populate('cart.bookId');
    res.status(200).json(updatedUser.cart); // Send back the updated cart

  } catch (err) {
    console.error('Error adding item to cart:', err);
    res.status(500).json({ message: err.message });
  }
});

// DELETE remove item from cart - Protected
router.delete('/remove/:bookId', authenticateJWT, async (req, res) => {
  const { bookId } = req.params; // Get bookId from URL parameters

  try {
    // In a real application, you would get the user ID from the authenticated user
    const userId = req.user.id; // Assuming the JWT payload has an 'id' field
     if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
    }

    // Find the user document
    const user = await User.findById(userId);

    if (!user) {
         return res.status(404).json({ message: 'User not found' });
    }

    // Filter out the book with the matching bookId from the cart array
    user.cart = user.cart.filter(item => item.bookId && item.bookId.toString() !== bookId);

    await user.save();
    res.status(200).json({ message: 'Item removed from cart' }); // Send a success message
  } catch (err) {
    console.error('Error removing item from cart:', err);
    res.status(500).json({ message: err.message });
  }
});

// PUT update item in cart - Protected (Optional based on your prioritized list)
router.put('/update-quantity', authenticateJWT, async (req, res) => {
  const { bookId, quantity } = req.body;
  try {
    const userId = req.user.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.cart) {
        return res.status(404).json({ message: 'Cart not found' }); // User exists but has no cart? Unusual, but handle.
    }

    const itemIndex = user.cart.findIndex(item => item.bookId && item.bookId.toString() === bookId);

    if (itemIndex > -1) {
      user.cart[itemIndex].quantity = quantity;
      await user.save();
      res.status(200).json({ message: 'Quantity updated successfully', cart: user.cart[itemIndex] }); // Respond with updated item or cart
    } else {
      res.status(404).json({ message: 'Item not found in cart' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;