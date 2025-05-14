// backend/observers/orderObservers.js

/**
 * Observer function to log a simulated admin notification for a new order.
 * @param {object} order - The placed order object.
 */
async function logAdminNotification(order) {
  console.log(`[Observer] Admin Notification: New Order Placed!`);
  console.log(`[Observer]   Order ID: ${order._id}`);
  console.log(`[Observer]   User ID: ${order.user}`);
  // In a real application, this would send an email, push notification, etc.
}

/**
 * Observer function to simulate inventory updates based on a new order.
 * @param {object} order - The placed order object.
 */
async function simulateInventoryUpdate(order) {
    console.log(`[Observer] Inventory Update: Simulating update for Order ID: ${order._id}`);
    // In a real application, you would iterate through order.items
    // and decrement stock levels for each book in your database.
    // console.log('[Observer]   Items:', order.items);
}

module.exports = {
  logAdminNotification,
  simulateInventoryUpdate,
};