import { useState, useEffect } from 'react';
import { orderService } from '../services/orderService';
import type { Order } from '../types/order';
import OrderCard from '../components/OrderCard';
import { MdSearch, MdTrendingUp } from 'react-icons/md';
import styles from './Orders.module.css';

const ActiveOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.getActiveOrders();
      setOrders(data);
    } catch (error) {
      console.error('Failed to load active orders:', error);
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

  const filteredOrders = orders.filter(order =>
    order.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeCount = orders.filter(o => o.status === 'active').length;
  const inProgressCount = orders.filter(o => o.status === 'in_progress').length;

  return (
    <div className={styles.ordersPage}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>
            <MdTrendingUp className={styles.titleIcon} />
            Активные заказы
          </h1>
          <p className={styles.pageSubtitle}>Заказы, которые сейчас в работе</p>
        </div>
        <div className={styles.headerStats}>
          <div className={`${styles.statCard} ${styles.statCardActive}`}>
            <div className={styles.statValue}>{activeCount}</div>
            <div className={styles.statLabel}>Активные</div>
          </div>
          <div className={`${styles.statCard} ${styles.statCardInProgress}`}>
            <div className={styles.statValue}>{inProgressCount}</div>
            <div className={styles.statLabel}>В работе</div>
          </div>
        </div>
      </div>

      <div className={styles.filters}>
        <div className={styles.searchBox}>
          <MdSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Поиск активных заказов..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      {loading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.loader}></div>
          <p>Загрузка активных заказов...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📋</div>
          <h3>Нет активных заказов</h3>
          <p>У вас пока нет заказов в работе</p>
        </div>
      ) : (
        <div className={styles.ordersGrid}>
          {filteredOrders.map(order => (
            <OrderCard
              key={order.id}
              order={order}
              onFavoriteToggle={handleFavoriteToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ActiveOrders;
