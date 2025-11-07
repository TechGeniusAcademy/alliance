import { useState, useEffect } from 'react';
import { 
  MdCardGiftcard, 
  MdSearch, 
  MdContentCopy,
  MdDiscount
} from 'react-icons/md';
import { appService } from '../services/appService';
import type { PromoCode } from '../types/app';
import styles from './Orders.module.css';

const PromoCodes = () => {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadPromoCodes();
  }, []);

  const loadPromoCodes = async () => {
    try {
      setLoading(true);
      const data = await appService.getPromoCodes();
      setPromoCodes(data);
    } catch (error) {
      console.error('Failed to load promo codes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPromoCodes = promoCodes.filter(promo => 
    promo.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    promo.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activePromoCodes = filteredPromoCodes.filter(p => p.isActive);
  const usedPromoCodes = filteredPromoCodes.filter(p => p.status === 'used');

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    alert(`Промокод ${code} скопирован!`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
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
            <MdCardGiftcard className={styles.titleIcon} />
            Промокоды
          </h1>
        </div>

        <div className={styles.headerStats}>
          <div className={`${styles.statCard} ${styles.active}`}>
            <div className={styles.statValue}>{activePromoCodes.length}</div>
            <div className={styles.statLabel}>Активные</div>
          </div>
          <div className={`${styles.statCard} ${styles.completed}`}>
            <div className={styles.statValue}>{usedPromoCodes.length}</div>
            <div className={styles.statLabel}>Использованные</div>
          </div>
        </div>

        <div className={styles.filterGroup}>
          <div className={styles.searchBox}>
            <MdSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Поиск промокода..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {filteredPromoCodes.length === 0 ? (
        <div className={styles.emptyState}>
          <MdCardGiftcard size={64} />
          <h3>Промокоды не найдены</h3>
          <p>У вас пока нет доступных промокодов</p>
        </div>
      ) : (
        <div className={styles.promoGrid}>
          {filteredPromoCodes.map((promo) => (
            <div 
              key={promo.id} 
              className={`${styles.promoCard} ${!promo.isActive ? styles.promoInactive : ''}`}
            >
              <div className={styles.promoHeader}>
                <div className={styles.promoCode}>
                  {promo.code}
                  <button 
                    className={styles.copyButton}
                    onClick={() => copyToClipboard(promo.code)}
                    disabled={!promo.isActive}
                  >
                    <MdContentCopy size={18} />
                  </button>
                </div>
                <span 
                  className={styles.statusBadge}
                  style={{ 
                    backgroundColor: promo.isActive ? '#10b981' : '#6b7280' 
                  }}
                >
                  {promo.status === 'active' && 'Активен'}
                  {promo.status === 'used' && 'Использован'}
                  {promo.status === 'expired' && 'Истек'}
                </span>
              </div>

              <div className={styles.promoDescription}>
                {promo.description}
              </div>

              <div className={styles.promoDiscount}>
                {promo.discountType === 'percentage' && (
                  <span className={styles.discountValue}>
                    <MdDiscount size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                    -{promo.discountValue}%
                  </span>
                )}
                {promo.discountType === 'fixed' && (
                  <span className={styles.discountValue}>
                    <MdDiscount size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                    -{promo.discountValue.toLocaleString()} ₸
                  </span>
                )}
              </div>

              <div className={styles.promoDetails}>
                {promo.minOrderAmount && (
                  <div className={styles.promoDetail}>
                    <strong>Минимальный заказ:</strong> {promo.minOrderAmount.toLocaleString()} ₸
                  </div>
                )}
                {promo.maxDiscount && (
                  <div className={styles.promoDetail}>
                    <strong>Макс. скидка:</strong> {promo.maxDiscount.toLocaleString()} ₸
                  </div>
                )}
                <div className={styles.promoDetail}>
                  <strong>Действует до:</strong> {formatDate(promo.validUntil)}
                </div>
                {promo.usageLimit && (
                  <div className={styles.promoDetail}>
                    <strong>Использований:</strong> {promo.usageCount} / {promo.usageLimit}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PromoCodes;
