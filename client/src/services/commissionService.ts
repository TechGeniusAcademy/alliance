import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export interface CommissionBalance {
  balance: number;
  totalPaid: number;
  pendingTransactions: number;
}

export interface CommissionTransaction {
  id: number;
  master_id: number;
  order_id: number;
  order_title: string;
  order_amount: number;
  commission_amount: number;
  commission_type: 'first_month' | 'percentage';
  commission_rate: number | null;
  status: 'pending' | 'paid' | 'cancelled';
  created_at: string;
  paid_at: string | null;
}

export interface CommissionCalculation {
  amount: number;
  type: 'first_month' | 'percentage';
  rate?: number;
}

class CommissionService {
  private getAuthHeader() {
    const token = localStorage.getItem('token');
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }

  // Получить баланс комиссий
  async getBalance(): Promise<CommissionBalance> {
    const response = await axios.get(`${API_URL}/commissions/balance`, this.getAuthHeader());
    return response.data;
  }

  // Получить транзакции комиссий
  async getTransactions(status?: string): Promise<CommissionTransaction[]> {
    const params = status ? { status } : {};
    const response = await axios.get(`${API_URL}/commissions/transactions`, {
      ...this.getAuthHeader(),
      params,
    });
    return response.data.transactions;
  }

  // Рассчитать комиссию для суммы заказа
  async calculateCommission(orderAmount: number): Promise<CommissionCalculation> {
    const response = await axios.post(
      `${API_URL}/commissions/calculate`,
      { orderAmount },
      this.getAuthHeader()
    );
    return response.data;
  }
}

const commissionService = new CommissionService();

export { commissionService };
