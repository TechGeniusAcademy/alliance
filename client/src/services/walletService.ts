import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export interface WalletStats {
  balance: number;
  totalDeposits: number;
  totalCommissionsPaid: number;
  pendingCommissions: number;
}

export interface WalletTransaction {
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
  order_id?: number;
  order_title?: string;
}

class WalletService {
  private getAuthHeader() {
    const token = localStorage.getItem('token');
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }

  // Получить баланс кошелька
  async getBalance(): Promise<number> {
    const response = await axios.get(`${API_URL}/wallet/balance`, this.getAuthHeader());
    return response.data.balance;
  }

  // Получить статистику кошелька
  async getStats(): Promise<WalletStats> {
    const response = await axios.get(`${API_URL}/wallet/stats`, this.getAuthHeader());
    return response.data;
  }

  // Получить историю транзакций
  async getTransactions(type?: string, limit?: number, offset?: number): Promise<WalletTransaction[]> {
    const params: Record<string, string | number> = {};
    if (type) params.type = type;
    if (limit) params.limit = limit;
    if (offset) params.offset = offset;

    const response = await axios.get(`${API_URL}/wallet/transactions`, {
      ...this.getAuthHeader(),
      params,
    });
    return response.data.transactions;
  }

  // Пополнить кошелек
  async deposit(amount: number, paymentMethod?: string, paymentDetails?: string): Promise<{
    transactionId: number;
    balance: number;
  }> {
    const response = await axios.post(
      `${API_URL}/wallet/deposit`,
      { amount, paymentMethod, paymentDetails },
      this.getAuthHeader()
    );
    return response.data;
  }

  // Оплатить комиссию из кошелька
  async payCommission(commissionTransactionId: number): Promise<WalletStats> {
    const response = await axios.post(
      `${API_URL}/wallet/pay-commission`,
      { commissionTransactionId },
      this.getAuthHeader()
    );
    return response.data.wallet;
  }

  // Создать Stripe Payment Intent для пополнения кошелька
  async createPaymentIntent(amount: number): Promise<{
    clientSecret: string;
    amount: number;
  }> {
    const response = await axios.post(
      `${API_URL}/wallet/create-payment-intent`,
      { amount },
      this.getAuthHeader()
    );
    return response.data;
  }

  // Подтвердить пополнение кошелька через Stripe
  async confirmPayment(paymentIntentId: string): Promise<{
    success: boolean;
    message: string;
    transactionId: number;
    wallet: WalletStats;
  }> {
    const response = await axios.post(
      `${API_URL}/wallet/confirm-payment`,
      { paymentIntentId },
      this.getAuthHeader()
    );
    return response.data;
  }

  // Получить публичный ключ Stripe
  async getStripePublishableKey(): Promise<string> {
    const response = await axios.get(`${API_URL}/wallet/stripe-key`);
    return response.data.publishableKey;
  }
}

const walletService = new WalletService();

export { walletService };
