const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { initDatabase } = require('./config/db');
const authRoutes = require('./routes/auth');
const categoryRoutes = require('./routes/categories');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const promotionRoutes = require('./routes/promotions');
const profileRoutes = require('./routes/profile');
const warehouseRoutes = require('./routes/warehouse');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files for product images
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/promotions', promotionRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/warehouse', warehouseRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Highlands Coffee API is running' });
});

// Start server
async function start() {
  try {
    await initDatabase();
    app.listen(PORT, () => {
      console.log('');
      console.log('☕ ================================');
      console.log(`☕  Highlands Coffee API Server`);
      console.log(`☕  Running on port ${PORT}`);
      console.log(`☕  http://localhost:${PORT}`);
      console.log('☕ ================================');
      console.log('');
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

start();
