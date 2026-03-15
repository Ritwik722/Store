const express = require('express');
const db = require('../database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get user cart (sessions based, stored in memory for simplicity)
const carts = {};

router.get('/:userId', (req, res) => {
  const userId = req.params.userId;
  res.json(carts[userId] || []);
});

// Add to cart
router.post('/:userId/add', async (req, res) => {
  try {
    const { userId } = req.params;
    const { productId, quantity } = req.body;

    if (!productId || !quantity) {
      return res.status(400).json({ message: 'Product ID and quantity are required' });
    }

    // Get product details
    const product = await db.getQuery('SELECT * FROM products WHERE id = ?', [productId]);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    if (!carts[userId]) {
      carts[userId] = [];
    }

    // Check if product already in cart
    const existingItem = carts[userId].find(item => item.productId === productId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      carts[userId].push({
        productId,
        name: product.name,
        price: product.price,
        image_url: product.image_url,
        quantity
      });
    }

    res.json({ message: 'Product added to cart', cart: carts[userId] });
  } catch (err) {
    console.error('Error adding to cart:', err);
    res.status(500).json({ message: 'Error adding to cart' });
  }
});

// Remove from cart
router.post('/:userId/remove', (req, res) => {
  try {
    const { userId } = req.params;
    const { productId } = req.body;

    if (!carts[userId]) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    carts[userId] = carts[userId].filter(item => item.productId !== productId);
    res.json({ message: 'Product removed from cart', cart: carts[userId] });
  } catch (err) {
    res.status(500).json({ message: 'Error removing from cart' });
  }
});

// Update quantity
router.post('/:userId/update', (req, res) => {
  try {
    const { userId } = req.params;
    const { productId, quantity } = req.body;

    if (!carts[userId]) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const item = carts[userId].find(i => i.productId === productId);
    if (!item) {
      return res.status(404).json({ message: 'Product not in cart' });
    }

    item.quantity = Math.max(1, quantity);
    res.json({ message: 'Cart updated', cart: carts[userId] });
  } catch (err) {
    res.status(500).json({ message: 'Error updating cart' });
  }
});

// Clear cart
router.post('/:userId/clear', (req, res) => {
  const { userId } = req.params;
  carts[userId] = [];
  res.json({ message: 'Cart cleared' });
});

module.exports = router;
