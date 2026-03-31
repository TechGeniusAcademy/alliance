import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../../config/api';
import { FiStar, FiMapPin, FiArrowRight, FiCheckCircle } from 'react-icons/fi';
import { useLanguage } from '../../../context/LanguageContext';
import { ROUTES } from '../../../constants';
import { Button } from '../../ui/Button';
import styles from './TopMasters.module.css';

interface Master {
  id: string;
  name: string;
  avatar: string;
  specialization: string;
  rating: number;
  reviewsCount: number;
  projectsCount: number;
  city: string;
  isVerified: boolean;
  isPro: boolean;
}

interface MasterResponse {
  id: number;
  name: string;
  profilePicture: string;
  specialty: string;
  rating: string;
  reviews_count: number;
  completedOrders: number;
  address: string;
  is_verified: boolean;
  is_pro: boolean;
  active: boolean;
}

export const TopMasters = () => {
  const { t } = useLanguage();
  const [masters, setMasters] = useState<Master[]>([]);
  const [loading, setLoading] = useState(true);

  // Загрузка топ мастеров из базы данных
  useEffect(() => {
    const fetchTopMasters = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/masters/public`);
        console.log('Top Masters API response:', response.data);
        // Берем только топ 4 мастера с наивысшим рейтингом
        const topMasters = response.data
          .sort((a: MasterResponse, b: MasterResponse) => (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0))
          .slice(0, 4)
          .map((master: MasterResponse) => {
            console.log('Top Master data:', { id: master.id, name: master.name, profilePicture: master.profilePicture });
            return {
            id: master.id.toString(),
            name: master.name,
            avatar: master.profilePicture || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
            specialization: master.specialty 
              ? t(`${master.specialty}`) 
              : t('mastersPage.specializations.kitchen'),
            rating: parseFloat(master.rating) || 4.5,
            reviewsCount: master.reviews_count || 0,
            projectsCount: master.completedOrders || 0,
            city: master.address || 'Алматы',
            isVerified: master.is_verified || false,
            isPro: master.is_pro || false
          };
          });
        setMasters(topMasters);
      } catch (error) {
        console.error('Ошибка загрузки топ мастеров:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTopMasters();
  }, [t]);

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <h2 className={styles.title}>{t('topMasters.title')}</h2>
            <p className={styles.subtitle}>{t('topMasters.subtitle')}</p>
          </div>
          <Button 
            variant="outline" 
            as={Link} 
            to={ROUTES.MASTERS}
            rightIcon={<FiArrowRight />}
          >
            {t('topMasters.viewAll')}
          </Button>
        </div>

        <div className={styles.grid}>
          {loading ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>
              {t('topMasters.loading') || 'Загрузка...'}
            </div>
          ) : masters.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>
              {t('topMasters.noMasters') || 'Мастера не найдены'}
            </div>
          ) : (
            masters.map((master) => (
            <Link
              key={master.id}
              to={`${ROUTES.MASTERS}/${master.id}`}
              className={styles.card}
            >
              <div className={styles.cardHeader}>
                <div className={styles.avatar}>
                  {master.avatar ? (
                    <img src={master.avatar} alt={master.name} />
                  ) : (
                    <span className={styles.avatarInitial}>
                      {master.name.charAt(0)}
                    </span>
                  )}
                  {master.isVerified && (
                    <div className={styles.verifiedBadge}>
                      <FiCheckCircle />
                    </div>
                  )}
                </div>
                {master.isPro && (
                  <div className={styles.proBadge}>PRO</div>
                )}
              </div>

              <div className={styles.cardBody}>
                <h3 className={styles.name}>{master.name}</h3>
                <p className={styles.specialization}>{master.specialization}</p>
                
                <div className={styles.location}>
                  <FiMapPin />
                  <span>{master.city}</span>
                </div>

                <div className={styles.stats}>
                  <div className={styles.rating}>
                    <FiStar className={styles.starIcon} />
                    <span className={styles.ratingValue}>{master.rating}</span>
                    <span className={styles.reviewsCount}>({master.reviewsCount})</span>
                  </div>
                  <div className={styles.projects}>
                    {master.projectsCount} {t('topMasters.projects')}
                  </div>
                </div>
              </div>
            </Link>
          )))
          }
        </div>
      </div>
    </section>
  );
};
