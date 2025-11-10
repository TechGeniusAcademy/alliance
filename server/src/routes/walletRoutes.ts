import express from 'express';
import {
  getWalletBalance,
  getWalletStats,
  depositToWallet,
  payCommissionFromWallet,
  getWalletTransactions,
  createWalletPaymentIntent,
  confirmWalletPayment,
  getStripePublishableKey,
} from '../controllers/walletController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// Публичные маршруты (без авторизации)
router.get('/stripe-key', getStripePublishableKey);

// Все остальные маршруты требуют авторизации
router.use(authMiddleware);

// Получить баланс кошелька
router.get('/balance', getWalletBalance);

// Получить статистику кошелька
router.get('/stats', getWalletStats);

// Получить историю транзакций
router.get('/transactions', getWalletTransactions);

// Пополнить кошелек (старый метод без Stripe)
router.post('/deposit', depositToWallet);

// Оплатить комиссию из кошелька
router.post('/pay-commission', payCommissionFromWallet);

// Stripe маршруты для пополнения кошелька
router.post('/create-payment-intent', createWalletPaymentIntent);
router.post('/confirm-payment', confirmWalletPayment);

export default router;
