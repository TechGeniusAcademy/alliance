import express from 'express';
import {
  getUserTransactions,
  getUserBalance,
  getPaymentStats,
  getUserInvoices
} from '../controllers/transactionController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// Все маршруты требуют авторизации
router.use(authMiddleware);

// GET /api/transactions - получить все транзакции пользователя
router.get('/', getUserTransactions);

// GET /api/transactions/balance - получить баланс
router.get('/balance', getUserBalance);

// GET /api/transactions/stats - получить статистику платежей
router.get('/stats', getPaymentStats);

// GET /api/transactions/invoices - получить счета
router.get('/invoices', getUserInvoices);

export default router;
