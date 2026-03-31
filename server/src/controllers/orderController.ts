import { Request, Response } from 'express';
import pool from '../config/database';
import { commissionService } from '../services/commissionService';
import whatsappService from '../services/whatsappService';
import { createNotification } from './notificationsController';

// Создать новый заказ
export const createOrder = async (req: Request, res: Response) => {
  try {
    const customerId = req.userId;
    const {
      title,
      description,
      category,
      furniture_type,
      style,
      materials,
      dimensions,
      budget_min,
      budget_max,
      deadline,
      delivery_address,
      delivery_required,
      assembly_required,
      photos,
      furniture_config,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO orders (
        customer_id, title, description, category, furniture_type,
        style, materials, dimensions, budget_min, budget_max,
        deadline, delivery_address, delivery_required, assembly_required,
        photos, furniture_config, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, 'auction')
      RETURNING *`,
      [
        customerId, 
        title, 
        description, 
        category, 
        furniture_type,
        style, 
        materials ? JSON.stringify(materials) : null, 
        dimensions ? JSON.stringify(dimensions) : null, 
        budget_min, 
        budget_max,
        deadline, 
        delivery_address, 
        delivery_required, 
        assembly_required,
        photos ? JSON.stringify(photos) : null, 
        furniture_config ? JSON.stringify(furniture_config) : null,
      ]
    );

    const newOrder = result.rows[0];

    // Отправляем уведомления всем мастерам через WhatsApp
    try {
      console.log('📱 Отправка WhatsApp уведомлений мастерам о новом заказе...');
      
      // Получаем всех активных мастеров с номерами телефонов
      const mastersResult = await pool.query(
        `SELECT u.id, u.phone, u.name 
         FROM users u
         WHERE u.role = 'master' 
         AND u.active = true 
         AND u.phone IS NOT NULL 
         AND u.phone != ''`
      );

      const masters = mastersResult.rows;
      console.log(`Найдено ${masters.length} мастеров для уведомления`);

      // Формируем данные заказа для уведомления
      const orderData = {
        id: newOrder.id,
        title: newOrder.title,
        category: newOrder.category,
        description: newOrder.description,
        budgetMin: parseFloat(newOrder.budget_min),
        budgetMax: newOrder.budget_max ? parseFloat(newOrder.budget_max) : null,
        deadline: newOrder.deadline,
        deliveryAddress: newOrder.delivery_address
      };

      // Отправляем уведомления асинхронно (не блокируя ответ)
      if (masters.length > 0) {
        const notifications = masters.map(master => ({
          phone: master.phone,
          orderData
        }));

        // Запускаем отправку в фоне
        whatsappService.sendBulkNotifications(notifications, 2000)
          .then(result => {
            console.log(`✅ WhatsApp рассылка завершена: успешно ${result.success}, ошибок ${result.failed}`);
          })
          .catch(err => {
            console.error('❌ Ошибка WhatsApp рассылки:', err);
          });
      }
    } catch (whatsappError) {
      // Логируем ошибку, но не прерываем создание заказа
      console.error(' Ошибка отправки WhatsApp уведомлений:', whatsappError);
    }

    res.status(201).json({
      message: 'Заказ успешно создан',
      order: newOrder,
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Ошибка при создании заказа' });
  }
};

// Получить все заказы клиента
export const getCustomerOrders = async (req: Request, res: Response) => {
  try {
    const customerId = req.userId;

    const result = await pool.query(
      `SELECT 
        o.*,
        u.name as assigned_master_name,
        u.profile_photo as assigned_master_photo,
        (SELECT COUNT(*) FROM order_bids WHERE order_id = o.id) as bids_count
       FROM orders o
       LEFT JOIN users u ON o.assigned_master_id = u.id
       WHERE o.customer_id = $1
       ORDER BY o.created_at DESC`,
      [customerId]
    );

    // Отладка: проверяем каждый заказ
    console.log('🔍 CUSTOMER ORDERS DEBUG:');
    result.rows.forEach(order => {
      if (parseInt(order.bids_count) > 0) {
        console.log(`   Order #${order.id} (${order.title}): bids_count = ${order.bids_count}`);
      }
    });

    res.json({ orders: result.rows });
  } catch (error) {
    console.error('Get customer orders error:', error);
    res.status(500).json({ message: 'Ошибка при получении заказов' });
  }
};

// Получить все заказы в аукционе (для мастеров)
export const getAuctionOrders = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT 
        o.*,
        u.name as customer_name,
        u.address as customer_address,
        (SELECT COUNT(*) FROM order_bids WHERE order_id = o.id) as bids_count
       FROM orders o
       JOIN users u ON o.customer_id = u.id
       WHERE o.status = 'auction'
       ORDER BY o.created_at DESC`
    );

    res.json({ orders: result.rows });
  } catch (error) {
    console.error('Get auction orders error:', error);
    res.status(500).json({ message: 'Ошибка при получении заказов аукциона' });
  }
};

// Получить детали заказа
export const getOrderById = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const userId = req.userId;

    const result = await pool.query(
      `SELECT 
        o.*,
        c.name as customer_name,
        c.email as customer_email,
        c.phone as customer_phone,
        c.address as customer_address,
        m.name as assigned_master_name,
        m.profile_photo as assigned_master_photo,
        (SELECT COUNT(*) FROM order_bids WHERE order_id = o.id) as bids_count
       FROM orders o
       JOIN users c ON o.customer_id = c.id
       LEFT JOIN users m ON o.assigned_master_id = m.id
       WHERE o.id = $1`,
      [orderId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Заказ не найден' });
    }

    const order = result.rows[0];

    // Проверяем права доступа
    if (order.customer_id !== userId && order.status !== 'auction') {
      return res.status(403).json({ message: 'Нет доступа к этому заказу' });
    }

    res.json({ order });
  } catch (error) {
    console.error('Get order by id error:', error);
    res.status(500).json({ message: 'Ошибка при получении заказа' });
  }
};

// Обновить заказ
export const updateOrder = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const customerId = req.userId;
    const {
      title,
      description,
      category,
      furniture_type,
      style,
      materials,
      dimensions,
      budget_min,
      budget_max,
      deadline,
      delivery_address,
      delivery_required,
      assembly_required,
      photos,
    } = req.body;

    // Проверяем, что заказ принадлежит клиенту
    const checkResult = await pool.query(
      'SELECT id FROM orders WHERE id = $1 AND customer_id = $2',
      [orderId, customerId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(403).json({ message: 'Нет доступа к этому заказу' });
    }

    const result = await pool.query(
      `UPDATE orders SET
        title = $1, description = $2, category = $3, furniture_type = $4,
        style = $5, materials = $6, dimensions = $7, budget_min = $8,
        budget_max = $9, deadline = $10, delivery_address = $11,
        delivery_required = $12, assembly_required = $13, photos = $14,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $15 AND customer_id = $16
       RETURNING *`,
      [
        title, description, category, furniture_type,
        style, materials, dimensions, budget_min,
        budget_max, deadline, delivery_address,
        delivery_required, assembly_required, photos,
        orderId, customerId,
      ]
    );

    res.json({
      message: 'Заказ успешно обновлен',
      order: result.rows[0],
    });
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ message: 'Ошибка при обновлении заказа' });
  }
};

// Удалить заказ
export const deleteOrder = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const customerId = req.userId;

    const result = await pool.query(
      'DELETE FROM orders WHERE id = $1 AND customer_id = $2 RETURNING id',
      [orderId, customerId]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ message: 'Нет доступа к этому заказу' });
    }

    res.json({ message: 'Заказ успешно удален' });
  } catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({ message: 'Ошибка при удалении заказа' });
  }
};

// Получить ставки на заказ
export const getOrderBids = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const userId = req.userId;

    // Проверяем, что заказ принадлежит клиенту
    const orderCheck = await pool.query(
      'SELECT customer_id FROM orders WHERE id = $1',
      [orderId]
    );

    if (orderCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Заказ не найден' });
    }

    if (orderCheck.rows[0].customer_id !== userId) {
      return res.status(403).json({ message: 'Нет доступа к ставкам этого заказа' });
    }

    const result = await pool.query(
      `SELECT 
        ob.*,
        u.name as master_name,
        u.profile_photo as master_photo,
        u.address as master_address,
        mp.rating,
        mp.reviews_count,
        mp.completed_orders
       FROM order_bids ob
       JOIN users u ON ob.master_id = u.id
       LEFT JOIN master_profiles mp ON mp.user_id = u.id
       WHERE ob.order_id = $1
       ORDER BY ob.proposed_price ASC`,
      [orderId]
    );

    console.log('🔍 ORDER BIDS DEBUG:');
    console.log(`   Order #${orderId}: Found ${result.rows.length} bids`);
    if (result.rows.length > 0) {
      result.rows.forEach((bid, index) => {
        console.log(`   Bid ${index + 1}: master_id=${bid.master_id}, master_name="${bid.master_name}", price=${bid.proposed_price}, status=${bid.status}`);
      });
    }

    console.log('Bids with master data:', JSON.stringify(result.rows, null, 2));
    res.json({ bids: result.rows });
  } catch (error) {
    console.error('Get order bids error:', error);
    res.status(500).json({ message: 'Ошибка при получении ставок' });
  }
};

// Принять ставку и назначить мастера
export const acceptBid = async (req: Request, res: Response) => {
  const client = await pool.connect();
  
  try {
    const { bidId } = req.params;
    const customerId = req.userId;

    await client.query('BEGIN');

    // Получаем информацию о ставке
    const bidResult = await client.query(
      `SELECT ob.*, o.customer_id, o.id as order_id, o.title as order_title
       FROM order_bids ob
       JOIN orders o ON ob.order_id = o.id
       WHERE ob.id = $1`,
      [bidId]
    );

    if (bidResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Ставка не найдена' });
    }

    const bid = bidResult.rows[0];

    if (bid.customer_id !== customerId) {
      await client.query('ROLLBACK');
      return res.status(403).json({ message: 'Нет доступа к этому заказу' });
    }

    // ПРОВЕРКА 1: Проверяем, нет ли у мастера неоплаченных комиссий
    const unpaidCommissionsCheck = await client.query(
      `SELECT COUNT(*) as unpaid_count
       FROM commission_transactions
       WHERE master_id = $1 AND status = 'pending'`,
      [bid.master_id]
    );

    if (parseInt(unpaidCommissionsCheck.rows[0].unpaid_count) > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        message: 'У вас есть неоплаченные комиссии. Пополните кошелек и оплатите долг перед принятием нового заказа.',
        error: 'UNPAID_COMMISSIONS'
      });
    }

    // ПРОВЕРКА 2: Вычисляем комиссию и проверяем баланс кошелька
    const commissionCalc = await commissionService.calculateCommission(
      bid.master_id,
      bid.proposed_price
    );

    const requiredCommission = commissionCalc.amount;

    // Получаем текущий баланс кошелька мастера
    const walletResult = await client.query(
      `SELECT wallet_balance FROM master_profiles WHERE user_id = $1`,
      [bid.master_id]
    );

    const walletBalance = parseFloat(walletResult.rows[0]?.wallet_balance || 0);
    const hasEnoughBalance = walletBalance >= requiredCommission;

    console.log(`ℹ️ Комиссия: ${requiredCommission}₸, Баланс: ${walletBalance}₸, Достаточно: ${hasEnoughBalance}`);

    // Обновляем заказ
    await client.query(
      `UPDATE orders SET
        status = 'in_progress',
        assigned_master_id = $1,
        final_price = $2,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $3`,
      [bid.master_id, bid.proposed_price, bid.order_id]
    );

    // Обновляем статус принятой ставки
    await client.query(
      'UPDATE order_bids SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      ['accepted', bidId]
    );

    // Отклоняем остальные ставки
    await client.query(
      'UPDATE order_bids SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE order_id = $2 AND id != $3',
      ['rejected', bid.order_id, bidId]
    );

    // Создаем чат между клиентом и мастером (или получаем существующий)
    console.log('🔍 CREATING CHAT - order_id:', bid.order_id, 'customer_id:', bid.customer_id, 'master_id:', bid.master_id);
    let chatResult = await client.query(
      `INSERT INTO chats (order_id, customer_id, master_id)
       VALUES ($1, $2, $3)
       ON CONFLICT (order_id) DO UPDATE SET order_id = EXCLUDED.order_id
       RETURNING id`,
      [bid.order_id, bid.customer_id, bid.master_id]
    );
    console.log('🔍 INSERT chatResult.rows:', chatResult.rows);
    
    // Если чат не был создан (уже существует), получаем его
    if (chatResult.rows.length === 0) {
      console.log('🔍 CHAT NOT RETURNED FROM INSERT, trying SELECT...');
      chatResult = await client.query(
        `SELECT id FROM chats WHERE order_id = $1`,
        [bid.order_id]
      );
      console.log('🔍 SELECT chatResult.rows:', chatResult.rows);
    }

    const chatId = chatResult.rows[0]?.id;
    console.log(`💬 Чат ${chatId ? 'создан/получен' : 'НЕ НАЙДЕН'} для заказа #${bid.order_id}, chatId: ${chatId}`);

    // Создаем транзакцию комиссии
    const commissionResult = await client.query(
      `INSERT INTO commission_transactions 
       (master_id, order_id, commission_type, commission_rate, order_amount, commission_amount, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [
        bid.master_id,
        bid.order_id,
        commissionCalc.type,
        commissionCalc.rate || null,
        bid.proposed_price,
        requiredCommission,
        hasEnoughBalance ? 'paid' : 'pending'  // Если денег достаточно - сразу 'paid', иначе 'pending'
      ]
    );

    const commissionId = commissionResult.rows[0].id;

    // Если у мастера достаточно денег на кошельке - автоматически списываем комиссию
    if (hasEnoughBalance) {
      // 1. Списываем с баланса кошелька
      await client.query(
        `UPDATE master_profiles 
         SET wallet_balance = wallet_balance - $1
         WHERE user_id = $2`,
        [requiredCommission, bid.master_id]
      );

      // 2. Создаем транзакцию в wallet_transactions
      await client.query(
        `INSERT INTO wallet_transactions 
         (master_id, amount, type, status, order_id, description, created_at, updated_at)
         VALUES ($1, $2, 'commission_payment', 'completed', $3, $4, NOW(), NOW())`,
        [
          bid.master_id,
          requiredCommission,
          bid.order_id,
          `Автоматическая оплата комиссии за заказ #${bid.order_id}`
        ]
      );

      // 3. Обновляем статус комиссии на 'paid' и дату оплаты
      await client.query(
        `UPDATE commission_transactions 
         SET paid_at = NOW()
         WHERE id = $1`,
        [commissionId]
      );

      console.log(`✓ Комиссия ${requiredCommission}₸ автоматически списана с кошелька мастера`);
    }

    await client.query('COMMIT');

    // Создаем уведомления для мастера и клиента
    await createNotification(
      bid.master_id,
      'success',
      '🎉 Ваша заявка принята!',
      `Клиент ${bid.customer_name || 'заказчик'} принял вашу заявку на заказ "${bid.order_title}". Сумма: ${bid.bid_price}₸`,
      `/master-dashboard/active-orders`
    );

    await createNotification(
      bid.customer_id,
      'info',
      '✅ Заявка принята',
      `Вы приняли заявку от мастера ${bid.master_name || 'мастера'} на заказ "${bid.order_title}". Сумма: ${bid.bid_price}₸`,
      `/dashboard/active-orders`
    );

    const responseMessage = hasEnoughBalance 
      ? `Ставка принята! Комиссия ${requiredCommission}₸ списана с вашего кошелька.`
      : `Ставка принята! Комиссия ${requiredCommission}₸ добавлена в долг. Пополните кошелек для оплаты.`;

    const responseData = { 
      message: responseMessage,
      chatId: chatId,
      commissionAmount: requiredCommission,
      commissionId: commissionId,
      commissionPaid: hasEnoughBalance
    };
    console.log('🔍 SENDING RESPONSE:', responseData);
    res.json(responseData);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Accept bid error:', error);
    res.status(500).json({ message: 'Ошибка при принятии ставки' });
  } finally {
    client.release();
  }
};

// Отметить заказ как отправленный (мастер)
export const markAsShipped = async (req: Request, res: Response) => {
  try {
    const masterId = req.userId;
    const { orderId } = req.params;
    const { trackingNumber, deliveryNotes } = req.body;

    // Проверяем что заказ принадлежит этому мастеру
    const orderCheck = await pool.query(
      'SELECT * FROM orders WHERE id = $1 AND assigned_master_id = $2',
      [orderId, masterId]
    );

    if (orderCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Заказ не найден или вы не являетесь исполнителем' });
    }

    const order = orderCheck.rows[0];

    if (order.status !== 'in_progress') {
      return res.status(400).json({ message: 'Заказ должен быть в статусе "В работе"' });
    }

    // Обновляем статус доставки
    await pool.query(
      `UPDATE orders SET
        delivery_status = 'shipped',
        shipped_at = CURRENT_TIMESTAMP,
        tracking_number = $1,
        delivery_notes = $2,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $3`,
      [trackingNumber, deliveryNotes, orderId]
    );

    res.json({ message: 'Заказ отмечен как отправленный' });
  } catch (error) {
    console.error('Mark as shipped error:', error);
    res.status(500).json({ message: 'Ошибка при обновлении статуса доставки' });
  }
};

// Подтвердить получение заказа (клиент)
export const confirmDelivery = async (req: Request, res: Response) => {
  try {
    const customerId = req.userId;
    const { orderId } = req.params;

    // Проверяем что заказ принадлежит этому клиенту
    const orderCheck = await pool.query(
      'SELECT * FROM orders WHERE id = $1 AND customer_id = $2',
      [orderId, customerId]
    );

    if (orderCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Заказ не найден' });
    }

    const order = orderCheck.rows[0];

    if (order.delivery_status !== 'shipped') {
      return res.status(400).json({ message: 'Заказ должен быть в статусе "Отправлен"' });
    }

    // Обновляем статус
    await pool.query(
      `UPDATE orders SET
        delivery_status = 'delivered',
        delivered_at = CURRENT_TIMESTAMP,
        status = 'completed',
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [orderId]
    );

    // Обновляем счетчик completed_orders у мастера
    await pool.query(
      `INSERT INTO master_profiles (user_id, completed_orders)
       VALUES ($1, 1)
       ON CONFLICT (user_id) DO UPDATE SET
       completed_orders = master_profiles.completed_orders + 1,
       updated_at = CURRENT_TIMESTAMP`,
      [order.assigned_master_id]
    );

    res.json({ message: 'Доставка подтверждена, заказ завершен' });
  } catch (error) {
    console.error('Confirm delivery error:', error);
    res.status(500).json({ message: 'Ошибка при подтверждении доставки' });
  }
};

// Получить информацию о доставке заказа
export const getOrderDelivery = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { orderId } = req.params;

    // Проверяем доступ (клиент или мастер этого заказа)
    const orderCheck = await pool.query(
      `SELECT o.*, 
        u_customer.name as customer_name, 
        u_customer.phone as customer_phone,
        u_master.name as master_name,
        u_master.phone as master_phone
       FROM orders o
       JOIN users u_customer ON o.customer_id = u_customer.id
       LEFT JOIN users u_master ON o.assigned_master_id = u_master.id
       WHERE o.id = $1 AND (o.customer_id = $2 OR o.assigned_master_id = $2)`,
      [orderId, userId]
    );

    if (orderCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Заказ не найден' });
    }

    res.json({ delivery: orderCheck.rows[0] });
  } catch (error) {
    console.error('Get order delivery error:', error);
    res.status(500).json({ message: 'Ошибка при получении информации о доставке' });
  }
};

// GET active orders for master
export const getMasterActiveOrders = async (req: Request, res: Response) => {
  try {
    const masterId = req.userId;

    const result = await pool.query(
      `SELECT o.*, 
              u.name as customer_name,
              u.address as customer_address
       FROM orders o
       LEFT JOIN users u ON o.customer_id = u.id
       WHERE o.assigned_master_id = $1 
         AND o.status IN ('in_progress', 'review', 'shipped')
       ORDER BY o.created_at DESC`,
      [masterId]
    );

    res.json({ orders: result.rows });
  } catch (error) {
    console.error('Error fetching master active orders:', error);
    res.status(500).json({ error: 'Failed to fetch active orders' });
  }
};

// GET work stages for order
export const getOrderWorkStages = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const masterId = req.userId;

    // Check if master is assigned to this order
    const orderCheck = await pool.query(
      'SELECT id FROM orders WHERE id = $1 AND assigned_master_id = $2',
      [orderId, masterId]
    );

    if (orderCheck.rows.length === 0) {
      return res.status(403).json({ message: 'Доступ запрещен' });
    }

    // Get work stages
    const result = await pool.query(
      `SELECT * FROM order_work_stages 
       WHERE order_id = $1 
       ORDER BY stage_order ASC`,
      [orderId]
    );

    res.json({ stages: result.rows });
  } catch (error) {
    console.error('Error fetching work stages:', error);
    res.status(500).json({ error: 'Failed to fetch work stages' });
  }
};

// UPDATE work stage status
export const updateWorkStageStatus = async (req: Request, res: Response) => {
  try {
    const { orderId, stageId } = req.params;
    const { completed } = req.body;
    const masterId = req.userId;

    // Check if master is assigned to this order
    const orderCheck = await pool.query(
      `SELECT o.id, o.title, o.customer_id, u.phone, u.name as customer_name, m.name as master_name
       FROM orders o
       LEFT JOIN users u ON o.customer_id = u.id
       LEFT JOIN users m ON o.assigned_master_id = m.id
       WHERE o.id = $1 AND o.assigned_master_id = $2`,
      [orderId, masterId]
    );

    if (orderCheck.rows.length === 0) {
      return res.status(403).json({ message: 'Доступ запрещен' });
    }

    const order = orderCheck.rows[0];

    // Update stage status
    const updateResult = await pool.query(
      `UPDATE order_work_stages 
       SET completed = $1, completed_at = CASE WHEN $1 = true THEN CURRENT_TIMESTAMP ELSE NULL END
       WHERE id = $2 AND order_id = $3
       RETURNING *`,
      [completed, stageId, orderId]
    );

    if (updateResult.rows.length === 0) {
      return res.status(404).json({ message: 'Этап не найден' });
    }

    const stage = updateResult.rows[0];

    // Send WhatsApp notification to customer if stage is completed
    if (completed && order.phone) {
      try {
        await whatsappService.sendWorkStageNotification(order.phone, {
          id: order.id,
          title: order.title,
          stage: stage.stage_key,
          stageName: stage.stage_name,
          masterName: order.master_name || 'Мастер'
        });
      } catch (error) {
        console.error('WhatsApp notification error:', error);
      }
    }

    res.json({ stage: updateResult.rows[0], message: 'Статус этапа обновлен' });
  } catch (error) {
    console.error('Error updating work stage:', error);
    res.status(500).json({ error: 'Failed to update work stage' });
  }
};

// Initialize work stages for order
export const initializeWorkStages = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const masterId = req.userId;

    // Check if master is assigned to this order
    const orderCheck = await pool.query(
      'SELECT id FROM orders WHERE id = $1 AND assigned_master_id = $2',
      [orderId, masterId]
    );

    if (orderCheck.rows.length === 0) {
      return res.status(403).json({ message: 'Доступ запрещен' });
    }

    // Check if stages already exist
    const existingStages = await pool.query(
      'SELECT id FROM order_work_stages WHERE order_id = $1',
      [orderId]
    );

    if (existingStages.rows.length > 0) {
      return res.status(400).json({ message: 'Этапы уже созданы для этого заказа' });
    }

    // Create default stages
    const defaultStages = [
      { key: 'design', name: 'Проектирование', order: 1 },
      { key: 'materials', name: 'Закупка материалов', order: 2 },
      { key: 'production', name: 'Производство', order: 3 },
      { key: 'assembly', name: 'Сборка', order: 4 },
      { key: 'quality_check', name: 'Контроль качества', order: 5 },
      { key: 'packaging', name: 'Упаковка', order: 6 },
      { key: 'ready_for_delivery', name: 'Готово к отправке', order: 7 }
    ];

    const insertPromises = defaultStages.map(stage =>
      pool.query(
        `INSERT INTO order_work_stages (order_id, stage_key, stage_name, stage_order, completed)
         VALUES ($1, $2, $3, $4, false)
         RETURNING *`,
        [orderId, stage.key, stage.name, stage.order]
      )
    );

    const results = await Promise.all(insertPromises);
    const stages = results.map(r => r.rows[0]);

    res.json({ stages, message: 'Этапы работы инициализированы' });
  } catch (error) {
    console.error('Error initializing work stages:', error);
    res.status(500).json({ error: 'Failed to initialize work stages' });
  }
};

// Получить все аукционы для админа
export const getAllAuctionsForAdmin = async (req: Request, res: Response) => {
  try {
    const { status } = req.query;

    let statusFilter = '';
    if (status && status !== 'all') {
      statusFilter = `AND o.status = '${status}'`;
    } else {
      statusFilter = `AND o.status IN ('auction', 'pending', 'active', 'in_progress', 'completed', 'cancelled')`;
    }

    const result = await pool.query(
      `SELECT 
        o.*,
        u.name as customer_name,
        u.email as customer_email,
        u.phone as customer_phone,
        u.address as customer_address,
        m.name as assigned_master_name,
        m.email as assigned_master_email,
        m.phone as assigned_master_phone,
        (SELECT COUNT(*) FROM order_bids WHERE order_id = o.id) as bids_count,
        (SELECT COUNT(*) FROM order_bids WHERE order_id = o.id AND status = 'pending') as pending_bids_count,
        (SELECT AVG(proposed_price) FROM order_bids WHERE order_id = o.id) as avg_bid_price,
        (SELECT MIN(proposed_price) FROM order_bids WHERE order_id = o.id) as min_bid_price,
        (SELECT MAX(proposed_price) FROM order_bids WHERE order_id = o.id) as max_bid_price
       FROM orders o
       JOIN users u ON o.customer_id = u.id
       LEFT JOIN users m ON o.assigned_master_id = m.id
       WHERE 1=1 ${statusFilter}
       ORDER BY o.created_at DESC`
    );

    res.json({ auctions: result.rows });
  } catch (error) {
    console.error('Get all auctions for admin error:', error);
    res.status(500).json({ message: 'Ошибка при получении аукционов' });
  }
};
