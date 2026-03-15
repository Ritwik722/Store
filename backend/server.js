const express = require('express');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');
const db = require('./database');

// Routes
const authRoutes = require('./routes/auth');
const productsRoutes = require('./routes/products');
const adminRoutes = require('./routes/admin');
const cartRoutes = require('./routes/cart');
const ordersRoutes = require('./routes/orders');

const app = express();
const PORT = process.env.PORT || 3000;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, './uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, './uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', ordersRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Serve index.html for root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Initialize database and start server
db.initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`✨ Anshita Store server running on http://localhost:${PORT}`);
  });
}).catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
