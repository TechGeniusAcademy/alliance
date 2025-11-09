import { useState, useEffect } from 'react';
import { 
  MdLocalShipping, 
  MdSearch, 
  MdPhone, 
  MdLocationOn,
  MdPerson,
  MdCheckCircle
} from 'react-icons/md';
import { orderService } from '../services/orderService';
import styles from './Orders.module.css';

interface DeliveryOrder {
  id: number;
  title: string;
  delivery_address: string;
  delivery_status: string;
  shipped_at: string | null;
  delivered_at: string | null;
  tracking_number: string | null;
  delivery_notes: string | null;
  assigned_master_name: string | null;
  assigned_master_phone: string | null;
}

const Delivery = () => {
  const [deliveries, setDeliveries] = useState<DeliveryOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadDeliveries();
  }, []);

  const loadDeliveries = async () => {
    try {
      setLoading(true);
      const orders = await orderService.getMyOrders();
      // Фильтруем только заказы с назначенным мастером и требующие доставки
      const ordersWithDelivery = orders.filter((order) => 
        order.sellerId && order.deliveryAddress
      ).map((order) => ({
        id: order.id,
        title: order.title,
        delivery_address: order.deliveryAddress || '',
        delivery_status: 'pending', // будет загружено отдельно
        shipped_at: null,
        delivered_at: null,
        tracking_number: null,
        delivery_notes: null,
        assigned_master_name: order.sellerName || null,
        assigned_master_phone: null,
      }));

      // Загружаем детальную информацию о доставке для каждого заказа
      const deliveriesWithDetails = await Promise.all(
        ordersWithDelivery.map(async (delivery) => {
          try {
            const details = await orderService.getOrderDelivery(delivery.id);
            return { ...delivery, ...details };
          } catch {
            return delivery; // если не удалось загрузить детали, возвращаем как есть
          }
        })
      );

      setDeliveries(deliveriesWithDetails);
    } catch (error) {
      console.error('Failed to load deliveries:', error);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelivery = async (orderId: number) => {
    if (!confirm('Подтвердить получение заказа?')) return;
    
    try {
      await orderService.confirmDelivery(orderId);
      alert('Доставка подтверждена!');
      loadDeliveries();
    } catch (error) {
      console.error('Failed to confirm delivery:', error);
      alert('Ошибка при подтверждении доставки');
    }
  };

  const filteredDeliveries = deliveries.filter(delivery => {
    const matchesSearch = delivery.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (delivery.tracking_number && delivery.tracking_number.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         delivery.delivery_address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || delivery.delivery_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: deliveries.length,
    inTransit: deliveries.filter(d => d.delivery_status === 'shipped').length,
    delivered: deliveries.filter(d => d.delivery_status === 'delivered').length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return '#10b981';
      case 'shipped': return '#3b82f6';
      case 'pending': return '#f59e0b';
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
                <h3>{delivery.title}</h3>
                <span 
                  className={styles.statusBadge}
                  style={{ backgroundColor: getStatusColor(delivery.delivery_status) }}
                >
                  {delivery.delivery_status === 'delivered' && 'Доставлено'}
                  {delivery.delivery_status === 'shipped' && 'Отправлено'}
                  {delivery.delivery_status === 'pending' && 'Ожидает отправки'}
                </span>
              </div>

              <div className={styles.deliveryInfo}>
                {delivery.tracking_number && (
                  <div className={styles.infoItem}>
                    <strong>Трек-номер:</strong> {delivery.tracking_number}
                  </div>
                )}
                <div className={styles.infoItem}>
                  <MdLocationOn size={18} />
                  <span>{delivery.delivery_address}</span>
                </div>
                {delivery.shipped_at && (
                  <div className={styles.infoItem}>
                    <strong>Отправлено:</strong> {formatDate(delivery.shipped_at)}
                  </div>
                )}
                {delivery.delivered_at && (
                  <div className={styles.infoItem}>
                    <strong>Доставлено:</strong> {formatDate(delivery.delivered_at)}
                  </div>
                )}
              </div>

              {delivery.assigned_master_name && (
                <div className={styles.courierInfo}>
                  <div className={styles.courierHeader}>
                    <MdPerson size={18} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                    Мастер
                  </div>
                  <div className={styles.courierDetails}>
                    <div>{delivery.assigned_master_name}</div>
                    {delivery.assigned_master_phone && (
                      <div className={styles.courierPhone}>
                        <MdPhone size={16} />
                        {delivery.assigned_master_phone}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {delivery.delivery_notes && (
                <div className={styles.deliveryNotes}>
                  <strong>Примечания:</strong> {delivery.delivery_notes}
                </div>
              )}

              {delivery.delivery_status === 'shipped' && (
                <button 
                  className={styles.confirmButton}
                  onClick={() => confirmDelivery(delivery.id)}
                >
                  <MdCheckCircle size={20} />
                  Подтвердить получение
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Delivery;
