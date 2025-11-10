import express from 'express';
import {
  getMasterCommissionBalance,
  getMasterCommissionTransactions,
  calculateCommission,
  markCommissionAsPaid,
} from '../controllers/commissionController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// Все маршруты требуют авторизации
router.use(authMiddleware);

// Получить баланс комиссий мастера
router.get('/balance', getMasterCommissionBalance);

// Получить транзакции комиссий мастера
router.get('/transactions', getMasterCommissionTransactions);

// Рассчитать комиссию (предварительный расчет)
router.post('/calculate', calculateCommission);

// Отметить комиссию как оплаченную (для админа)
router.post('/transactions/:transactionId/pay', markCommissionAsPaid);

export default router;
