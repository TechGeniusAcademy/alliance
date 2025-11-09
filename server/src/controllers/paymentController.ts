import { Request, Response } from 'express';
import Stripe from 'stripe';
import pool from '../config/database';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
});

// Создание платежного намерения (Payment Intent)
export const createPaymentIntent = async (req: Request, res: Response) => {
  try {
    const { orderId, bidId } = req.body;
    const userId = (req as any).user.id;

    console.log('Creating payment intent for order:', orderId, 'bid:', bidId, 'user:', userId);

    // Получаем информацию о заказе и заявке
    let query, params;
    
    if (bidId) {
      // Если передан bidId, используем конкретную заявку
      query = `SELECT o.*, ob.proposed_price as price_offered, u.name as master_name
               FROM orders o
               JOIN order_bids ob ON o.id = ob.order_id AND ob.id = $3
               JOIN users u ON ob.master_id = u.id
               WHERE o.id = $1 AND o.customer_id = $2`;
      params = [orderId, userId, bidId];
    } else {
      // Если bidId не передан, ищем уже принятую заявку (старая логика)
      query = `SELECT o.*, ob.proposed_price as price_offered, u.name as master_name
               FROM orders o
               JOIN order_bids ob ON o.id = ob.order_id AND ob.status = 'accepted'
               JOIN users u ON ob.master_id = u.id
               WHERE o.id = $1 AND o.customer_id = $2`;
      params = [orderId, userId];
    }

    const orderResult = await pool.query(query, params);

    console.log('Order query result:', orderResult.rows.length, 'rows');

    if (orderResult.rows.length === 0) {
      console.log('No order found or bid not found');
      return res.status(404).json({ error: 'Заказ или заявка не найдены' });
    }

    const order = orderResult.rows[0];
    console.log('Order details:', { id: order.id, price: order.price_offered, title: order.title });
    
    // Конвертируем цену в число (она может быть строкой из БД)
    const priceNumber = typeof order.price_offered === 'string' 
      ? parseFloat(order.price_offered) 
      : order.price_offered;
    
    if (isNaN(priceNumber) || priceNumber <= 0) {
      console.log('Invalid price:', priceNumber);
      return res.status(400).json({ error: 'Некорректная цена заказа' });
    }
    
    // Stripe требует минимум 50 центов ($0.50)
    // Для KZT это примерно 200-250 тенге
    // Установим минимум в 100 тенге для тестирования
    const minAmount = 100;
    if (priceNumber < minAmount) {
      console.log('Amount too small:', priceNumber, 'KZT. Minimum:', minAmount, 'KZT');
      return res.status(400).json({ 
        error: `Минимальная сумма для оплаты через Stripe: ${minAmount} ₸. Текущая сумма: ${priceNumber} ₸` 
      });
    }
    
    const amount = Math.round(priceNumber * 100); // Stripe использует центы (тиын)

    console.log('Creating Stripe payment intent with amount:', amount, 'tiyns (', priceNumber, 'KZT)');

    // Создаем Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'kzt', // Казахстанский тенге
      metadata: {
        orderId: order.id,
        customerId: userId,
        masterName: order.master_name,
        orderTitle: order.title,
        ...(bidId && { bidId: bidId.toString() }),
      },
      description: `Оплата заказа: ${order.title}`,
    });

    console.log('Payment intent created successfully:', paymentIntent.id);

    res.json({
      clientSecret: paymentIntent.client_secret,
      amount: priceNumber,
      orderTitle: order.title,
    });
  } catch (error: any) {
    console.error('Error creating payment intent:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: error.message || 'Ошибка создания платежа',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Подтверждение платежа и обновление заказа
export const confirmPayment = async (req: Request, res: Response) => {
  try {
    const { paymentIntentId, orderId, bidId } = req.body;
    const userId = (req as any).user.id;

    console.log('Confirming payment for order:', orderId, 'bid:', bidId, 'user:', userId);

    // Проверяем статус платежа в Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ error: 'Платеж не завершен' });
    }

    console.log('Payment succeeded in Stripe:', paymentIntent.id);

    // Начинаем транзакцию в БД
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // 1. Если передан bidId, принимаем заявку
      if (bidId) {
        console.log('Accepting bid:', bidId);
        
        // Отклоняем все остальные заявки на этот заказ
        await client.query(
          `UPDATE order_bids 
           SET status = 'rejected', updated_at = NOW()
           WHERE order_id = $1 AND id != $2 AND status = 'pending'`,
          [orderId, bidId]
        );

        // Принимаем выбранную заявку
        await client.query(
          `UPDATE order_bids 
           SET status = 'accepted', updated_at = NOW()
           WHERE id = $1`,
          [bidId]
        );

        console.log('Bid accepted successfully');
      }

      // 2. Получаем master_id из принятой заявки
      const masterResult = await client.query(
        `SELECT ob.master_id 
         FROM order_bids ob 
         WHERE ob.order_id = $1 AND ob.status = 'accepted'`,
        [orderId]
      );

      if (masterResult.rows.length === 0) {
        throw new Error('Принятая заявка не найдена');
      }

      const masterId = masterResult.rows[0].master_id;
      console.log('Master ID:', masterId);

      // 3. Обновляем статус заказа
      const updateResult = await client.query(
        `UPDATE orders 
         SET status = 'in_progress', 
             final_price = $1,
             updated_at = NOW()
         WHERE id = $2 AND customer_id = $3
         RETURNING *`,
        [paymentIntent.amount / 100, orderId, userId]
      );

      if (updateResult.rows.length === 0) {
        throw new Error('Заказ не найден или у вас нет прав на его изменение');
      }

      console.log('Order status updated to in_progress');

      // 4. Создаем запись о транзакции
      await client.query(
        `INSERT INTO transactions 
         (order_id, master_id, amount, type, status, payment_method, stripe_payment_intent_id, created_at)
         VALUES ($1, $2, $3, 'payment', 'completed', 'stripe', $4, NOW())`,
        [orderId, masterId, paymentIntent.amount / 100, paymentIntentId]
      );

      console.log('Transaction record created');

      // 5. Обновляем баланс клиента (уменьшаем)
      await client.query(
        `UPDATE users 
         SET balance = balance - $1
         WHERE id = $2`,
        [paymentIntent.amount / 100, userId]
      );

      console.log('Customer balance updated');

      // 6. Увеличиваем баланс мастера (за вычетом комиссии 10%)
      const masterAmount = (paymentIntent.amount / 100) * 0.9;
      await client.query(
        `UPDATE users 
         SET balance = balance + $1
         WHERE id = $2`,
        [masterAmount, masterId]
      );

      console.log('Master balance updated');

      await client.query('COMMIT');
      console.log('Payment confirmation completed successfully');

      res.json({
        success: true,
        order: updateResult.rows[0],
        message: 'Платеж успешно обработан, заказ принят в работу',
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Error confirming payment:', error);
    res.status(500).json({ error: error.message || 'Ошибка подтверждения платежа' });
  }
};

// Получение публичного ключа
export const getPublishableKey = async (req: Request, res: Response) => {
  res.json({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  });
};

// Webhook для обработки событий Stripe
export const handleStripeWebhook = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return res.status(400).send('Webhook secret not configured');
  }

  try {
    const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);

    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('Payment succeeded:', paymentIntent.id);
        // Дополнительная логика при успешной оплате
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent;
        console.log('Payment failed:', failedPayment.id);
        // Логика при неудачной оплате
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
};
