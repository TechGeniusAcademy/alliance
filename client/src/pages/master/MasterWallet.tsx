import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { walletService } from '../../services/walletService';
import type { WalletStats, WalletTransaction } from '../../services/walletService';
import WalletPaymentModal from '../../components/WalletPaymentModal';
import styles from './MasterWallet.module.css';

const MasterWallet: React.FC = () => {
  const { t } = useTranslation();
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
      setError(t('masterWallet.errors.loadError'));
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
      setError(t('masterWallet.errors.invalidAmount'));
      return;
    }

    if (amount < 100) {
      setError(t('masterWallet.errors.minAmount'));
      return;
    }

    setError('');
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async () => {
    setShowPaymentModal(false);
    setDepositAmount('');
    await loadWalletData();
    alert(t('masterWallet.deposit.success'));
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
        return t('masterWallet.types.deposit');
      case 'commission_payment':
        return t('masterWallet.types.commission_payment');
      default:
        return type;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return t('masterWallet.statuses.completed');
      case 'pending':
        return t('masterWallet.statuses.pending');
      case 'failed':
        return t('masterWallet.statuses.failed');
      case 'cancelled':
        return t('masterWallet.statuses.cancelled');
      default:
        return status;
    }
  };

  if (loading && !stats) {
    return <div className={styles.loading}>{t('masterWallet.loading')}</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>{t('masterWallet.title')}</h1>
        <p className={styles.subtitle}>{t('masterWallet.subtitle')}</p>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {stats && (
        <div className={styles.statsGrid}>
          <div className={`${styles.statCard} ${styles.balance}`}>
            <div className={styles.statLabel}>{t('masterWallet.stats.currentBalance')}</div>
            <div className={styles.statValue}>{parseFloat(String(stats.balance)).toFixed(2)} ₸</div>
            <div className={styles.statDescription}>{t('masterWallet.stats.balanceHint')}</div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statLabel}>{t('masterWallet.stats.totalDeposits')}</div>
            <div className={styles.statValue}>{parseFloat(String(stats.totalDeposits)).toFixed(2)} ₸</div>
            <div className={styles.statDescription}>{t('masterWallet.stats.allTime')}</div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statLabel}>{t('masterWallet.stats.commissionsPaid')}</div>
            <div className={styles.statValue}>{parseFloat(String(stats.totalCommissionsPaid)).toFixed(2)} ₸</div>
            <div className={styles.statDescription}>{t('masterWallet.stats.allTime')}</div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statLabel}>{t('masterWallet.stats.pendingCommissions')}</div>
            <div className={styles.statValue}>{parseFloat(String(stats.pendingCommissions)).toFixed(2)} ₸</div>
            <div className={styles.statDescription}>{t('masterWallet.stats.pendingHint')}</div>
          </div>
        </div>
      )}

      <div className={styles.contentGrid}>
        <div className={styles.depositSection}>
          <h2 className={styles.sectionTitle}>{t('masterWallet.deposit.title')}</h2>
          
          <form onSubmit={handleDeposit} className={styles.depositForm}>
            <div className={styles.formGroup}>
              <label className={styles.label}>{t('masterWallet.deposit.amountLabel')}</label>
              <input
                type="number"
                className={styles.input}
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder={t('masterWallet.deposit.amountPlaceholder')}
                min="1"
                step="0.01"
                required
              />
            </div>

            <button
              type="submit"
              className={styles.depositButton}
            >
              {t('masterWallet.deposit.button')}
            </button>
          </form>

          <div className={styles.infoBox}>
            <div className={styles.infoTitle}>{t('masterWallet.info.title')}</div>
            <div className={styles.infoText}>
              {t('masterWallet.info.text')}
            </div>
          </div>
        </div>

        <div className={styles.transactionsSection}>
          <h2 className={styles.sectionTitle}>{t('masterWallet.transactions.title')}</h2>

          <div className={styles.filterTabs}>
            <button
              className={`${styles.filterTab} ${filterType === 'all' ? styles.active : ''}`}
              onClick={() => setFilterType('all')}
            >
              {t('masterWallet.filters.all')}
            </button>
            <button
              className={`${styles.filterTab} ${filterType === 'deposit' ? styles.active : ''}`}
              onClick={() => setFilterType('deposit')}
            >
              {t('masterWallet.filters.deposits')}
            </button>
            <button
              className={`${styles.filterTab} ${filterType === 'commission_payment' ? styles.active : ''}`}
              onClick={() => setFilterType('commission_payment')}
            >
              {t('masterWallet.filters.commissions')}
            </button>
          </div>

          {transactions.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📭</div>
              <div className={styles.emptyText}>{t('masterWallet.transactions.empty')}</div>
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
                        {t('masterWallet.transactions.order')} {transaction.order_title}
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
