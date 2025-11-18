import pool from '../config/database';

interface WalletTransaction {
  id: number;
  master_id: number;
  amount: number;
  type: 'deposit' | 'commission_payment';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  commission_transaction_id?: number;
  payment_method?: string;
  payment_details?: string;
  description?: string;
  created_at: string;
  completed_at?: string;
}

class WalletService {
  /**
   * Получить баланс кошелька мастера
   */
  async getWalletBalance(masterId: number): Promise<number> {
    const result = await pool.query(
      'SELECT wallet_balance FROM master_profiles WHERE user_id = $1',
      [masterId]
    );

    if (result.rows.length === 0) {
      throw new Error('Master profile not found');
    }

    return parseFloat(result.rows[0].wallet_balance) || 0;
  }

  /**
   * Пополнить кошелек
   */
  async depositToWallet(
    masterId: number,
    amount: number,
    paymentMethod?: string,
    paymentDetails?: string
  ): Promise<number> {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Создаем транзакцию пополнения
      const transactionResult = await client.query(
        `INSERT INTO wallet_transactions 
         (master_id, amount, type, status, payment_method, payment_details, description)
         VALUES ($1, $2, 'deposit', 'completed', $3, $4, 'Пополнение кошелька')
         RETURNING id`,
        [masterId, amount, paymentMethod, paymentDetails]
      );

      // Обновляем баланс кошелька
      await client.query(
        `UPDATE master_profiles 
         SET wallet_balance = wallet_balance + $1
         WHERE user_id = $2`,
        [amount, masterId]
      );

      // Обновляем время завершения транзакции
      await client.query(
        `UPDATE wallet_transactions 
         SET completed_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [transactionResult.rows[0].id]
      );

      await client.query('COMMIT');

      return transactionResult.rows[0].id;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Оплатить комиссию из кошелька
   */
  async payCommissionFromWallet(
    masterId: number,
    commissionTransactionId: number
  ): Promise<void> {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Получаем информацию о комиссии
      const commissionResult = await client.query(
        `SELECT commission_amount, status 
         FROM commission_transactions 
         WHERE id = $1 AND master_id = $2`,
        [commissionTransactionId, masterId]
      );

      if (commissionResult.rows.length === 0) {
        throw new Error('Commission transaction not found');
      }

      const { commission_amount, status } = commissionResult.rows[0];

      if (status !== 'pending') {
        throw new Error('Commission already paid or cancelled');
      }

      // Проверяем баланс кошелька
      const balanceResult = await client.query(
        'SELECT wallet_balance FROM master_profiles WHERE user_id = $1',
        [masterId]
      );

      const currentBalance = parseFloat(balanceResult.rows[0].wallet_balance) || 0;

      if (currentBalance < commission_amount) {
        throw new Error('Insufficient wallet balance');
      }

      // Создаем транзакцию оплаты комиссии
      await client.query(
        `INSERT INTO wallet_transactions 
         (master_id, amount, type, status, commission_transaction_id, description)
         VALUES ($1, $2, 'commission_payment', 'completed', $3, 'Оплата комиссии')`,
        [masterId, -commission_amount, commissionTransactionId]
      );

      // Обновляем баланс кошелька
      await client.query(
        `UPDATE master_profiles 
         SET wallet_balance = wallet_balance - $1
         WHERE user_id = $2`,
        [commission_amount, masterId]
      );

      // Отмечаем комиссию как оплаченную
      await client.query(
        `UPDATE commission_transactions 
         SET status = 'paid', paid_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [commissionTransactionId]
      );

      // Обновляем баланс комиссий
      await client.query(
        `UPDATE master_profiles 
         SET commission_balance = commission_balance - $1,
             total_commission_paid = total_commission_paid + $1
         WHERE user_id = $2`,
        [commission_amount, masterId]
      );

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Получить историю транзакций кошелька
   */
  async getWalletTransactions(
    masterId: number,
    type?: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<WalletTransaction[]> {
    let query = `
      SELECT wt.*, 
             ct.order_id,
             o.title as order_title
      FROM wallet_transactions wt
      LEFT JOIN commission_transactions ct ON wt.commission_transaction_id = ct.id
      LEFT JOIN orders o ON ct.order_id = o.id
      WHERE wt.master_id = $1
    `;
    const params: any[] = [masterId];

    if (type) {
      query += ` AND wt.type = $${params.length + 1}`;
      params.push(type);
    }

    query += ` ORDER BY wt.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    return result.rows;
  }

  /**
   * Получить статистику кошелька
   */
  async getWalletStats(masterId: number): Promise<{
    balance: number;
    totalDeposits: number;
    totalCommissionsPaid: number;
    pendingCommissions: number;
  }> {
    const result = await pool.query(
      `SELECT 
         mp.wallet_balance as balance,
         mp.total_commission_paid,
         mp.commission_balance as pending_commissions,
         COALESCE((SELECT SUM(amount) FROM wallet_transactions 
                   WHERE master_id = mp.user_id AND type = 'deposit' AND status = 'completed'), 0) as total_deposits
       FROM master_profiles mp
       WHERE mp.user_id = $1`,
      [masterId]
    );

    if (result.rows.length === 0) {
      return {
        balance: 0,
        totalDeposits: 0,
        totalCommissionsPaid: 0,
        pendingCommissions: 0,
      };
    }

    return {
      balance: parseFloat(result.rows[0].balance) || 0,
      totalDeposits: parseFloat(result.rows[0].total_deposits) || 0,
      totalCommissionsPaid: parseFloat(result.rows[0].total_commission_paid) || 0,
      pendingCommissions: parseFloat(result.rows[0].pending_commissions) || 0,
    };
  }

  /**
   * Получить список неоплаченных комиссий
   */
  async getUnpaidCommissions(masterId: number): Promise<any[]> {
    const result = await pool.query(
      `SELECT 
        ct.*,
        o.title as order_title,
        o.status as order_status
       FROM commission_transactions ct
       JOIN orders o ON ct.order_id = o.id
       WHERE ct.master_id = $1 AND ct.status = 'pending'
       ORDER BY ct.created_at ASC`,
      [masterId]
    );

    return result.rows;
  }

  /**
   * Оплатить все неоплаченные комиссии разом
   */
  async payAllCommissions(masterId: number): Promise<{
    message: string;
    paidCount: number;
    totalAmount: number;
    newBalance: number;
  }> {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Получаем все неоплаченные комиссии
      const commissionsResult = await client.query(
        `SELECT * FROM commission_transactions 
         WHERE master_id = $1 AND status = 'pending'
         ORDER BY created_at ASC`,
        [masterId]
      );

      if (commissionsResult.rows.length === 0) {
        throw new Error('No unpaid commissions');
      }

      const commissions = commissionsResult.rows;
      const totalAmount = commissions.reduce((sum, c) => sum + parseFloat(c.commission_amount), 0);

      // Проверяем баланс кошелька
      const walletResult = await client.query(
        `SELECT wallet_balance FROM master_profiles WHERE user_id = $1`,
        [masterId]
      );

      const walletBalance = parseFloat(walletResult.rows[0]?.wallet_balance || 0);

      if (walletBalance < totalAmount) {
        throw new Error('Insufficient wallet balance');
      }

      // Списываем с баланса кошелька
      await client.query(
        `UPDATE master_profiles 
         SET wallet_balance = wallet_balance - $1
         WHERE user_id = $2`,
        [totalAmount, masterId]
      );

      // Обновляем статус всех комиссий
      await client.query(
        `UPDATE commission_transactions 
         SET status = 'paid', paid_at = NOW()
         WHERE master_id = $1 AND status = 'pending'`,
        [masterId]
      );

      // Создаем транзакцию списания
      await client.query(
        `INSERT INTO wallet_transactions 
         (master_id, amount, type, status, description, created_at, updated_at)
         VALUES ($1, $2, 'commission_payment', 'completed', $3, NOW(), NOW())`,
        [
          masterId,
          totalAmount,
          `Оплата всех неоплаченных комиссий (${commissions.length} шт.)`
        ]
      );

      await client.query('COMMIT');

      const newBalance = walletBalance - totalAmount;

      return {
        message: `Все комиссии оплачены! Списано: ${totalAmount}₸`,
        paidCount: commissions.length,
        totalAmount,
        newBalance,
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

export const walletService = new WalletService();
