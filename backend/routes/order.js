const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Adjust the path to your User model
const authenticateJWT = require('../middleware/auth'); // Adjust the path to your auth middleware
const { Notifier } = require('../utils/observer');
const Order = require('../models/Order');
const Book = require('../models/Book');
const { logAdminNotification, simulateInventoryUpdate } = require('../observers/orderObservers');
const orderNotifier = new Notifier();
// POST /api/orders/checkout - Process user's cart into an order
router.post('/checkout', authenticateJWT, async (req, res) => {
    try {
        const userId = req.user.id; // Get user ID from authenticated token

        const user = await User.findById(userId).populate('cart.bookId'); // Populate book details

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.cart || user.cart.length === 0) {
            return res.status(400).json({ message: 'Cannot checkout with an empty cart' });
        }

        // Map cart items to order items and calculate total
        const orderItems = user.cart.map(item => {
            // Ensure bookId is populated and has price
            if (!item.bookId || !item.bookId.price) {
                 // This is a critical error, as the populated book data is missing
                 console.error(`Checkout error: Book details missing for item in cart (User ID: ${userId}, Item ID: ${item._id})`);
                 throw new Error(`Book details missing for an item in your cart. Please try refreshing.`);
            }
            return {
                bookId: item.bookId._id,
                quantity: item.quantity,
                price: item.bookId.price // Use the price from the populated book
            };
        });

        const totalAmount = orderItems.reduce((total, item) => total + item.quantity * item.price, 0);

        // Create the new order document
        const newOrder = new Order({
            user: userId,
            items: orderItems,
            totalAmount: totalAmount,
            orderDate: new Date(),
            status: 'Pending' // Initial status
        });

        // Save the order
        await newOrder.save();

        // Clear the user's cart
        user.cart = [];
        await user.save();
        
        // Notify observers about the new order
        orderNotifier.notify(newOrder);
        
        console.log(`Order created for user ${userId}. Order ID: ${newOrder._id}`);
        
        res.status(201).json({ message: 'Order placed successfully', order: newOrder });
        
    } catch (error) {
        console.error('Error during checkout:', error);
        res.status(500).json({ message: error.message || 'Internal server error during checkout' });
    }
});

 orderNotifier.subscribe(logAdminNotification);
orderNotifier.subscribe(simulateInventoryUpdate);

// GET /api/orders - Get all orders (Admin only, or maybe redirect to /history for users)
// Placeholder - Needs authorization check for admin
router.get('/', authenticateJWT, async (req, res) => {
    try {
        // In a real app, check if req.user has admin role
        // if (req.user.role !== 'admin') {
        //     return res.status(403).json({ message: 'Access denied: Admins only' });
        // }
        const orders = await Order.find().populate('user', 'email').populate('items.bookId', 'title author price');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching orders' });
    }
// GET /api/orders/history - Get user's order history
router.get('/history', async (req, res) => {
  try {
    // Assume user is available on req.user from authentication middleware
    const userId = req.user.id; // Or req.user._id

    const orders = await Order.find({ user: userId }).populate('items.book');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/orders/:orderId - Get details of a specific order
router.get('/:orderId', async (req, res) => {
 try {
        const order = await Order.findById(req.params.orderId).populate('items.bookId', 'title author price');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Ensure the order belongs to the authenticated user
        // If this route is also used by admin, you'd add an admin check here
        if (order.user.toString() !== req.user.id.toString()) {
             // Use req.user.id assuming your JWT payload includes 'id'
            return res.status(403).json({ message: 'Unauthorized to view this order' });
        }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;