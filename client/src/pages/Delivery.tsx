import { useState, useEffect } from 'react';
import { 
  MdLocalShipping, 
  MdSearch, 
  MdPhone, 
  MdLocationOn,
  MdPerson
} from 'react-icons/md';
import { appService } from '../services/appService';
import type { Delivery as DeliveryType } from '../types/app';
import styles from './Orders.module.css';

const Delivery = () => {
  const [deliveries, setDeliveries] = useState<DeliveryType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadDeliveries();
  }, []);

  const loadDeliveries = async () => {
    try {
      setLoading(true);
      const data = await appService.getDeliveries();
      setDeliveries(data);
    } catch (error) {
      console.error('Failed to load deliveries:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDeliveries = deliveries.filter(delivery => {
    const matchesSearch = delivery.orderTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (delivery.trackingNumber && delivery.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         delivery.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || delivery.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: deliveries.length,
    inTransit: deliveries.filter(d => d.status === 'in_transit').length,
    delivered: deliveries.filter(d => d.status === 'delivered').length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return '#10b981';
      case 'in_transit': return '#3b82f6';
      case 'scheduled': return '#f59e0b';
      case 'pending': return '#6b7280';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
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
            <MdLocalShipping className={styles.titleIcon} />
            Доставка
          </h1>
        </div>

        <div className={styles.headerStats}>
          <div className={`${styles.statCard} ${styles.total}`}>
            <div className={styles.statValue}>{stats.total}</div>
            <div className={styles.statLabel}>Всего доставок</div>
          </div>
          <div className={`${styles.statCard} ${styles.active}`}>
            <div className={styles.statValue}>{stats.inTransit}</div>
            <div className={styles.statLabel}>В пути</div>
          </div>
          <div className={`${styles.statCard} ${styles.completed}`}>
            <div className={styles.statValue}>{stats.delivered}</div>
            <div className={styles.statLabel}>Доставлено</div>
          </div>
        </div>

        <div className={styles.filterGroup}>
          <div className={styles.searchBox}>
            <MdSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Поиск по трек-номеру или адресу..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">Все доставки</option>
            <option value="delivered">Доставлено</option>
            <option value="in_transit">В пути</option>
            <option value="scheduled">Запланировано</option>
            <option value="pending">Ожидает</option>
            <option value="cancelled">Отменено</option>
          </select>
        </div>
      </div>

      {filteredDeliveries.length === 0 ? (
        <div className={styles.emptyState}>
          <MdLocalShipping size={64} />
          <h3>Доставки не найдены</h3>
          <p>Попробуйте изменить параметры поиска</p>
        </div>
      ) : (
        <div className={styles.deliveryGrid}>
          {filteredDeliveries.map((delivery) => (
            <div key={delivery.id} className={styles.deliveryCard}>
              <div className={styles.deliveryHeader}>
                <h3>{delivery.orderTitle}</h3>
                <span 
                  className={styles.statusBadge}
                  style={{ backgroundColor: getStatusColor(delivery.status) }}
                >
                  {delivery.status === 'delivered' && 'Доставлено'}
                  {delivery.status === 'in_transit' && 'В пути'}
                  {delivery.status === 'scheduled' && 'Запланировано'}
                  {delivery.status === 'pending' && 'Ожидает'}
                  {delivery.status === 'cancelled' && 'Отменено'}
                </span>
              </div>

              <div className={styles.deliveryInfo}>
                {delivery.trackingNumber && (
                  <div className={styles.infoItem}>
                    <strong>Трек-номер:</strong> {delivery.trackingNumber}
                  </div>
                )}
                <div className={styles.infoItem}>
                  <MdLocationOn size={18} />
                  <span>{delivery.address}, {delivery.city}</span>
                </div>
                {delivery.scheduledDate && (
                  <div className={styles.infoItem}>
                    <strong>Дата доставки:</strong> {formatDate(delivery.scheduledDate)}
                  </div>
                )}
                {delivery.deliveredAt && (
                  <div className={styles.infoItem}>
                    <strong>Доставлено:</strong> {formatDate(delivery.deliveredAt)}
                  </div>
                )}
              </div>

              {delivery.courier && (
                <div className={styles.courierInfo}>
                  <div className={styles.courierHeader}>
                    <MdPerson size={18} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                    Курьер
                  </div>
                  <div className={styles.courierDetails}>
                    <div>{delivery.courier}</div>
                    <div className={styles.courierPhone}>
                      <MdPhone size={16} />
                      {delivery.courierPhone}
                    </div>
                  </div>
                </div>
              )}

              {delivery.notes && (
                <div className={styles.deliveryNotes}>
                  <strong>Примечания:</strong> {delivery.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Delivery;
