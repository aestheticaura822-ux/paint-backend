// backend/src/routes/adminRoutes.js
import express from 'express';
import { adminLogin, verifyAdmin } from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   POST /api/admin/login
// @desc    Admin login
// @access  Public
router.post('/login', adminLogin);

// @route   GET /api/admin/verify
// @desc    Verify admin token
// @access  Private
router.get('/verify', protect, verifyAdmin);

// @route   POST /api/admin/logout
// @desc    Admin logout
// @access  Private
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

export default router;