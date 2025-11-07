import express from 'express';
import {
  createOrder,
  getCustomerOrders,
  getAuctionOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  getOrderBids,
  acceptBid,
} from '../controllers/orderController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// Все маршруты требуют авторизации
router.use(authMiddleware);

// Создать заказ
router.post('/', createOrder);

// Получить свои заказы (для клиента)
router.get('/my-orders', getCustomerOrders);

// Получить заказы в аукционе (для мастеров)
router.get('/auction', getAuctionOrders);

// Получить детали заказа
router.get('/:orderId', getOrderById);

// Обновить заказ
router.put('/:orderId', updateOrder);

// Удалить заказ
router.delete('/:orderId', deleteOrder);

// Получить ставки на заказ
router.get('/:orderId/bids', getOrderBids);

// Принять ставку
router.post('/bids/:bidId/accept', acceptBid);

export default router;
