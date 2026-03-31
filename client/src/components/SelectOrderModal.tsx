import { useTranslation } from 'react-i18next';
import { MdClose, MdCheckCircle } from 'react-icons/md';
import styles from './SelectOrderModal.module.css';

interface Order {
  id: number;
  title: string;
  status: string;
  created_at: string;
  final_price: number;
}

interface SelectOrderModalProps {
  orders: Order[];
  onSelect: (orderId: number) => void;
  onClose: () => void;
  title: string;
  subtitle: string;
  loading?: boolean;
}

const SelectOrderModal = ({ 
  orders, 
  onSelect, 
  onClose, 
  title, 
  subtitle,
  loading = false 
}: SelectOrderModalProps) => {
  const { t } = useTranslation();

  const getStatusLabel = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'in_progress': t('selectOrder.status.inProgress'),
      'review': t('selectOrder.status.review'),
    };
    return statusMap[status] || status;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU').format(price) + ' ₸';
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div>
            <h2>{title}</h2>
            <p className={styles.subtitle}>{subtitle}</p>
          </div>
          <button onClick={onClose} className={styles.closeButton}>
            <MdClose size={24} />
          </button>
        </div>

        <div className={styles.content}>
          {loading ? (
            <div className={styles.loading}>
              <div className={styles.spinner}></div>
              <p>{t('selectOrder.loading')}</p>
            </div>
          ) : orders.length === 0 ? (
            <div className={styles.empty}>
              <p>{t('selectOrder.noOrders')}</p>
            </div>
          ) : (
            <div className={styles.ordersList}>
              {orders.map((order) => (
                <div 
                  key={order.id} 
                  className={styles.orderCard}
                  onClick={() => onSelect(order.id)}
                >
                  <div className={styles.orderInfo}>
                    <h3>{order.title}</h3>
                    <div className={styles.orderMeta}>
                      <span className={`${styles.status} ${styles[order.status]}`}>
                        {getStatusLabel(order.status)}
                      </span>
                      <span className={styles.date}>{formatDate(order.created_at)}</span>
                    </div>
                    <div className={styles.price}>
                      {formatPrice(order.final_price)}
                    </div>
                  </div>
                  <MdCheckCircle className={styles.selectIcon} size={24} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SelectOrderModal;
