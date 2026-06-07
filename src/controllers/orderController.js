// backend/src/controllers/orderController.js
import { supabase } from '../config/supabase.js';

// @desc    Get all orders
export const getOrders = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create order
export const createOrder = async (req, res) => {
  try {
    console.log('📦 Received order data:', req.body);
    
    const orderNumber = `ORD${Date.now()}`;
    
    // Match with your table schema (customer_email required)
    const orderData = {
      order_number: orderNumber,
      customer_name: req.body.customerName,
      customer_email: req.body.customerEmail,  // Required field
      customer_phone: req.body.customerPhone,
      products: req.body.products,
      total_amount: req.body.totalAmount,
      status: 'pending',
      shipping_address: req.body.shippingAddress,
      payment_method: req.body.paymentMethod || 'cod',
      created_at: new Date(),
      updated_at: new Date()
    };
    
    console.log('💾 Saving to Supabase:', orderData);
    
    const { data, error } = await supabase
      .from('orders')
      .insert([orderData])
      .select();
    
    if (error) {
      console.error('❌ Supabase insert error:', error);
      return res.status(500).json({ message: error.message });
    }
    
    console.log('✅ Order saved:', data[0]);
    res.status(201).json(data[0]);
  } catch (error) {
    console.error('❌ Server error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status
export const updateOrderStatus = async (req, res) => {
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
};