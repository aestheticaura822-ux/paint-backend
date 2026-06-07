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
    timestamp: new Date().toISOString(),
    supabase: supabase ? 'Connected' : 'Not configured'
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
// ========== CREATE PRODUCT (REAL) ==========
app.post('/api/products', async (req, res) => {
  try {
    const { name, category, price, stock, description, images, colors } = req.body;
    const slug = name.toLowerCase().replace(/ /g, '-');
    
    const { data, error } = await supabase
      .from('products')
      .insert([{
        name,
        slug,
        category,
        price: parseFloat(price),
        stock: parseInt(stock),
        description,
        images: images || [],
        colors: colors || [],
        created_at: new Date(),
        updated_at: new Date()
      }])
      .select();
    
    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: error.message });
  }
});

// ========== UPDATE PRODUCT (REAL) ==========
app.put('/api/products/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    const updates = req.body;
    
    const { data, error } = await supabase
      .from('products')
      .update({ ...updates, updated_at: new Date() })
      .eq('id', productId)
      .select();
    
    if (error) throw error;
    
    if (data.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(data[0]);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: error.message });
  }
});

// ========== DELETE PRODUCT (REAL) ==========
app.delete('/api/products/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);
    
    if (error) throw error;
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
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

// ========== ORDERS (REAL) ==========
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
        created_at: new Date(),
        updated_at: new Date()
      }])
      .select();
    
    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const { data, error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date() })
      .eq('id', req.params.id)
      .select();
    
    if (error) throw error;
    res.json(data[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ========== CONTACTS (REAL) ==========
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

app.put('/api/contacts/:id/read', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('contacts')
      .update({ status: 'read' })
      .eq('id', req.params.id)
      .select();
    
    if (error) throw error;
    res.json(data[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/contacts/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('id', req.params.id);
    
    if (error) throw error;
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ========== DASHBOARD STATS (REAL) ==========
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    // Real products count
    const { count: productsCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });
    
    // Real orders
    const { data: orders } = await supabase
      .from('orders')
      .select('*');
    
    // Real unread messages count
    const { count: unreadCount } = await supabase
      .from('contacts')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'unread');
    
    // Real revenue calculation
    const deliveredOrders = orders?.filter(o => o.status === 'delivered') || [];
    const totalRevenue = deliveredOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
    
    res.json({
      totalProducts: productsCount || 0,
      totalOrders: orders?.length || 0,
      totalRevenue: totalRevenue,
      unreadMessages: unreadCount || 0,
      pendingOrders: orders?.filter(o => o.status === 'pending').length || 0
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: error.message });
  }
});

// ========== SALES CHART (REAL DATA FROM ORDERS) ==========
app.get('/api/dashboard/sales-chart', async (req, res) => {
  try {
    // Get real orders from last 7 days
    const { data: orders } = await supabase
      .from('orders')
      .select('*')
      .eq('status', 'delivered');
    
    // Calculate sales per day from real orders
    const last7Days = [];
    const salesByDay = {};
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      const dateStr = date.toISOString().split('T')[0];
      last7Days.push(dayName);
      salesByDay[dateStr] = 0;
    }
    
    // Aggregate real order amounts
    orders?.forEach(order => {
      const orderDate = new Date(order.created_at).toISOString().split('T')[0];
      if (salesByDay[orderDate] !== undefined) {
        salesByDay[orderDate] += order.total_amount || 0;
      }
    });
    
    const salesData = last7Days.map((day, index) => ({
      name: day,
      sales: Object.values(salesByDay)[index] || 0
    }));
    
    res.json(salesData);
  } catch (error) {
    console.error('Sales chart error:', error);
    res.status(500).json({ message: error.message });
  }
});

// ========== RECENT ORDERS (REAL) ==========
app.get('/api/dashboard/recent-orders', async (req, res) => {
  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (error) throw error;
    res.json(orders || []);
  } catch (error) {
    console.error('Recent orders error:', error);
    res.status(500).json({ message: error.message });
  }
});

// ========== EXPORT FOR VERCEL ==========
export default app;