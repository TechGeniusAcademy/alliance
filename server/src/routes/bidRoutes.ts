import express from 'express';
import {
  createBid,
  getMyBids,
  getMyBidForOrder,
  deleteBid,
  getOrderBidsForMaster,
} from '../controllers/bidController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// Все маршруты требуют авторизации
router.use(authMiddleware);

// Создать/обновить ставку на заказ
router.post('/:orderId', createBid);

// Получить все свои ставки
router.get('/my-bids', getMyBids);

// Получить свою ставку на конкретный заказ
router.get('/my-bid/:orderId', getMyBidForOrder);

// Получить информацию о конкуренции (статистика ставок)
router.get('/competition/:orderId', getOrderBidsForMaster);

// Удалить свою ставку
router.delete('/:bidId', deleteBid);

export default router;
