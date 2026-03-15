const express = require('express');
const db = require('../database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Create order
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { items, total_amount, shipping_address, payment_method, payment_id } = req.body;
    const userId = req.user.id;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Order must have items' });
    }

    // Create order
    const orderResult = await db.runQuery(
      'INSERT INTO orders (user_id, total_amount, shipping_address, payment_method, payment_id, status) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, total_amount, shipping_address, payment_method, payment_id, 'pending']
    );

    const orderId = orderResult.lastID;

    // Add order items
    for (const item of items) {
      await db.runQuery(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, item.productId, item.quantity, item.price]
      );

      // Update product stock
      await db.runQuery(
        'UPDATE products SET stock = stock - ? WHERE id = ?',
        [item.quantity, item.productId]
      );
    }

    res.status(201).json({ 
      message: 'Order created successfully',
      orderId
    });
  } catch (err) {
    console.error('Error creating order:', err);
    res.status(500).json({ message: 'Error creating order' });
  }
});

// Get user orders
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const orders = await db.allQuery(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );

    // Get items for each order
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const items = await db.allQuery(
          'SELECT * FROM order_items WHERE order_id = ?',
          [order.id]
        );
        return { ...order, items };
      })
    );

    res.json(ordersWithItems);
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ message: 'Error fetching orders' });
  }
});

// Get order by ID
router.get('/:orderId', authenticateToken, async (req, res) => {
  try {
    const order = await db.getQuery(
      'SELECT * FROM orders WHERE id = ? AND user_id = ?',
      [req.params.orderId, req.user.id]
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const items = await db.allQuery(
      'SELECT * FROM order_items WHERE order_id = ?',
      [req.params.orderId]
    );

    res.json({ ...order, items });
  } catch (err) {
    console.error('Error fetching order:', err);
    res.status(500).json({ message: 'Error fetching order' });
  }
});

module.exports = router;
