import { useState, useEffect } from 'react';
import { MdLocalOffer, MdSearch } from 'react-icons/md';
import { appService } from '../services/appService';
import type { SpecialOffer } from '../types/app';
import styles from './Orders.module.css';

const SpecialOffers = () => {
  const [offers, setOffers] = useState<SpecialOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadOffers();
  }, []);

  const loadOffers = async () => {
    try {
      setLoading(true);
      const data = await appService.getSpecialOffers();
      setOffers(data);
    } catch (error) {
      console.error('Failed to load offers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOffers = offers.filter(offer => 
    offer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    offer.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const copyPromoCode = (code: string) => {
    navigator.clipboard.writeText(code);
    alert(`Промокод ${code} скопирован!`);
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
            <MdLocalOffer className={styles.titleIcon} />
            Специальные предложения
          </h1>
        </div>

        <div className={styles.headerStats}>
          <div className={`${styles.statCard} ${styles.active}`}>
            <div className={styles.statValue}>{offers.length}</div>
            <div className={styles.statLabel}>Активных акций</div>
          </div>
        </div>

        <div className={styles.filterGroup}>
          <div className={styles.searchBox}>
            <MdSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Поиск предложений..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {filteredOffers.length === 0 ? (
        <div className={styles.emptyState}>
          <MdLocalOffer size={64} />
          <h3>Нет активных предложений</h3>
          <p>Следите за новыми акциями и скидками</p>
        </div>
      ) : (
        <div className={styles.offersGrid}>
          {filteredOffers.map((offer) => (
            <div key={offer.id} className={styles.offerCard}>
              <div className={styles.offerImage}>
                <img src={offer.image} alt={offer.title} />
                <div className={styles.offerBadge}>
                  {offer.discountType === 'percentage' && (
                    <span>-{offer.discountValue}%</span>
                  )}
                  {offer.discountType === 'fixed' && offer.discountValue > 0 && (
                    <span>-{offer.discountValue.toLocaleString()} ₸</span>
                  )}
                </div>
              </div>

              <div className={styles.offerContent}>
                <h2>{offer.title}</h2>
                <p>{offer.description}</p>

                {offer.promoCode && (
                  <div className={styles.promoCodeBox}>
                    <span className={styles.promoLabel}>Промокод:</span>
                    <code className={styles.promoCode}>{offer.promoCode}</code>
                    <button 
                      className={styles.copyButton}
                      onClick={() => copyPromoCode(offer.promoCode!)}
                    >
                      Копировать
                    </button>
                  </div>
                )}

                <div className={styles.offerValidity}>
                  <span>Действует до: {formatDate(offer.validUntil)}</span>
                </div>

                {offer.termsAndConditions && offer.termsAndConditions.length > 0 && (
                  <div className={styles.offerTerms}>
                    <strong>Условия:</strong>
                    <ul>
                      {offer.termsAndConditions.map((term, idx) => (
                        <li key={idx}>{term}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <button className={styles.useOfferButton}>
                  Использовать предложение
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SpecialOffers;
