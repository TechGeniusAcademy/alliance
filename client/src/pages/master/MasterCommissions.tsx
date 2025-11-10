import { useState, useEffect } from 'react';
import { MdAttachMoney, MdReceipt, MdInfo, MdCheck, MdPending } from 'react-icons/md';
import { commissionService, type CommissionBalance, type CommissionTransaction } from '../../services/commissionService';
import styles from './Master.module.css';

const MasterCommissions = () => {
  const [balance, setBalance] = useState<CommissionBalance | null>(null);
  const [transactions, setTransactions] = useState<CommissionTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [balanceData, transactionsData] = await Promise.all([
        commissionService.getBalance(),
        commissionService.getTransactions(filter === 'all' ? undefined : filter),
      ]);
      setBalance(balanceData);
      setTransactions(transactionsData);
    } catch (error) {
      console.error('Error loading commission data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU').format(price) + ' ₸';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCommissionTypeText = (type: string) => {
    return type === 'first_month' ? 'Первый месяц' : 'Процент от заказа';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'Оплачено';
      case 'pending': return 'Ожидает оплаты';
      case 'cancelled': return 'Отменено';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.loader} />
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>
          <MdAttachMoney style={{ verticalAlign: 'middle', marginRight: '12px' }} />
          Комиссии платформы
        </h1>
        <p style={{ color: '#718096', marginTop: '8px' }}>
          Информация о комиссиях за использование платформы
        </p>
      </div>

      {/* Информационный блок */}
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
        borderRadius: '16px',
        padding: '24px',
        color: 'white',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <MdInfo size={28} />
          <h3 style={{ margin: 0, fontSize: '1.3rem' }}>Условия комиссии</h3>
        </div>
        <div style={{ display: 'grid', gap: '12px', fontSize: '1rem', lineHeight: '1.6' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <strong>•</strong>
            <span>Первый месяц: 5,000₸ за каждый заказ (максимум 3 заказа = 15,000₸)</span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <strong>•</strong>
            <span>После первого месяца: 3% от суммы каждого заказа</span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <strong>•</strong>
            <span>Клиент платит вам напрямую, мы не участвуем в расчетах</span>
          </div>
        </div>
      </div>

      {/* Статистика */}
      {balance && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '20px',
          marginBottom: '32px'
        }}>
          <div className={styles.section} style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div style={{ 
                background: '#fee2e2', 
                borderRadius: '12px', 
                padding: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <MdPending size={28} color="#dc2626" />
              </div>
              <div>
                <div style={{ fontSize: '0.9rem', color: '#718096' }}>К оплате</div>
                <div style={{ fontSize: '1.8rem', fontWeight: '700', color: '#2d3748' }}>
                  {formatPrice(balance.balance)}
                </div>
              </div>
            </div>
            <div style={{ fontSize: '0.85rem', color: '#718096', marginTop: '8px' }}>
              {balance.pendingTransactions} неоплаченных транзакций
            </div>
          </div>

          <div className={styles.section} style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div style={{ 
                background: '#d1fae5', 
                borderRadius: '12px', 
                padding: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <MdCheck size={28} color="#059669" />
              </div>
              <div>
                <div style={{ fontSize: '0.9rem', color: '#718096' }}>Всего оплачено</div>
                <div style={{ fontSize: '1.8rem', fontWeight: '700', color: '#2d3748' }}>
                  {formatPrice(balance.totalPaid)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Фильтры */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setFilter('all')}
            style={{
              padding: '10px 20px',
              background: filter === 'all' ? '#667eea' : '#f7fafc',
              color: filter === 'all' ? 'white' : '#4a5568',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.95rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Все
          </button>
          <button
            onClick={() => setFilter('pending')}
            style={{
              padding: '10px 20px',
              background: filter === 'pending' ? '#f59e0b' : '#f7fafc',
              color: filter === 'pending' ? 'white' : '#4a5568',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.95rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Ожидает оплаты
          </button>
          <button
            onClick={() => setFilter('paid')}
            style={{
              padding: '10px 20px',
              background: filter === 'paid' ? '#10b981' : '#f7fafc',
              color: filter === 'paid' ? 'white' : '#4a5568',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.95rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Оплачено
          </button>
        </div>
      </div>

      {/* Список транзакций */}
      <div className={styles.section}>
        <h3 style={{ margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MdReceipt size={24} />
          История комиссий
        </h3>

        {transactions.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#718096', padding: '40px' }}>
            Нет транзакций
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                style={{
                  padding: '20px',
                  background: '#f7fafc',
                  borderRadius: '12px',
                  display: 'grid',
                  gridTemplateColumns: '1fr auto',
                  gap: '16px',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontSize: '1.05rem', fontWeight: '600', color: '#2d3748', marginBottom: '8px' }}>
                    {transaction.order_title}
                  </div>
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '0.9rem', color: '#718096' }}>
                    <div>
                      <strong>Тип:</strong> {getCommissionTypeText(transaction.commission_type)}
                    </div>
                    {transaction.commission_rate && (
                      <div>
                        <strong>Ставка:</strong> {transaction.commission_rate}%
                      </div>
                    )}
                    <div>
                      <strong>Сумма заказа:</strong> {formatPrice(transaction.order_amount)}
                    </div>
                    <div>
                      <strong>Дата:</strong> {formatDate(transaction.created_at)}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#2d3748', marginBottom: '8px' }}>
                    {formatPrice(transaction.commission_amount)}
                  </div>
                  <div
                    style={{
                      display: 'inline-block',
                      padding: '6px 12px',
                      background: getStatusColor(transaction.status),
                      color: 'white',
                      borderRadius: '6px',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                    }}
                  >
                    {getStatusText(transaction.status)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MasterCommissions;
