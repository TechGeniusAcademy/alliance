import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import {
  getScheduleItems,
  createScheduleItem,
  updateScheduleItem,
  deleteScheduleItem,
  toggleScheduleItemStatus
} from '../controllers/scheduleController';

const router = express.Router();

// Все маршруты требуют авторизации
router.use(authMiddleware);

// Получить все события расписания
router.get('/', getScheduleItems);

// Создать новое событие
router.post('/', createScheduleItem);

// Обновить событие
router.put('/:id', updateScheduleItem);

// Удалить событие
router.delete('/:id', deleteScheduleItem);

// Изменить статус события
router.patch('/:id/status', toggleScheduleItemStatus);

export default router;
