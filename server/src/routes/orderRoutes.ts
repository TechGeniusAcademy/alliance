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
  markAsShipped,
  confirmDelivery,
  getOrderDelivery,
  getMasterActiveOrders,
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

// Получить активные заказы мастера (где он назначен)
router.get('/master/active', getMasterActiveOrders);

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

// Отметить заказ как отправленный (мастер)
router.post('/:orderId/ship', markAsShipped);

// Подтвердить доставку (клиент)
router.post('/:orderId/confirm-delivery', confirmDelivery);

// Получить информацию о доставке
router.get('/:orderId/delivery', getOrderDelivery);

export default router;
