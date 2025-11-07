import express from 'express';
import { getMasterProfile, updateMasterProfile, getPublicMasterProfile } from '../controllers/masterProfileController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// Публичный роут для получения профиля мастера
router.get('/public/:masterId', getPublicMasterProfile);

// Защищенные роуты (требуют аутентификации)
router.use(authMiddleware);

// GET /api/master-profile - Получить свой профиль
router.get('/', getMasterProfile);

// PUT /api/master-profile - Обновить профиль
router.put('/', updateMasterProfile);

export default router;
