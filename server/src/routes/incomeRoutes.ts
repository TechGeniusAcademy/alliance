import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import {
  getMasterIncome,
  downloadInvoice,
  downloadAct
} from '../controllers/incomeController';

const router = express.Router();

// Все маршруты требуют авторизации
router.use(authMiddleware);

// Получить данные о доходах мастера
router.get('/master', getMasterIncome);

// Скачать счет
router.get('/download/invoice/:orderId', downloadInvoice);

// Скачать акт выполненных работ
router.get('/download/act/:orderId', downloadAct);

export default router;
