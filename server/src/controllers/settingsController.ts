import { Request, Response } from 'express';
import pool from '../config/database';

interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role?: string;
  };
}

interface MasterSettings {
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    newAuctions: boolean;
    bidAccepted: boolean;
    orderUpdates: boolean;
    messages: boolean;
    reviews: boolean;
    payments: boolean;
  };
  privacy: {
    showProfile: boolean;
    showPortfolio: boolean;
    showRating: boolean;
    showCompletedOrders: boolean;
    allowDirectMessages: boolean;
  };
  work: {
    autoAcceptAuctions: boolean;
    maxActiveOrders: number;
    minOrderAmount: number;
    workingDays: string[];
    workingHoursStart: string;
    workingHoursEnd: string;
  };
  finance: {
    currency: 'KZT' | 'USD' | 'RUB';
    taxRate: number;
    paymentMethods: string[];
  };
  language: 'ru' | 'kk' | 'en';
  theme: 'light' | 'dark' | 'auto';
}

const defaultSettings: MasterSettings = {
  notifications: {
    email: true,
    push: true,
    sms: false,
    newAuctions: true,
    bidAccepted: true,
    orderUpdates: true,
    messages: true,
    reviews: true,
    payments: true,
  },
  privacy: {
    showProfile: true,
    showPortfolio: true,
    showRating: true,
    showCompletedOrders: true,
    allowDirectMessages: true,
  },
  work: {
    autoAcceptAuctions: false,
    maxActiveOrders: 5,
    minOrderAmount: 10000,
    workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    workingHoursStart: '09:00',
    workingHoursEnd: '18:00',
  },
  finance: {
    currency: 'KZT',
    taxRate: 12,
    paymentMethods: ['cash', 'card', 'transfer'],
  },
  language: 'ru',
  theme: 'light',
};

// Получить настройки мастера
export const getMasterSettings = async (req: AuthRequest, res: Response) => {
  try {
    const masterId = req.user?.id;
    console.log('getMasterSettings called for masterId:', masterId);

    const result = await pool.query(
      `SELECT settings FROM master_settings WHERE master_id = $1`,
      [masterId]
    );

    if (result.rows.length === 0) {
      // Если настроек нет, возвращаем настройки по умолчанию
      console.log('No settings found, returning defaults');
      return res.json(defaultSettings);
    }

    console.log('Settings found:', result.rows[0].settings);
    res.json(result.rows[0].settings);
  } catch (error) {
    console.error('Ошибка получения настроек:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Обновить настройки мастера
export const updateMasterSettings = async (req: AuthRequest, res: Response) => {
  try {
    const masterId = req.user?.id;
    const settings: MasterSettings = req.body;
    
    console.log('==========================================');
    console.log('updateMasterSettings called for masterId:', masterId);
    console.log('Settings to save:', JSON.stringify(settings, null, 2));
    console.log('==========================================');

    // Проверяем, существуют ли настройки
    const existing = await pool.query(
      `SELECT id FROM master_settings WHERE master_id = $1`,
      [masterId]
    );

    if (existing.rows.length === 0) {
      // Создаём новую запись
      console.log('Creating new settings record');
      await pool.query(
        `INSERT INTO master_settings (master_id, settings, created_at, updated_at)
         VALUES ($1, $2, NOW(), NOW())`,
        [masterId, JSON.stringify(settings)]
      );
    } else {
      // Обновляем существующую
      console.log('Updating existing settings record');
      await pool.query(
        `UPDATE master_settings 
         SET settings = $1, updated_at = NOW()
         WHERE master_id = $2`,
        [JSON.stringify(settings), masterId]
      );
    }

    console.log('Settings saved successfully');
    res.json({ success: true, settings });
  } catch (error) {
    console.error('Ошибка сохранения настроек:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Сбросить настройки к значениям по умолчанию
export const resetMasterSettings = async (req: AuthRequest, res: Response) => {
  try {
    const masterId = req.user?.id;

    await pool.query(
      `UPDATE master_settings 
       SET settings = $1, updated_at = NOW()
       WHERE master_id = $2`,
      [JSON.stringify(defaultSettings), masterId]
    );

    res.json({ success: true, settings: defaultSettings });
  } catch (error) {
    console.error('Ошибка сброса настроек:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Изменить пароль
export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Необходимо указать текущий и новый пароль' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Новый пароль должен быть не менее 6 символов' });
    }

    // Получаем текущий хеш пароля
    const result = await pool.query(
      `SELECT password FROM users WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    // Проверяем текущий пароль
    const bcrypt = require('bcryptjs');
    const isValid = await bcrypt.compare(currentPassword, result.rows[0].password);

    if (!isValid) {
      return res.status(401).json({ error: 'Неверный текущий пароль' });
    }

    // Хешируем новый пароль
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Обновляем пароль
    await pool.query(
      `UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2`,
      [hashedPassword, userId]
    );

    res.json({ success: true, message: 'Пароль успешно изменён' });
  } catch (error) {
    console.error('Ошибка изменения пароля:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Получить публичные настройки мастера (для клиентов)
export const getMasterPublicSettings = async (req: Request, res: Response) => {
  try {
    const masterId = parseInt(req.params.masterId);
    console.log('getMasterPublicSettings called for masterId:', masterId);

    const result = await pool.query(
      `SELECT settings FROM master_settings WHERE master_id = $1`,
      [masterId]
    );

    if (result.rows.length === 0) {
      // Если настроек нет, возвращаем настройки по умолчанию (всё видимо)
      console.log('No settings found, returning default public settings');
      return res.json({
        showProfile: true,
        showPortfolio: true,
        showRating: true,
        showCompletedOrders: true,
        allowDirectMessages: true,
      });
    }

    const settings = result.rows[0].settings;
    // Возвращаем только публичные настройки приватности
    const publicSettings = {
      showProfile: settings.privacy?.showProfile ?? true,
      showPortfolio: settings.privacy?.showPortfolio ?? true,
      showRating: settings.privacy?.showRating ?? true,
      showCompletedOrders: settings.privacy?.showCompletedOrders ?? true,
      allowDirectMessages: settings.privacy?.allowDirectMessages ?? true,
    };

    console.log('Public settings:', publicSettings);
    res.json(publicSettings);
  } catch (error) {
    console.error('Ошибка получения публичных настроек:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};
