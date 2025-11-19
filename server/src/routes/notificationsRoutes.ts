import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllRead,
  getUnreadCount
} from '../controllers/notificationsController';

const router = express.Router();

// Получить все уведомления
router.get('/', authMiddleware, getNotifications);

// Получить количество непрочитанных
router.get('/unread-count', authMiddleware, getUnreadCount);

// Отметить уведомление как прочитанное
router.patch('/:id/read', authMiddleware, markAsRead);

// Отметить все как прочитанные
router.patch('/read-all', authMiddleware, markAllAsRead);

// Удалить уведомление
router.delete('/:id', authMiddleware, deleteNotification);

// Удалить все прочитанные
router.delete('/read', authMiddleware, deleteAllRead);

export default router;
