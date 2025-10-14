const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/campus-connect';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Schemas
const menuItemSchema = new mongoose.Schema({
  id: { type: String, default: () => uuidv4() },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  available: { type: Boolean, default: true },
  category: { type: String, default: 'Main Course' },
  prepTime: { type: Number, default: 15 },
  calories: { type: Number, default: 0 },
  veg: { type: Boolean, default: true },
  popular: { type: Boolean, default: false },
  image: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

const orderSchema = new mongoose.Schema({
  id: { type: String, default: () => uuidv4() },
  itemId: { type: String, required: true },
  itemName: { type: String, required: true },
  qty: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'ready', 'picked'], default: 'pending' },
  studentId: { type: String, required: true },
  studentName: { type: String, required: true },
  totalAmount: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const MenuItem = mongoose.model('MenuItem', menuItemSchema);
const Order = mongoose.model('Order', orderSchema);

// API Routes

// Menu Management
app.get('/api/canteen/menu', async (req, res) => {
  try {
    const menu = await MenuItem.find().sort({ createdAt: -1 });
    res.json(menu);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch menu' });
  }
});

app.post('/api/canteen/menu', async (req, res) => {
  try {
    const { name, price, available = true, category = 'Main Course', prepTime = 15, calories = 0, veg = true, popular = false, image = '' } = req.body;
    
    const menuItem = new MenuItem({
      name,
      price,
      available,
      category,
      prepTime,
      calories,
      veg,
      popular,
      image
    });
    
    await menuItem.save();
    res.status(201).json(menuItem);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create menu item' });
  }
});

app.put('/api/canteen/menu/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const menuItem = await MenuItem.findOneAndUpdate(
      { id },
      { ...updates, updatedAt: Date.now() },
      { new: true }
    );
    
    if (!menuItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    
    res.json(menuItem);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update menu item' });
  }
});

app.delete('/api/canteen/menu/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await MenuItem.findOneAndDelete({ id });
    
    if (!result) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete menu item' });
  }
});

// Order Management
app.get('/api/canteen/orders/pending', async (req, res) => {
  try {
    const orders = await Order.find({ status: 'pending' }).sort({ createdAt: 1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pending orders' });
  }
});

app.get('/api/canteen/orders/me', async (req, res) => {
  try {
    const { studentId } = req.query;
    if (!studentId) {
      return res.status(400).json({ error: 'Student ID required' });
    }
    
    const orders = await Order.find({ studentId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user orders' });
  }
});

app.post('/api/canteen/orders', async (req, res) => {
  try {
    const { itemId, qty, studentId, studentName } = req.body;
    
    // Get menu item details
    const menuItem = await MenuItem.findOne({ id: itemId });
    if (!menuItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    
    if (!menuItem.available) {
      return res.status(400).json({ error: 'Item not available' });
    }
    
    const order = new Order({
      itemId,
      itemName: menuItem.name,
      qty,
      studentId,
      studentName,
      totalAmount: menuItem.price * qty
    });
    
    await order.save();
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create order' });
  }
});

app.put('/api/canteen/orders/pickup/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await Order.findOneAndUpdate(
      { id },
      { status: 'picked', updatedAt: Date.now() },
      { new: true }
    );
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark order as picked' });
  }
});

// Analytics
app.get('/api/canteen/analytics', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const totalOrders = await Order.countDocuments();
    const todayOrders = await Order.countDocuments({ createdAt: { $gte: today } });
    const totalRevenue = await Order.aggregate([
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const todayRevenue = await Order.aggregate([
      { $match: { createdAt: { $gte: today } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    
    res.json({
      totalOrders,
      todayOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      todayRevenue: todayRevenue[0]?.total || 0
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🍽️  Menu API: http://localhost:${PORT}/api/canteen/menu`);
});
