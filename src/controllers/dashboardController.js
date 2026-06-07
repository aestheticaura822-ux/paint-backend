// backend/src/controllers/dashboardController.js
import { supabase } from '../config/supabase.js';

// @desc    Get dashboard stats
// @route   GET /api/dashboard/stats
export const getDashboardStats = async (req, res) => {
  try {
    // Get products count
    const { count: productsCount, error: productsError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });
    
    // Get orders
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*');
    
    // Get unread messages count
    const { count: unreadCount, error: messagesError } = await supabase
      .from('contacts')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'unread');
    
    // Calculate total revenue
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
};

// @desc    Get sales chart data
// @route   GET /api/dashboard/sales-chart
export const getSalesChart = async (req, res) => {
  try {
    // Get last 7 days
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      last7Days.push(dayName);
    }
    
    // Mock sales data (you can replace with real data from orders)
    const salesData = last7Days.map(day => ({
      name: day,
      sales: Math.floor(Math.random() * 10000) + 2000
    }));
    
    res.json(salesData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get recent orders
// @route   GET /api/dashboard/recent-orders
export const getRecentOrders = async (req, res) => {
  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (error) throw error;
    res.json(orders || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};