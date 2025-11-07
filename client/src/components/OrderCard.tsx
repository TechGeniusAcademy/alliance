import type { Order } from '../types/order';
import { MdAccessTime, MdLocationOn, MdAttachMoney, MdPeople, MdFavorite, MdFavoriteBorder } from 'react-icons/md';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import styles from './OrderCard.module.css';

interface OrderCardProps {
  order: Order;
  onFavoriteToggle?: (orderId: number, isFavorite: boolean) => void;
  isFavorite?: boolean;
  showActions?: boolean;
}

// Компонент модального окна
const OrderDetailsModal = ({ order, onClose }: { order: Order; onClose: () => void }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('ru-RU');
  };

  const getStatusLabel = (status: Order['status']) => {
    const labels: Record<string, string> = {
      pending: 'Ожидает',
      active: 'Активен',
      auction: 'На аукционе',
      in_progress: 'В работе',
      completed: 'Завершён',
      cancelled: 'Отменён'
    };
    return labels[status] || status;
  };

  const getStatusClass = (status: Order['status']) => {
    return styles[`status${status.charAt(0).toUpperCase() + status.slice(1).replace('_', '')}`];
  };

  return createPortal(
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.modalClose} onClick={onClose}>
          ×
        </button>

        <h2 className={styles.modalTitle}>{order.title}</h2>

        {order.images && order.images.length > 0 && (
          <div className={styles.modalImages}>
            {order.images.map((img, index) => (
              <img key={index} src={img} alt={`${order.title} ${index + 1}`} className={styles.modalImage} />
            ))}
          </div>
        )}

        <div className={styles.modalSection}>
          <h3>Описание</h3>
          <p>{order.description}</p>
        </div>

        <div className={styles.modalSection}>
          <h3>Детали заказа</h3>
          <div className={styles.modalDetails}>
            <div className={styles.modalDetailRow}>
              <span className={styles.modalLabel}>Тип мебели:</span>
              <span>{order.furnitureType || 'Не указан'}</span>
            </div>
            {order.dimensions && (
              <div className={styles.modalDetailRow}>
                <span className={styles.modalLabel}>Размеры:</span>
                <span>
                  {order.dimensions.width} × {order.dimensions.height} × {order.dimensions.depth} см
                </span>
              </div>
            )}
            <div className={styles.modalDetailRow}>
              <span className={styles.modalLabel}>Бюджет:</span>
              <span>
                {order.price.final 
                  ? `${formatPrice(order.price.final)} ₸`
                  : `${formatPrice(order.price.min)} - ${formatPrice(order.price.max)} ₸`
                }
              </span>
            </div>
            <div className={styles.modalDetailRow}>
              <span className={styles.modalLabel}>Крайний срок:</span>
              <span>{formatDate(order.deadline)}</span>
            </div>
            <div className={styles.modalDetailRow}>
              <span className={styles.modalLabel}>Статус:</span>
              <span className={`${styles.statusBadge} ${getStatusClass(order.status)}`}>
                {getStatusLabel(order.status)}
              </span>
            </div>
          </div>
        </div>

        {order.materials && order.materials.length > 0 && (
          <div className={styles.modalSection}>
            <h3>Материалы</h3>
            <div className={styles.materials}>
              {order.materials.map((material, index) => (
                <span key={index} className={styles.materialTag}>
                  {material}
                </span>
              ))}
            </div>
          </div>
        )}

        {order.deliveryAddress && (
          <div className={styles.modalSection}>
            <h3>Доставка</h3>
            <div className={styles.modalDetailRow}>
              <span className={styles.modalLabel}>Адрес доставки:</span>
              <span>{order.deliveryAddress}</span>
            </div>
          </div>
        )}

        {order.notes && (
          <div className={styles.modalSection}>
            <h3>Примечания</h3>
            <p>{order.notes}</p>
          </div>
        )}

        {order.sellerName && (
          <div className={styles.modalSection}>
            <h3>Исполнитель</h3>
            <div className={styles.modalDetailRow}>
              <span className={styles.modalLabel}>Имя:</span>
              <span>{order.sellerName}</span>
            </div>
            {order.price.final && (
              <div className={styles.modalDetailRow}>
                <span className={styles.modalLabel}>Итоговая цена:</span>
                <span className={styles.modalPriceFinal}>{formatPrice(order.price.final)} ₸</span>
              </div>
            )}
          </div>
        )}

        <div className={styles.modalSection}>
          <h3>Статистика</h3>
          <div className={styles.modalDetailRow}>
            <span className={styles.modalLabel}>Количество предложений:</span>
            <span>{order.bidsCount}</span>
          </div>
          <div className={styles.modalDetailRow}>
            <span className={styles.modalLabel}>Создан:</span>
            <span>{formatDate(order.createdAt)}</span>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

// Основной компонент карточки
const OrderCard = ({ order, onFavoriteToggle, isFavorite = false, showActions = true }: OrderCardProps) => {
  const [favorite, setFavorite] = useState(isFavorite);
  const [showModal, setShowModal] = useState(false);

  const getStatusLabel = (status: Order['status']) => {
    const labels: Record<string, string> = {
      pending: 'Ожидает',
      active: 'Активен',
      auction: 'На аукционе',
      in_progress: 'В работе',
      completed: 'Завершён',
      cancelled: 'Отменён'
    };
    return labels[status] || status;
  };

  const getStatusClass = (status: Order['status']) => {
    return styles[`status${status.charAt(0).toUpperCase() + status.slice(1).replace('_', '')}`];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('ru-RU');
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newFavoriteState = !favorite;
    setFavorite(newFavoriteState);
    onFavoriteToggle?.(order.id, newFavoriteState);
  };

  return (
    <>
      <div className={styles.orderCard}>
        <div className={styles.cardHeader}>
          <div className={styles.imageContainer}>
            {order.images && order.images.length > 0 ? (
              <img src={order.images[0]} alt={order.title} className={styles.orderImage} />
            ) : (
              <div className={styles.imagePlaceholder}>
                <span className={styles.placeholderIcon}>🪑</span>
              </div>
            )}
            <span className={`${styles.statusBadge} ${getStatusClass(order.status)}`}>
              {getStatusLabel(order.status)}
            </span>
          </div>
          {showActions && (
            <button 
              className={`${styles.favoriteBtn} ${favorite ? styles.favoriteActive : ''}`}
              onClick={handleFavoriteClick}
              aria-label="Add to favorites"
            >
              {favorite ? <MdFavorite size={24} /> : <MdFavoriteBorder size={24} />}
            </button>
          )}
        </div>

        <div className={styles.cardBody}>
          <h3 className={styles.orderTitle}>{order.title}</h3>
          <p className={styles.orderDescription}>{order.description}</p>

          <div className={styles.orderDetails}>
            <div className={styles.detailItem}>
              <MdAttachMoney className={styles.detailIcon} />
              <span className={styles.detailText}>
                {order.price.final 
                  ? `${formatPrice(order.price.final)} ₸`
                  : `${formatPrice(order.price.min)} - ${formatPrice(order.price.max)} ₸`
                }
              </span>
            </div>

            <div className={styles.detailItem}>
              <MdAccessTime className={styles.detailIcon} />
              <span className={styles.detailText}>
                Срок: {formatDate(order.deadline)}
              </span>
            </div>

            {order.deliveryAddress && (
              <div className={styles.detailItem}>
                <MdLocationOn className={styles.detailIcon} />
                <span className={styles.detailText}>{order.deliveryAddress}</span>
              </div>
            )}

            <div className={styles.detailItem}>
              <MdPeople className={styles.detailIcon} />
              <span className={styles.detailText}>
                {order.bidsCount} {order.bidsCount === 1 ? 'предложение' : 'предложений'}
              </span>
            </div>
          </div>

          {order.materials && order.materials.length > 0 && (
            <div className={styles.materials}>
              {order.materials.map((material, index) => (
                <span key={index} className={styles.materialTag}>
                  {material}
                </span>
              ))}
            </div>
          )}

          {order.sellerName && (
            <div className={styles.sellerInfo}>
              <span className={styles.sellerLabel}>Исполнитель:</span>
              <span className={styles.sellerName}>{order.sellerName}</span>
            </div>
          )}
        </div>

        <div className={styles.cardFooter}>
          <button className={styles.detailsBtn} onClick={() => setShowModal(true)}>Подробнее</button>
          {order.status === 'active' && (
            <button className={styles.bidBtn}>Оставить заявку</button>
          )}
        </div>
      </div>

      {showModal && (
        <OrderDetailsModal 
          order={order}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
};

export default OrderCard;
