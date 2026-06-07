// backend/src/routes/contactRoutes.js
import express from 'express';
import {
  getMessages,
  createMessage,
  markAsRead,
  deleteMessage
} from '../controllers/contactController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, adminOnly, getMessages)
  .post(createMessage);

router.put('/:id/read', protect, adminOnly, markAsRead);
router.delete('/:id', protect, adminOnly, deleteMessage);

export default router;