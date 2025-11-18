import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import {
  getMyChats,
  getOrCreateChat,
  getChatMessages,
  sendMessage,
  submitForReview,
  acceptWork,
  getWorkAct,
  getMasterReviews,
  markMessagesAsRead
} from '../controllers/chatController';

const router = express.Router();

// Все маршруты требуют авторизации
router.use(authMiddleware);

// Получить все чаты пользователя
router.get('/', getMyChats);

// Получить или создать чат для заказа
router.get('/order/:orderId', getOrCreateChat);

// Получить сообщения чата
router.get('/:chatId/messages', getChatMessages);

// Отметить сообщения как прочитанные
router.post('/:chatId/mark-read', markMessagesAsRead);

// Отправить сообщение
router.post('/:chatId/messages', sendMessage);

// Отправить работу на оценку (мастер)
router.post('/order/:orderId/submit', submitForReview);

// Принять работу (клиент)
router.post('/order/:orderId/accept', acceptWork);

// Получить акт выполненных работ
router.get('/order/:orderId/act', getWorkAct);

// Получить отзывы мастера
router.get('/reviews/my', getMasterReviews);

export default router;
