import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import {
  getMasterSettings,
  updateMasterSettings,
  resetMasterSettings,
  changePassword,
  getMasterPublicSettings
} from '../controllers/settingsController';

const router = express.Router();

// Получить настройки мастера
router.get('/master', authMiddleware, getMasterSettings);

// Обновить настройки мастера
router.put('/master', authMiddleware, updateMasterSettings);

// Сбросить настройки к значениям по умолчанию
router.post('/master/reset', authMiddleware, resetMasterSettings);

// Изменить пароль
router.post('/change-password', authMiddleware, changePassword);

// Получить публичные настройки мастера (доступно без авторизации)
router.get('/master/:masterId/public', getMasterPublicSettings);

export default router;
