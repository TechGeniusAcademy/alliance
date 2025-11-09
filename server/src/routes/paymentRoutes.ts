import express from 'express';
import { 
  createPaymentIntent, 
  confirmPayment, 
  getPublishableKey,
  handleStripeWebhook 
} from '../controllers/paymentController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// Получить публичный ключ Stripe
router.get('/config', getPublishableKey);

// Создать платежное намерение
router.post('/create-payment-intent', authMiddleware, createPaymentIntent);

// Подтвердить платеж
router.post('/confirm-payment', authMiddleware, confirmPayment);

// Webhook для Stripe (без authMiddleware)
router.post('/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

export default router;
