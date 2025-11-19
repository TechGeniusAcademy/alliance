import { Request, Response } from 'express';
import pool from '../config/database';

// Получить все чаты пользователя
export const getMyChats = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    const result = await pool.query(
      `SELECT 
        c.*,
        o.title as order_title,
        o.status as order_status,
        customer.name as customer_name,
        customer.profile_photo as customer_photo,
        master.name as master_name,
        master.profile_photo as master_photo,
        (SELECT COUNT(*) FROM chat_messages WHERE chat_id = c.id AND is_read = false AND sender_id != $1) as unread_count,
        (SELECT message FROM chat_messages WHERE chat_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
        (SELECT created_at FROM chat_messages WHERE chat_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message_time
       FROM chats c
       JOIN orders o ON c.order_id = o.id
       JOIN users customer ON c.customer_id = customer.id
       JOIN users master ON c.master_id = master.id
       WHERE c.customer_id = $1 OR c.master_id = $1
       ORDER BY c.updated_at DESC`,
      [userId]
    );

    res.json({ chats: result.rows });
  } catch (error) {
    console.error('Get chats error:', error);
    res.status(500).json({ message: 'Ошибка при получении чатов' });
  }
};

// Получить или создать чат для заказа
export const getOrCreateChat = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const userId = req.userId;

    // Проверяем заказ
    const orderResult = await pool.query(
      'SELECT customer_id, assigned_master_id FROM orders WHERE id = $1',
      [orderId]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ message: 'Заказ не найден' });
    }

    const order = orderResult.rows[0];

    // Проверяем права доступа
    if (userId !== order.customer_id && userId !== order.assigned_master_id) {
      return res.status(403).json({ message: 'Нет доступа к этому чату' });
    }

    // Проверяем, есть ли уже чат
    let chatResult = await pool.query(
      'SELECT * FROM chats WHERE order_id = $1',
      [orderId]
    );

    if (chatResult.rows.length === 0) {
      // Создаем новый чат
      chatResult = await pool.query(
        `INSERT INTO chats (order_id, customer_id, master_id)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [orderId, order.customer_id, order.assigned_master_id]
      );
    }

    res.json({ chat: chatResult.rows[0] });
  } catch (error) {
    console.error('Get/create chat error:', error);
    res.status(500).json({ message: 'Ошибка при получении чата' });
  }
};

// Получить сообщения чата
export const getChatMessages = async (req: Request, res: Response) => {
  try {
    const { chatId } = req.params;
    const userId = req.userId;

    // Проверяем доступ к чату
    const chatCheck = await pool.query(
      'SELECT * FROM chats WHERE id = $1 AND (customer_id = $2 OR master_id = $2)',
      [chatId, userId]
    );

    if (chatCheck.rows.length === 0) {
      return res.status(403).json({ message: 'Нет доступа к этому чату' });
    }

    // Получаем сообщения
    const result = await pool.query(
      `SELECT 
        cm.*,
        u.name as sender_name,
        u.profile_photo as sender_photo
       FROM chat_messages cm
       JOIN users u ON cm.sender_id = u.id
       WHERE cm.chat_id = $1
       ORDER BY cm.created_at ASC`,
      [chatId]
    );

    res.json({ messages: result.rows });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Ошибка при получении сообщений' });
  }
};

// Отметить сообщения как прочитанные
export const markMessagesAsRead = async (req: Request, res: Response) => {
  try {
    const { chatId } = req.params;
    const userId = req.userId;

    // Проверяем доступ к чату
    const chatCheck = await pool.query(
      'SELECT * FROM chats WHERE id = $1 AND (customer_id = $2 OR master_id = $2)',
      [chatId, userId]
    );

    if (chatCheck.rows.length === 0) {
      return res.status(403).json({ message: 'Нет доступа к этому чату' });
    }

    // Отмечаем сообщения как прочитанные
    await pool.query(
      'UPDATE chat_messages SET is_read = true WHERE chat_id = $1 AND sender_id != $2 AND is_read = false',
      [chatId, userId]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Mark messages as read error:', error);
    res.status(500).json({ message: 'Ошибка при отметке сообщений' });
  }
};

// Отправить сообщение
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { chatId } = req.params;
    const { message } = req.body;
    const userId = req.userId;

    // Проверяем доступ к чату
    const chatCheck = await pool.query(
      'SELECT * FROM chats WHERE id = $1 AND (customer_id = $2 OR master_id = $2)',
      [chatId, userId]
    );

    if (chatCheck.rows.length === 0) {
      return res.status(403).json({ message: 'Нет доступа к этому чату' });
    }

    // Создаем сообщение
    const result = await pool.query(
      `INSERT INTO chat_messages (chat_id, sender_id, message)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [chatId, userId, message]
    );

    // Обновляем время обновления чата
    await pool.query(
      'UPDATE chats SET updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [chatId]
    );

    res.status(201).json({ message: result.rows[0] });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Ошибка при отправке сообщения' });
  }
};

// Отправить работу на оценку (для мастера)
export const submitForReview = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const masterId = req.userId;

    // Проверяем, что заказ принадлежит мастеру
    const orderCheck = await pool.query(
      'SELECT * FROM orders WHERE id = $1 AND assigned_master_id = $2 AND status = $3',
      [orderId, masterId, 'in_progress']
    );

    if (orderCheck.rows.length === 0) {
      return res.status(403).json({ message: 'Нет доступа к этому заказу или заказ не в работе' });
    }

    // Обновляем статус заказа
    await pool.query(
      'UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      ['review', orderId]
    );

    res.json({ message: 'Работа отправлена на оценку' });
  } catch (error) {
    console.error('Submit for review error:', error);
    res.status(500).json({ message: 'Ошибка при отправке на оценку' });
  }
};

// Принять работу (для клиента)
export const acceptWork = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const customerId = req.userId;
    const { rating, review } = req.body;

    // Проверяем заказ
    const orderResult = await pool.query(
      'SELECT * FROM orders WHERE id = $1 AND customer_id = $2 AND status = $3',
      [orderId, customerId, 'review']
    );

    if (orderResult.rows.length === 0) {
      return res.status(403).json({ message: 'Нет доступа к этому заказу или работа еще не отправлена на оценку' });
    }

    const order = orderResult.rows[0];

    // Обновляем статус заказа
    await pool.query(
      'UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      ['completed', orderId]
    );

    // Создаем транзакцию для мастера
    await pool.query(
      `INSERT INTO transactions (master_id, order_id, amount, type, status, description)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        order.assigned_master_id,
        orderId,
        order.final_price,
        'order_payment',
        'completed',
        `Оплата за выполнение заказа "${order.title}"`
      ]
    );

    // Обновляем баланс мастера
    await pool.query(
      'UPDATE users SET balance = balance + $1 WHERE id = $2',
      [order.final_price, order.assigned_master_id]
    );

    // Если есть отзыв, сохраняем его
    if (rating || review) {
      await pool.query(
        `INSERT INTO reviews (order_id, customer_id, master_id, rating, comment)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (order_id) DO UPDATE SET
         rating = EXCLUDED.rating,
         comment = EXCLUDED.comment,
         updated_at = CURRENT_TIMESTAMP`,
        [orderId, customerId, order.assigned_master_id, rating, review]
      );

      // Обновляем средний рейтинг и количество отзывов мастера
      const statsResult = await pool.query(
        `SELECT 
          COUNT(*) as reviews_count,
          COALESCE(AVG(rating), 0) as avg_rating
         FROM reviews 
         WHERE master_id = $1`,
        [order.assigned_master_id]
      );

      const stats = statsResult.rows[0];

      // Обновляем профиль мастера
      await pool.query(
        `INSERT INTO master_profiles (user_id, rating, reviews_count)
         VALUES ($1, $2, $3)
         ON CONFLICT (user_id) DO UPDATE SET
         rating = EXCLUDED.rating,
         reviews_count = EXCLUDED.reviews_count,
         updated_at = CURRENT_TIMESTAMP`,
        [order.assigned_master_id, parseFloat(stats.avg_rating).toFixed(2), parseInt(stats.reviews_count)]
      );
    }

    // Обновляем счетчик выполненных заказов
    await pool.query(
      `INSERT INTO master_profiles (user_id, completed_orders)
       VALUES ($1, 1)
       ON CONFLICT (user_id) DO UPDATE SET
       completed_orders = master_profiles.completed_orders + 1,
       updated_at = CURRENT_TIMESTAMP`,
      [order.assigned_master_id]
    );

    res.json({ 
      message: 'Работа принята, средства начислены мастеру',
      order: orderResult.rows[0]
    });
  } catch (error) {
    console.error('Accept work error:', error);
    res.status(500).json({ message: 'Ошибка при принятии работы' });
  }
};

// Получить акт выполненных работ
export const getWorkAct = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const userId = req.userId;

    // Получаем данные заказа
    const result = await pool.query(
      `SELECT 
        o.*,
        customer.name as customer_name,
        customer.email as customer_email,
        customer.phone as customer_phone,
        customer.address as customer_address,
        master.name as master_name,
        master.email as master_email,
        master.phone as master_phone
       FROM orders o
       JOIN users customer ON o.customer_id = customer.id
       JOIN users master ON o.assigned_master_id = master.id
       WHERE o.id = $1 AND o.status = 'completed' 
       AND (o.customer_id = $2 OR o.assigned_master_id = $2)`,
      [orderId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Заказ не найден или еще не завершен' });
    }

    res.json({ act: result.rows[0] });
  } catch (error) {
    console.error('Get work act error:', error);
    res.status(500).json({ message: 'Ошибка при получении акта' });
  }
};

// Получить отзывы мастера
export const getMasterReviews = async (req: Request, res: Response) => {
  try {
    const masterId = req.userId;

    // Получаем статистику
    const statsResult = await pool.query(
      `SELECT 
        COUNT(*) as total_reviews,
        COALESCE(AVG(rating), 0) as average_rating,
        COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star,
        COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star,
        COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star,
        COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star,
        COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star
       FROM reviews 
       WHERE master_id = $1`,
      [masterId]
    );

    // Получаем все отзывы с деталями заказа и клиента
    const reviewsResult = await pool.query(
      `SELECT 
        r.*,
        o.title as order_title,
        o.category as order_category,
        o.final_price as order_price,
        u.name as customer_name,
        u.profile_photo as customer_photo
       FROM reviews r
       JOIN orders o ON r.order_id = o.id
       JOIN users u ON r.customer_id = u.id
       WHERE r.master_id = $1
       ORDER BY r.created_at DESC`,
      [masterId]
    );

    res.json({ 
      stats: statsResult.rows[0],
      reviews: reviewsResult.rows 
    });
  } catch (error) {
    console.error('Get master reviews error:', error);
    res.status(500).json({ message: 'Ошибка при получении отзывов' });
  }
};

export const acceptChatRules = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { chatId } = req.body;

    if (!chatId) {
      return res.status(400).json({ message: 'ID чата обязателен' });
    }

    // Проверяем, что пользователь является участником чата
    const chatResult = await pool.query(
      'SELECT customer_id, master_id, customer_accepted_rules, master_accepted_rules FROM chats WHERE id = $1',
      [chatId]
    );

    if (chatResult.rows.length === 0) {
      return res.status(404).json({ message: 'Чат не найден' });
    }

    const chat = chatResult.rows[0];
    const isCustomer = chat.customer_id === userId;
    const isMaster = chat.master_id === userId;

    if (!isCustomer && !isMaster) {
      return res.status(403).json({ message: 'Вы не являетесь участником этого чата' });
    }

    // Обновляем статус принятия правил
    const field = isCustomer ? 'customer_accepted_rules' : 'master_accepted_rules';
    await pool.query(
      `UPDATE chats SET ${field} = TRUE WHERE id = $1`,
      [chatId]
    );

    // Получаем обновленный статус
    const updatedChat = await pool.query(
      'SELECT customer_accepted_rules, master_accepted_rules FROM chats WHERE id = $1',
      [chatId]
    );

    res.json({ 
      message: 'Правила приняты',
      chat: updatedChat.rows[0]
    });
  } catch (error) {
    console.error('Accept chat rules error:', error);
    res.status(500).json({ message: 'Ошибка при принятии правил' });
  }
};
