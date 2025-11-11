import { useState, useEffect } from 'react';
import {
  MdPayment,
  MdSearch,
  MdCheckCircle,
  MdPending,
  MdError,
  MdCreditCard,
  MdAccountBalance
} from 'react-icons/md';
import { appService } from '../services/appService';
import type { Payment } from '../types/app';
import styles from './Orders.module.css';

const Payments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const data = await appService.getPayments();
      setPayments(data);
    } catch (error) {
      console.error('Failed to load payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.orderTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: payments.reduce((sum, p) => sum + p.amount, 0),
    completed: payments.filter(p => p.status === 'completed').length,
    pending: payments.filter(p => p.status === 'pending').length,
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <MdCheckCircle />;
      case 'pending': return <MdPending />;
      case 'failed': return <MdError />;
      default: return <MdPayment />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'failed': return '#ef4444';
      case 'refunded': return '#6366f1';
      default: return '#6b7280';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.loader}></div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <div className={styles.headerTop}>
          <h1 className={styles.pageTitle}>
            <MdPayment className={styles.titleIcon} />
            Платежи
          </h1>
        </div>

        <div className={styles.headerStats}>
          <div className={`${styles.statCard} ${styles.total}`}>
            <div className={styles.statValue}>{stats.total.toLocaleString()} ₸</div>
            <div className={styles.statLabel}>Всего оплачено</div>
          </div>
          <div className={`${styles.statCard} ${styles.completed}`}>
            <div className={styles.statValue}>{stats.completed}</div>
            <div className={styles.statLabel}>Успешные</div>
          </div>
          <div className={`${styles.statCard} ${styles.pending}`}>
            <div className={styles.statValue}>{stats.pending}</div>
            <div className={styles.statLabel}>В ожидании</div>
          </div>
        </div>
      </div>

      <div className={styles.filters}>
        <div className={styles.searchBox}>
          <MdSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Поиск по названию заказа..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filterGroup}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">Все платежи</option>
            <option value="completed">Успешные</option>
            <option value="pending">В ожидании</option>
            <option value="failed">Неудачные</option>
            <option value="refunded">Возвращены</option>
          </select>
        </div>
      </div>

      {filteredPayments.length === 0 ? (
        <div className={styles.emptyState}>
          <MdPayment size={64} />
          <h3>Платежи не найдены</h3>
          <p>Попробуйте изменить параметры поиска</p>
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Заказ</th>
                <th>Сумма</th>
                <th>Метод</th>
                <th>Статус</th>
                <th>Дата</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((payment) => (
                <tr key={payment.id}>
                  <td>#{payment.id}</td>
                  <td>
                    <div className={styles.orderInfo}>
                      <div className={styles.orderTitle}>{payment.orderTitle}</div>
                      {payment.description && (
                        <div className={styles.orderDescription}>{payment.description}</div>
                      )}
                    </div>
                  </td>
                  <td className={styles.amount}>
                    {payment.amount.toLocaleString()} {payment.currency}
                  </td>
                  <td>
                    <span className={styles.method}>
                      {payment.method === 'card' && (
                        <>
                          <MdCreditCard size={18} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                          Карта
                        </>
                      )}
                      {payment.method === 'kaspi' && (
                        <>
                          <MdCreditCard size={18} style={{ verticalAlign: 'middle', marginRight: '4px', color: '#8B5CF6' }} />
                          Kaspi Pay
                        </>
                      )}
                      {payment.method === 'bank_transfer' && (
                        <>
                          <MdAccountBalance size={18} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                          Перевод
                        </>
                      )}
                      {payment.method === 'cash' && (
                        <>
                          <MdPayment size={18} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                          Наличные
                        </>
                      )}
                      {payment.cardLast4 && ` •••• ${payment.cardLast4}`}
                    </span>
                  </td>
                  <td>
                    <span
                      className={styles.statusBadge}
                      style={{ backgroundColor: getStatusColor(payment.status) }}
                    >
                      {getStatusIcon(payment.status)}
                      {payment.status === 'completed' && 'Успешно'}
                      {payment.status === 'pending' && 'В ожидании'}
                      {payment.status === 'failed' && 'Неудачно'}
                      {payment.status === 'refunded' && 'Возврат'}
                    </span>
                  </td>
                  <td className={styles.date}>{formatDate(payment.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Payments;
