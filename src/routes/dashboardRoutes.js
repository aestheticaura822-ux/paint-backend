// backend/src/routes/dashboardRoutes.js
import express from 'express';
import { 
  getDashboardStats, 
  getSalesChart, 
  getRecentOrders 
} from '../controllers/dashboardController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/stats', protect, adminOnly, getDashboardStats);
router.get('/sales-chart', protect, adminOnly, getSalesChart);
router.get('/recent-orders', protect, adminOnly, getRecentOrders);

export default router;