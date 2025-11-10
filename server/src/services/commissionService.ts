import pool from '../config/database';

interface CommissionCalculation {
  amount: number;
  type: 'first_month' | 'percentage';
  rate?: number;
}

class CommissionService {
  // Фиксированная комиссия для первого месяца
  private readonly FIRST_MONTH_COMMISSION = 5000; // 5000₸ за заказ
  private readonly FIRST_MONTH_MAX_ORDERS = 3; // максимум 3 заказа
  
  // Комиссия после первого месяца
  private readonly STANDARD_COMMISSION_RATE = 3; // 3%

  /**
   * Рассчитать комиссию для заказа
   */
  async calculateCommission(masterId: number, orderAmount: number): Promise<CommissionCalculation> {
    const client = await pool.connect();
    
    try {
      // Получаем информацию о мастере
      const masterResult = await client.query(
        `SELECT registered_at, first_month_orders 
         FROM master_profiles 
         WHERE user_id = $1`,
        [masterId]
      );

      if (masterResult.rows.length === 0) {
        throw new Error('Master profile not found');
      }

      const { registered_at, first_month_orders } = masterResult.rows[0];
      const registeredDate = new Date(registered_at);
      const now = new Date();
      
      // Вычисляем разницу в месяцах
      const monthsDiff = (now.getFullYear() - registeredDate.getFullYear()) * 12 
                       + (now.getMonth() - registeredDate.getMonth());

      // Первый месяц: фиксированная комиссия за первые 3 заказа
      if (monthsDiff === 0 && first_month_orders < this.FIRST_MONTH_MAX_ORDERS) {
        return {
          amount: this.FIRST_MONTH_COMMISSION,
          type: 'first_month'
        };
      }

      // После первого месяца или после 3 заказов: процент от суммы
      const commissionAmount = (orderAmount * this.STANDARD_COMMISSION_RATE) / 100;
      
      return {
        amount: commissionAmount,
        type: 'percentage',
        rate: this.STANDARD_COMMISSION_RATE
      };
    } finally {
      client.release();
    }
  }

  /**
   * Создать транзакцию комиссии при принятии заказа
   */
  async createCommissionTransaction(
    masterId: number, 
    orderId: number, 
    orderAmount: number
  ): Promise<number> {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Рассчитываем комиссию
      const commission = await this.calculateCommission(masterId, orderAmount);

      // Создаем транзакцию комиссии
      const transactionResult = await client.query(
        `INSERT INTO commission_transactions 
         (master_id, order_id, order_amount, commission_amount, commission_type, commission_rate, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'pending')
         RETURNING id`,
        [
          masterId, 
          orderId, 
          orderAmount, 
          commission.amount, 
          commission.type,
          commission.rate || null
        ]
      );

      // Обновляем баланс комиссий мастера
      await client.query(
        `UPDATE master_profiles 
         SET commission_balance = commission_balance + $1
         WHERE user_id = $2`,
        [commission.amount, masterId]
      );

      // Если это заказ первого месяца, увеличиваем счетчик
      if (commission.type === 'first_month') {
        await client.query(
          `UPDATE master_profiles 
           SET first_month_orders = first_month_orders + 1
           WHERE user_id = $1`,
          [masterId]
        );
      }

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
   * Отметить комиссию как оплаченную
   */
  async markCommissionAsPaid(transactionId: number): Promise<void> {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Получаем информацию о транзакции
      const transactionResult = await client.query(
        `SELECT master_id, commission_amount 
         FROM commission_transactions 
         WHERE id = $1 AND status = 'pending'`,
        [transactionId]
      );

      if (transactionResult.rows.length === 0) {
        throw new Error('Transaction not found or already paid');
      }

      const { master_id, commission_amount } = transactionResult.rows[0];

      // Обновляем статус транзакции
      await client.query(
        `UPDATE commission_transactions 
         SET status = 'paid', paid_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [transactionId]
      );

      // Обновляем балансы мастера
      await client.query(
        `UPDATE master_profiles 
         SET commission_balance = commission_balance - $1,
             total_commission_paid = total_commission_paid + $1
         WHERE user_id = $2`,
        [commission_amount, master_id]
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
   * Получить баланс комиссий мастера
   */
  async getMasterCommissionBalance(masterId: number): Promise<{
    balance: number;
    totalPaid: number;
    pendingTransactions: number;
  }> {
    const result = await pool.query(
      `SELECT 
         mp.commission_balance as balance,
         mp.total_commission_paid as total_paid,
         COUNT(ct.id) as pending_transactions
       FROM master_profiles mp
       LEFT JOIN commission_transactions ct ON ct.master_id = mp.user_id AND ct.status = 'pending'
       WHERE mp.user_id = $1
       GROUP BY mp.commission_balance, mp.total_commission_paid`,
      [masterId]
    );

    if (result.rows.length === 0) {
      return { balance: 0, totalPaid: 0, pendingTransactions: 0 };
    }

    return {
      balance: parseFloat(result.rows[0].balance),
      totalPaid: parseFloat(result.rows[0].total_paid),
      pendingTransactions: parseInt(result.rows[0].pending_transactions)
    };
  }

  /**
   * Получить все транзакции комиссий мастера
   */
  async getMasterCommissionTransactions(masterId: number, status?: string): Promise<any[]> {
    let query = `
      SELECT ct.*, o.title as order_title
      FROM commission_transactions ct
      LEFT JOIN orders o ON ct.order_id = o.id
      WHERE ct.master_id = $1
    `;
    const params: any[] = [masterId];

    if (status) {
      query += ` AND ct.status = $2`;
      params.push(status);
    }

    query += ` ORDER BY ct.created_at DESC`;

    const result = await pool.query(query, params);
    return result.rows;
  }
}

export const commissionService = new CommissionService();
