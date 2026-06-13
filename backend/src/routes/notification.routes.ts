import { Router } from 'express';
import {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
} from '../controllers/notification.controller';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

// All notification routes require authentication
router.use(protect);

// Get all notifications for logged-in user
router.get('/', getUserNotifications);

// Mark all notifications as read
router.patch('/read-all', markAllAsRead);

// Mark a specific notification as read
router.patch('/:id/read', markAsRead);

export default router;
