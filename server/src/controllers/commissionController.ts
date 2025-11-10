import { Request, Response } from 'express';
import { commissionService } from '../services/commissionService';

// Получить баланс комиссий мастера
export const getMasterCommissionBalance = async (req: Request, res: Response) => {
  try {
    const masterId = req.userId;

    if (!masterId) {
      return res.status(401).json({ message: 'Не авторизован' });
    }

    const balance = await commissionService.getMasterCommissionBalance(masterId);

    res.json(balance);
  } catch (error) {
    console.error('Error fetching commission balance:', error);
    res.status(500).json({ message: 'Ошибка при получении баланса комиссий' });
  }
};

// Получить транзакции комиссий мастера
export const getMasterCommissionTransactions = async (req: Request, res: Response) => {
  try {
    const masterId = req.userId;
    const { status } = req.query;

    if (!masterId) {
      return res.status(401).json({ message: 'Не авторизован' });
    }

    const transactions = await commissionService.getMasterCommissionTransactions(
      masterId,
      status as string | undefined
    );

    res.json({ transactions });
  } catch (error) {
    console.error('Error fetching commission transactions:', error);
    res.status(500).json({ message: 'Ошибка при получении транзакций' });
  }
};

// Рассчитать комиссию для суммы заказа (предварительный расчет)
export const calculateCommission = async (req: Request, res: Response) => {
  try {
    const masterId = req.userId;
    const { orderAmount } = req.body;

    if (!masterId) {
      return res.status(401).json({ message: 'Не авторизован' });
    }

    if (!orderAmount || orderAmount <= 0) {
      return res.status(400).json({ message: 'Некорректная сумма заказа' });
    }

    const commission = await commissionService.calculateCommission(masterId, orderAmount);

    res.json(commission);
  } catch (error) {
    console.error('Error calculating commission:', error);
    res.status(500).json({ message: 'Ошибка при расчете комиссии' });
  }
};

// Отметить комиссию как оплаченную (для админа)
export const markCommissionAsPaid = async (req: Request, res: Response) => {
  try {
    const { transactionId } = req.params;

    // TODO: Добавить проверку прав администратора
    // if (req.userRole !== 'admin') {
    //   return res.status(403).json({ message: 'Недостаточно прав' });
    // }

    await commissionService.markCommissionAsPaid(parseInt(transactionId));

    res.json({ message: 'Комиссия отмечена как оплаченная' });
  } catch (error) {
    console.error('Error marking commission as paid:', error);
    res.status(500).json({ message: 'Ошибка при обновлении статуса комиссии' });
  }
};
