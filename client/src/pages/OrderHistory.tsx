import { useState, useEffect } from 'react';
import { orderService } from '../services/orderService';
import type { Order } from '../types/order';
import OrderCard from '../components/OrderCard';
import { MdSearch, MdHistory } from 'react-icons/md';
import styles from './Orders.module.css';

const OrderHistory = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'cancelled'>('all');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.getOrderHistory();
      setOrders(data);
    } catch (error) {
      console.error('Failed to load order history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFavoriteToggle = async (orderId: number, isFavorite: boolean) => {
    try {
      if (isFavorite) {
        await orderService.addToFavorites(orderId);
      } else {
        await orderService.removeFromFavorites(orderId);
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || order.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const completedCount = orders.filter(o => o.status === 'completed').length;
  const cancelledCount = orders.filter(o => o.status === 'cancelled').length;

  return (
    <div className={styles.ordersPage}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>
            <MdHistory className={styles.titleIcon} />
            История заказов
          </h1>
          <p className={styles.pageSubtitle}>Все завершенные и отмененные заказы</p>
        </div>
        <div className={styles.headerStats}>
          <div className={`${styles.statCard} ${styles.statCardCompleted}`}>
            <div className={styles.statValue}>{completedCount}</div>
            <div className={styles.statLabel}>Завершено</div>
          </div>
          <div className={`${styles.statCard} ${styles.statCardCancelled}`}>
            <div className={styles.statValue}>{cancelledCount}</div>
            <div className={styles.statLabel}>Отменено</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{orders.length}</div>
            <div className={styles.statLabel}>Всего</div>
          </div>
        </div>
      </div>

      <div className={styles.filters}>
        <div className={styles.searchBox}>
          <MdSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Поиск в истории..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filterTabs}>
          <button
            className={`${styles.filterTab} ${filterStatus === 'all' ? styles.filterTabActive : ''}`}
            onClick={() => setFilterStatus('all')}
          >
            Все ({orders.length})
          </button>
          <button
            className={`${styles.filterTab} ${filterStatus === 'completed' ? styles.filterTabActive : ''}`}
            onClick={() => setFilterStatus('completed')}
          >
            Завершенные ({completedCount})
          </button>
          <button
            className={`${styles.filterTab} ${filterStatus === 'cancelled' ? styles.filterTabActive : ''}`}
            onClick={() => setFilterStatus('cancelled')}
          >
            Отмененные ({cancelledCount})
          </button>
        </div>
      </div>

      {loading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.loader}></div>
          <p>Загрузка истории заказов...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📜</div>
          <h3>История пуста</h3>
          <p>У вас пока нет завершенных или отмененных заказов</p>
        </div>
      ) : (
        <div className={styles.ordersGrid}>
          {filteredOrders.map(order => (
            <OrderCard
              key={order.id}
              order={order}
              onFavoriteToggle={handleFavoriteToggle}
              showActions={false}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
