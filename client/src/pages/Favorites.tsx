import { useState, useEffect } from 'react';
import { orderService } from '../services/orderService';
import type { Favorite } from '../types/order';
import OrderCard from '../components/OrderCard';
import { MdSearch, MdFavorite, MdFavoriteBorder } from 'react-icons/md';
import styles from './Orders.module.css';

const Favorites = () => {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const data = await orderService.getFavorites();
      setFavorites(data);
    } catch (error) {
      console.error('Failed to load favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFavoriteToggle = async (orderId: number, isFavorite: boolean) => {
    try {
      if (!isFavorite) {
        await orderService.removeFromFavorites(orderId);
        setFavorites(prev => prev.filter(fav => fav.orderId !== orderId));
      }
    } catch (error) {
      console.error('Failed to remove from favorites:', error);
    }
  };

  const filteredFavorites = favorites.filter(fav =>
    fav.order.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    fav.order.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPrice = favorites.reduce((sum, fav) => {
    const price = fav.order.price.final || fav.order.price.max;
    return sum + price;
  }, 0);

  return (
    <div className={styles.ordersPage}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>
            <MdFavorite className={styles.titleIcon} style={{ color: '#ef4444' }} />
            Избранное
          </h1>
          <p className={styles.pageSubtitle}>Ваши любимые заказы и дизайны</p>
        </div>
        <div className={styles.headerStats}>
          <div className={`${styles.statCard} ${styles.statCardFavorite}`}>
            <div className={styles.statValue}>{favorites.length}</div>
            <div className={styles.statLabel}>В избранном</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{totalPrice.toLocaleString('ru-RU')} ₸</div>
            <div className={styles.statLabel}>Общая стоимость</div>
          </div>
        </div>
      </div>

      <div className={styles.filters}>
        <div className={styles.searchBox}>
          <MdSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Поиск в избранном..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        {favorites.length > 0 && (
          <button 
            className={styles.clearAllBtn}
            onClick={async () => {
              if (window.confirm('Удалить все из избранного?')) {
                for (const fav of favorites) {
                  await orderService.removeFromFavorites(fav.orderId);
                }
                setFavorites([]);
              }
            }}
          >
            Очистить избранное
          </button>
        )}
      </div>

      {loading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.loader}></div>
          <p>Загрузка избранного...</p>
        </div>
      ) : filteredFavorites.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <MdFavoriteBorder size={64} />
          </div>
          <h3>Избранное пусто</h3>
          <p>Добавьте заказы в избранное, чтобы быстро находить их</p>
        </div>
      ) : (
        <div className={styles.ordersGrid}>
          {filteredFavorites.map(fav => (
            <OrderCard
              key={fav.id}
              order={fav.order}
              onFavoriteToggle={handleFavoriteToggle}
              isFavorite={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
