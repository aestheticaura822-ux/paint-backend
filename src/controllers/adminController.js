// backend/src/controllers/adminController.js
import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase.js';

// @desc    Admin login
// @route   POST /api/admin/login
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Fixed admin credentials (can also check from Supabase)
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      const token = jwt.sign(
        { id: 1, email, role: 'admin' },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
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
};

// @desc    Verify admin token
// @route   GET /api/admin/verify
export const verifyAdmin = async (req, res) => {
  try {
    res.json({ success: true, admin: req.admin });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};