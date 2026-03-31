import express from 'express';
import {
  getAll3DModels,
  get3DModelById,
  create3DModel,
  update3DModel,
  delete3DModel,
  updateViewSettings,
  upload
} from '../controllers/furniture3DController';
import {
  addModelParameter,
  getModelParameters,
  updateModelParameter,
  deleteModelParameter,
  getModelWithParameters,
  calculatePrice
} from '../controllers/modelParametersController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// Получить все модели (доступно всем авторизованным)
router.get('/', authMiddleware, getAll3DModels);

// Получить одну модель
router.get('/:id', authMiddleware, get3DModelById);

// Получить модель с параметрами
router.get('/:id/with-parameters', authMiddleware, getModelWithParameters);

// Создать модель (только админ)
router.post('/', authMiddleware, upload.fields([
  { name: 'objFile', maxCount: 1 },
  { name: 'mtlFile', maxCount: 1 },
  { name: 'textureFiles', maxCount: 10 },
  { name: 'previewImage', maxCount: 1 }
]), create3DModel);

// Обновить модель (только админ)
router.put('/:id', authMiddleware, update3DModel);

// Обновить настройки вида модели
router.put('/:id/view-settings', authMiddleware, updateViewSettings);

// Параметры модели
router.get('/:model_id/parameters', authMiddleware, getModelParameters);
router.post('/parameters', authMiddleware, addModelParameter);
router.put('/parameters/:id', authMiddleware, updateModelParameter);
router.delete('/parameters/:id', authMiddleware, deleteModelParameter);

// Рассчитать цену
router.post('/calculate-price', authMiddleware, calculatePrice);

// Удалить модель (только админ)
router.delete('/:id', authMiddleware, delete3DModel);

export default router;
