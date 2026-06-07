// backend/src/routes/orderRoutes.js
import express from 'express';
import {
  getOrders,
  createOrder,
  updateOrderStatus
} from '../controllers/orderController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, adminOnly, getOrders)
  .post(createOrder);

router.put('/:id/status', protect, adminOnly, updateOrderStatus);

export default router;