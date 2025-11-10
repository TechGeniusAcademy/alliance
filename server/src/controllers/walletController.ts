import { Request, Response } from 'express';
import Stripe from 'stripe';
import { walletService } from '../services/walletService';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
});

// Получить баланс кошелька
export const getWalletBalance = async (req: Request, res: Response) => {
  try {
    const masterId = req.userId;

    if (!masterId) {
      return res.status(401).json({ message: 'Не авторизован' });
    }

    const balance = await walletService.getWalletBalance(masterId);

    res.json({ balance });
  } catch (error) {
    console.error('Error fetching wallet balance:', error);
    res.status(500).json({ message: 'Ошибка при получении баланса кошелька' });
  }
};

// Получить статистику кошелька
export const getWalletStats = async (req: Request, res: Response) => {
  try {
    const masterId = req.userId;

    if (!masterId) {
      return res.status(401).json({ message: 'Не авторизован' });
    }

    const stats = await walletService.getWalletStats(masterId);

    res.json(stats);
  } catch (error) {
    console.error('Error fetching wallet stats:', error);
    res.status(500).json({ message: 'Ошибка при получении статистики кошелька' });
  }
};

// Пополнить кошелек
export const depositToWallet = async (req: Request, res: Response) => {
  try {
    const masterId = req.userId;
    const { amount, paymentMethod, paymentDetails } = req.body;

    if (!masterId) {
      return res.status(401).json({ message: 'Не авторизован' });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Некорректная сумма пополнения' });
    }

    const transactionId = await walletService.depositToWallet(
      masterId,
      amount,
      paymentMethod,
      paymentDetails
    );

    const newBalance = await walletService.getWalletBalance(masterId);

    res.json({
      message: 'Кошелек успешно пополнен',
      transactionId,
      balance: newBalance,
    });
  } catch (error) {
    console.error('Error depositing to wallet:', error);
    res.status(500).json({ message: 'Ошибка при пополнении кошелька' });
  }
};

// Оплатить комиссию из кошелька
export const payCommissionFromWallet = async (req: Request, res: Response) => {
  try {
    const masterId = req.userId;
    const { commissionTransactionId } = req.body;

    if (!masterId) {
      return res.status(401).json({ message: 'Не авторизован' });
    }

    if (!commissionTransactionId) {
      return res.status(400).json({ message: 'Не указан ID комиссии' });
    }

    await walletService.payCommissionFromWallet(masterId, commissionTransactionId);

    const stats = await walletService.getWalletStats(masterId);

    res.json({
      message: 'Комиссия успешно оплачена',
      wallet: stats,
    });
  } catch (error: any) {
    console.error('Error paying commission from wallet:', error);
    
    if (error.message === 'Insufficient wallet balance') {
      return res.status(400).json({ message: 'Недостаточно средств на кошельке' });
    }
    
    if (error.message === 'Commission already paid or cancelled') {
      return res.status(400).json({ message: 'Комиссия уже оплачена или отменена' });
    }
    
    res.status(500).json({ message: 'Ошибка при оплате комиссии' });
  }
};

// Получить историю транзакций кошелька
export const getWalletTransactions = async (req: Request, res: Response) => {
  try {
    const masterId = req.userId;
    const { type, limit, offset } = req.query;

    if (!masterId) {
      return res.status(401).json({ message: 'Не авторизован' });
    }

    const transactions = await walletService.getWalletTransactions(
      masterId,
      type as string | undefined,
      limit ? parseInt(limit as string) : undefined,
      offset ? parseInt(offset as string) : undefined
    );

    res.json({ transactions });
  } catch (error) {
    console.error('Error fetching wallet transactions:', error);
    res.status(500).json({ message: 'Ошибка при получении транзакций' });
  }
};

// Создать Stripe Payment Intent для пополнения кошелька
export const createWalletPaymentIntent = async (req: Request, res: Response) => {
  try {
    const masterId = req.userId;
    const { amount } = req.body;

    if (!masterId) {
      return res.status(401).json({ message: 'Не авторизован' });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Некорректная сумма пополнения' });
    }

    // Минимальная сумма для Stripe - 100 тенге
    const minAmount = 100;
    if (amount < minAmount) {
      return res.status(400).json({ 
        message: `Минимальная сумма для пополнения: ${minAmount} ₸` 
      });
    }

    const amountInTiyns = Math.round(amount * 100); // Stripe использует тиын (центы)

    console.log('Creating wallet payment intent for master:', masterId, 'amount:', amount, 'KZT');

    // Создаем Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInTiyns,
      currency: 'kzt',
      metadata: {
        masterId: masterId.toString(),
        type: 'wallet_deposit',
      },
      description: `Пополнение кошелька на ${amount} ₸`,
    });

    console.log('Wallet payment intent created:', paymentIntent.id);

    res.json({
      clientSecret: paymentIntent.client_secret,
      amount,
    });
  } catch (error: any) {
    console.error('Error creating wallet payment intent:', error);
    res.status(500).json({ 
      message: error.message || 'Ошибка создания платежа',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Подтвердить пополнение кошелька через Stripe
export const confirmWalletPayment = async (req: Request, res: Response) => {
  try {
    const masterId = req.userId;
    const { paymentIntentId } = req.body;

    if (!masterId) {
      return res.status(401).json({ message: 'Не авторизован' });
    }

    if (!paymentIntentId) {
      return res.status(400).json({ message: 'Payment Intent ID обязателен' });
    }

    console.log('Confirming wallet payment for master:', masterId, 'paymentIntent:', paymentIntentId);

    // Проверяем статус платежа в Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ message: 'Платеж не завершен' });
    }

    const amount = paymentIntent.amount / 100; // Конвертируем из тиын в тенге

    console.log('Payment succeeded, depositing', amount, 'KZT to wallet');

    // Пополняем кошелек
    const transactionId = await walletService.depositToWallet(
      masterId,
      amount,
      'stripe',
      paymentIntentId
    );

    const stats = await walletService.getWalletStats(masterId);

    console.log('Wallet deposit completed successfully');

    res.json({
      success: true,
      message: 'Кошелек успешно пополнен',
      transactionId,
      wallet: stats,
    });
  } catch (error: any) {
    console.error('Error confirming wallet payment:', error);
    res.status(500).json({ 
      message: error.message || 'Ошибка подтверждения платежа' 
    });
  }
};

// Получить публичный ключ Stripe
export const getStripePublishableKey = async (req: Request, res: Response) => {
  res.json({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  });
};
