import express from 'express';
import { getProfile, updateProfile, changePassword, getMasterInfo } from '../controllers/profileController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// Публичный роут для получения информации о мастере
router.get('/master/:masterId', getMasterInfo);

// Все остальные роуты требуют аутентификации
router.use(authMiddleware);

// GET /api/profile - Получить профиль
router.get('/', getProfile);

// PUT /api/profile - Обновить профиль
router.put('/', updateProfile);

// POST /api/profile/change-password - Сменить пароль
router.post('/change-password', changePassword);

export default router;
