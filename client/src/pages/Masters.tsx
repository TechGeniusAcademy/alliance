import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import styles from './Masters.module.css';
import Footer from '../components/Footer';
import { MdVerified, MdStar, MdWorkOutline, MdThumbUp } from 'react-icons/md';
import { masterService, type MasterPublicProfile } from '../services/masterService';

const Masters = () => {
  const { t } = useTranslation();
  const [masters, setMasters] = useState<MasterPublicProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    loadMasters();
  }, []);

  const loadMasters = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await masterService.getAllMasters();
      setMasters(data);
    } catch (err) {
      console.error('Error loading masters:', err);
      setError('Failed to load masters');
    } finally {
      setLoading(false);
    }
  };

  const filters = [
    { id: 'all', labelKey: 'masters.filterAll' },
    { id: 'kitchen', labelKey: 'masters.filterKitchen' },
    { id: 'bedroom', labelKey: 'masters.filterBedroom' },
    { id: 'living', labelKey: 'masters.filterLiving' },
    { id: 'office', labelKey: 'masters.filterOffice' },
  ];

  const getFilteredMasters = () => {
    if (activeFilter === 'all') return masters;
    return masters.filter(master => 
      master.specialty?.toLowerCase().includes(activeFilter) ||
      master.skills?.some(skill => skill.toLowerCase().includes(activeFilter))
    );
  };

  const filteredMasters = getFilteredMasters();

  const getAvatarUrl = (master: MasterPublicProfile) => {
    if (master.profilePicture) {
      // Если это уже полный URL (начинается с http), используем как есть
      if (master.profilePicture.startsWith('http')) {
        return master.profilePicture;
      }
      // Если это относительный путь, добавляем адрес сервера
      return `http://localhost:5000${master.profilePicture}`;
    }
    // Default avatars based on name hash
    const avatars = [
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80',
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&q=80',
    ];
    const index = master.id % avatars.length;
    return avatars[index];
  };

  return (
    <>
      <div className={styles.mastersPage}>
        {/* Hero Section */}
        <section className={styles.heroSection}>
          <div className={styles.container}>
            <h1 className={styles.heroTitle}>
              {t('masters.heroTitle')} <span>{t('masters.heroHighlight')}</span>
            </h1>
            <p className={styles.heroDescription}>
              {t('masters.heroDescription')}
            </p>
          </div>
        </section>

        {/* Filter Section */}
        <section className={styles.filterSection}>
          <div className={styles.container}>
            <div className={styles.filters}>
              {filters.map(filter => (
                <button
                  key={filter.id}
                  className={`${styles.filterButton} ${activeFilter === filter.id ? styles.active : ''}`}
                  onClick={() => setActiveFilter(filter.id)}
                >
                  {t(filter.labelKey)}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Masters Grid */}
        <section className={styles.mastersSection}>
          <div className={styles.container}>
            {loading ? (
              <div className={styles.loadingContainer}>
                {t('masters.loading')}
              </div>
            ) : error ? (
              <div className={styles.errorContainer}>
                <div className={styles.errorText}>{t('masters.error')}</div>
                <button className={styles.retryButton} onClick={loadMasters}>
                  {t('masters.retry')}
                </button>
              </div>
            ) : filteredMasters.length === 0 ? (
              <div className={styles.emptyState}>
                {t('masters.noMasters')}
              </div>
            ) : (
              <div className={styles.mastersGrid}>
                {filteredMasters.map(master => (
                  <div key={master.id} className={styles.masterCard}>
                    <div className={styles.masterHeader}>
                      {master.verified && (
                        <div className={styles.verifiedBadge}>
                          <MdVerified className={styles.verifiedIcon} />
                          {t('masters.verified')}
                        </div>
                      )}
                      <img 
                        src={getAvatarUrl(master)} 
                        alt={master.name}
                        className={styles.masterAvatar}
                      />
                    </div>
                    
                    <div className={styles.masterContent}>
                      <h3 className={styles.masterName}>{master.name}</h3>
                      <p className={styles.masterSpecialty}>
                        {master.specialty || t('masters.generalMaster')}
                      </p>

                      <div className={styles.masterStats}>
                        <div className={styles.stat}>
                          <div className={styles.statValue}>
                            <MdStar className={styles.statIcon} />
                            {master.rating ? Number(master.rating).toFixed(1) : '5.0'}
                          </div>
                          <div className={styles.statLabel}>{t('masters.rating')}</div>
                        </div>
                        <div className={styles.stat}>
                          <div className={styles.statValue}>
                            <MdWorkOutline className={styles.statIcon} />
                            {master.completedOrders || 0}
                          </div>
                          <div className={styles.statLabel}>{t('masters.orders')}</div>
                        </div>
                        <div className={styles.stat}>
                          <div className={styles.statValue}>
                            <MdThumbUp className={styles.statIcon} />
                            {master.experience || 0}
                          </div>
                          <div className={styles.statLabel}>{t('masters.experience')}</div>
                        </div>
                      </div>

                      {master.skills && master.skills.length > 0 && (
                        <div className={styles.masterSkills}>
                          {master.skills.slice(0, 3).map((skill, index) => (
                            <span key={index} className={styles.skillBadge}>
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className={styles.masterActions}>
                        <button className={styles.viewProfileButton}>
                          {t('masters.viewProfile')}
                        </button>
                        <button className={styles.messageButton}>
                          {t('masters.message')}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className={styles.ctaSection}>
          <div className={styles.container}>
            <h2 className={styles.ctaTitle}>{t('masters.ctaTitle')}</h2>
            <p className={styles.ctaDescription}>{t('masters.ctaDescription')}</p>
            <button className={styles.ctaButton}>{t('masters.ctaButton')}</button>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default Masters;
