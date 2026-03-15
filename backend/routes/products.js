const express = require('express');
const db = require('../database');

const router = express.Router();

// Get all products
router.get('/', async (req, res) => {
  try {
    const search = req.query.search || '';
    const category = req.query.category || null;

    let query = 'SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (p.name LIKE ? OR p.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (category) {
      query += ' AND p.category_id = ?';
      params.push(category);
    }

    query += ' ORDER BY p.created_at DESC';

    const products = await db.allQuery(query, params);
    res.json(products);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ message: 'Error fetching products' });
  }
});

// Get single product with reviews
router.get('/:id', async (req, res) => {
  try {
    const product = await db.getQuery(
      'SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ?',
      [req.params.id]
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const reviews = await db.allQuery(
      'SELECT r.*, u.username FROM reviews r LEFT JOIN users u ON r.user_id = u.id WHERE r.product_id = ? ORDER BY r.created_at DESC',
      [req.params.id]
    );

    const avgRating = await db.getQuery(
      'SELECT AVG(rating) as avg_rating FROM reviews WHERE product_id = ?',
      [req.params.id]
    );

    res.json({
      ...product,
      reviews,
      avg_rating: avgRating?.avg_rating || 0
    });
  } catch (err) {
    console.error('Error fetching product:', err);
    res.status(500).json({ message: 'Error fetching product' });
  }
});

// Get categories
router.get('/category/list', async (req, res) => {
  try {
    const categories = await db.allQuery('SELECT * FROM categories ORDER BY name');
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching categories' });
  }
});

module.exports = router;
