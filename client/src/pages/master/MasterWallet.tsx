import React, { useState, useEffect, useCallback } from 'react';
import { walletService } from '../../services/walletService';
import type { WalletStats, WalletTransaction } from '../../services/walletService';
import WalletPaymentModal from '../../components/WalletPaymentModal';
import styles from './MasterWallet.module.css';

const MasterWallet: React.FC = () => {
  const [stats, setStats] = useState<WalletStats | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('all');
  
  // Форма пополнения
  const [depositAmount, setDepositAmount] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const loadWalletData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const [statsData, transactionsData] = await Promise.all([
        walletService.getStats(),
        walletService.getTransactions(
          filterType === 'all' ? undefined : filterType,
          50
        ),
      ]);

      setStats(statsData);
      setTransactions(transactionsData);
    } catch (err) {
      console.error('Error loading wallet data:', err);
      setError('Не удалось загрузить данные кошелька');
    } finally {
      setLoading(false);
    }
  }, [filterType]);

  useEffect(() => {
    loadWalletData();
  }, [loadWalletData]);

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      setError('Введите корректную сумму');
      return;
    }

    if (amount < 100) {
      setError('Минимальная сумма пополнения: 100 ₸');
      return;
    }

    setError('');
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async () => {
    setShowPaymentModal(false);
    setDepositAmount('');
    await loadWalletData();
    alert('Кошелек успешно пополнен!');
  };

  const handlePaymentClose = () => {
    setShowPaymentModal(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'Пополнение';
      case 'commission_payment':
        return 'Оплата комиссии';
      default:
        return type;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Завершено';
      case 'pending':
        return 'В обработке';
      case 'failed':
        return 'Ошибка';
      case 'cancelled':
        return 'Отменено';
      default:
        return status;
    }
  };

  if (loading && !stats) {
    return <div className={styles.loading}>Загрузка...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Кошелек</h1>
        <p className={styles.subtitle}>Управление балансом и оплата комиссий</p>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {stats && (
        <div className={styles.statsGrid}>
          <div className={`${styles.statCard} ${styles.balance}`}>
            <div className={styles.statLabel}>Текущий баланс</div>
            <div className={styles.statValue}>{parseFloat(String(stats.balance)).toFixed(2)} ₸</div>
            <div className={styles.statDescription}>Доступно для оплаты комиссий</div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statLabel}>Всего пополнено</div>
            <div className={styles.statValue}>{parseFloat(String(stats.totalDeposits)).toFixed(2)} ₸</div>
            <div className={styles.statDescription}>За все время</div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statLabel}>Оплачено комиссий</div>
            <div className={styles.statValue}>{parseFloat(String(stats.totalCommissionsPaid)).toFixed(2)} ₸</div>
            <div className={styles.statDescription}>За все время</div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statLabel}>Ожидают оплаты</div>
            <div className={styles.statValue}>{parseFloat(String(stats.pendingCommissions)).toFixed(2)} ₸</div>
            <div className={styles.statDescription}>Неоплаченные комиссии</div>
          </div>
        </div>
      )}

      <div className={styles.contentGrid}>
        <div className={styles.depositSection}>
          <h2 className={styles.sectionTitle}>Пополнить кошелек</h2>
          
          <form onSubmit={handleDeposit} className={styles.depositForm}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Сумма (₸)</label>
              <input
                type="number"
                className={styles.input}
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="Введите сумму"
                min="1"
                step="0.01"
                required
              />
            </div>

            <button
              type="submit"
              className={styles.depositButton}
            >
              Пополнить через Stripe
            </button>
          </form>

          <div className={styles.infoBox}>
            <div className={styles.infoTitle}>💡 Информация</div>
            <div className={styles.infoText}>
              Оплата производится через безопасный сервис Stripe. 
              Пополненные средства будут доступны для оплаты комиссий. 
              Комиссия составляет 5000₸ за каждый из первых 3 заказов, 
              затем 3% от суммы заказа. Минимальная сумма пополнения: 100₸.
            </div>
          </div>
        </div>

        <div className={styles.transactionsSection}>
          <h2 className={styles.sectionTitle}>История транзакций</h2>

          <div className={styles.filterTabs}>
            <button
              className={`${styles.filterTab} ${filterType === 'all' ? styles.active : ''}`}
              onClick={() => setFilterType('all')}
            >
              Все
            </button>
            <button
              className={`${styles.filterTab} ${filterType === 'deposit' ? styles.active : ''}`}
              onClick={() => setFilterType('deposit')}
            >
              Пополнения
            </button>
            <button
              className={`${styles.filterTab} ${filterType === 'commission_payment' ? styles.active : ''}`}
              onClick={() => setFilterType('commission_payment')}
            >
              Комиссии
            </button>
          </div>

          {transactions.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📭</div>
              <div className={styles.emptyText}>Транзакций пока нет</div>
            </div>
          ) : (
            <div className={styles.transactionsList}>
              {transactions.map((transaction) => (
                <div key={transaction.id} className={styles.transactionCard}>
                  <div className={styles.transactionLeft}>
                    <div className={styles.transactionType}>
                      {getTransactionTypeLabel(transaction.type)}
                    </div>
                    {transaction.description && (
                      <div className={styles.transactionDescription}>
                        {transaction.description}
                      </div>
                    )}
                    {transaction.order_title && (
                      <div className={styles.transactionDescription}>
                        Заказ: {transaction.order_title}
                      </div>
                    )}
                    <div className={styles.transactionDate}>
                      {formatDate(transaction.created_at)}
                    </div>
                  </div>

                  <div className={styles.transactionRight}>
                    <div
                      className={`${styles.transactionAmount} ${
                        transaction.type === 'deposit' ? styles.deposit : styles.payment
                      }`}
                    >
                      {transaction.type === 'deposit' ? '+' : '-'}
                      {parseFloat(String(transaction.amount)).toFixed(2)} ₸
                    </div>
                    <div
                      className={`${styles.transactionStatus} ${styles[transaction.status]}`}
                    >
                      {getStatusLabel(transaction.status)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showPaymentModal && (
        <WalletPaymentModal
          amount={parseFloat(depositAmount)}
          onClose={handlePaymentClose}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};

export default MasterWallet;
