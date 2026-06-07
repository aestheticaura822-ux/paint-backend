// backend/api/index.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { supabase } from '../src/config/supabase.js';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();

// CORS
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://paint-website-dusky.vercel.app',
    'https://paint-website-dusky.vercel.app/'
  ],
  credentials: true,
}));
app.use(express.json());

// ========== HEALTH CHECK ==========
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Backend is live!',
    timestamp: new Date().toISOString()
  });
});

// ========== PRODUCTS ==========
app.get('/api/products', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ========== ADMIN LOGIN ==========
app.post('/api/admin/login', (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (email === 'admin@paint.com' && password === 'Admin@123') {
      const token = jwt.sign(
        { email, role: 'admin' },
        process.env.JWT_SECRET || 'my_secret_key',
        { expiresIn: '30d' }
      );
      res.json({ 
        success: true, 
        token, 
        admin: { email, name: 'Admin User' } 
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ========== ORDERS ==========
app.post('/api/orders', async (req, res) => {
  try {
    const orderNumber = `ORD${Date.now()}`;
    const { data, error } = await supabase
      .from('orders')
      .insert([{
        order_number: orderNumber,
        customer_name: req.body.customerName,
        customer_email: req.body.customerEmail,
        customer_phone: req.body.customerPhone,
        products: req.body.products,
        total_amount: req.body.totalAmount,
        status: 'pending',
        shipping_address: req.body.shippingAddress,
        payment_method: req.body.paymentMethod || 'cod',
        created_at: new Date()
      }])
      .select();
    
    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/orders', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ========== CONTACTS ==========
app.post('/api/contacts', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('contacts')
      .insert([{
        name: req.body.name,
        email: req.body.email,
        subject: req.body.subject || '',
        message: req.body.message,
        status: 'unread',
        created_at: new Date()
      }])
      .select();
    
    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/contacts', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ========== DASHBOARD STATS ==========
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const { count: productsCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });
    
    const { data: orders } = await supabase
      .from('orders')
      .select('*');
    
    const { count: unreadCount } = await supabase
      .from('contacts')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'unread');
    
    const deliveredOrders = orders?.filter(o => o.status === 'delivered') || [];
    const totalRevenue = deliveredOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
    
    res.json({
      totalProducts: productsCount || 0,
      totalOrders: orders?.length || 0,
      totalRevenue,
      unreadMessages: unreadCount || 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ========== EXPORT FOR VERCEL ==========
export default app;