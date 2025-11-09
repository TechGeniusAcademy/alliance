import { useTranslation } from "react-i18next";
import { useState } from "react";
import styles from "./Portfolio.module.css";
import Footer from '../components/Footer';
import { MdFavorite, MdRemoveRedEye, MdStar } from 'react-icons/md';

const Portfolio = () => {
  const { t } = useTranslation();
  const [activeFilter, setActiveFilter] = useState('all');

  const filters = [
    { id: 'all', labelKey: 'portfolio.filterAll' },
    { id: 'kitchen', labelKey: 'portfolio.filterKitchen' },
    { id: 'bedroom', labelKey: 'portfolio.filterBedroom' },
    { id: 'living', labelKey: 'portfolio.filterLiving' },
    { id: 'office', labelKey: 'portfolio.filterOffice' },
    { id: 'custom', labelKey: 'portfolio.filterCustom' },
  ];

  const portfolioItems = [
    {
      id: 1,
      titleKey: 'portfolio.item1Title',
      descKey: 'portfolio.item1Desc',
      category: 'kitchen',
      categoryKey: 'portfolio.categoryKitchen',
      image: 'https://images.unsplash.com/photo-1556912173-46c336c7fd55?w=800&q=80',
      master: {
        name: 'Александр Иванов',
        role: 'Мастер высшей категории',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80'
      },
      likes: 324,
      views: 1520,
      rating: 4.9
    },
    {
      id: 2,
      titleKey: 'portfolio.item2Title',
      descKey: 'portfolio.item2Desc',
      category: 'bedroom',
      categoryKey: 'portfolio.categoryBedroom',
      image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&q=80',
      master: {
        name: 'Дмитрий Петров',
        role: 'Специалист по спальням',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80'
      },
      likes: 267,
      views: 1340,
      rating: 4.8
    },
    {
      id: 3,
      titleKey: 'portfolio.item3Title',
      descKey: 'portfolio.item3Desc',
      category: 'living',
      categoryKey: 'portfolio.categoryLiving',
      image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
      master: {
        name: 'Сергей Михайлов',
        role: 'Дизайнер интерьеров',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80'
      },
      likes: 412,
      views: 2100,
      rating: 5.0
    },
    {
      id: 4,
      titleKey: 'portfolio.item4Title',
      descKey: 'portfolio.item4Desc',
      category: 'office',
      categoryKey: 'portfolio.categoryOffice',
      image: 'https://images.unsplash.com/photo-1554295405-abb8fd54f153?w=800&q=80',
      master: {
        name: 'Иван Козлов',
        role: 'Эксперт по офисной мебели',
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&q=80'
      },
      likes: 198,
      views: 980,
      rating: 4.7
    },
    {
      id: 5,
      titleKey: 'portfolio.item5Title',
      descKey: 'portfolio.item5Desc',
      category: 'kitchen',
      categoryKey: 'portfolio.categoryKitchen',
      image: 'https://images.unsplash.com/photo-1565183997392-2f0f27d407f3?w=800&q=80',
      master: {
        name: 'Михаил Николаев',
        role: 'Мастер-столяр',
        avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&q=80'
      },
      likes: 356,
      views: 1680,
      rating: 4.9
    },
    {
      id: 6,
      titleKey: 'portfolio.item6Title',
      descKey: 'portfolio.item6Desc',
      category: 'custom',
      categoryKey: 'portfolio.categoryCustom',
      image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800&q=80',
      master: {
        name: 'Андрей Волков',
        role: 'Мастер-универсал',
        avatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=100&q=80'
      },
      likes: 445,
      views: 2350,
      rating: 5.0
    },
  ];

  const filteredItems = activeFilter === 'all' 
    ? portfolioItems 
    : portfolioItems.filter(item => item.category === activeFilter);

  return (
    <>
      <div className={styles.portfolioPage}>
        {/* Hero Section */}
        <section className={styles.heroSection}>
          <div className={styles.container}>
            <h1 className={styles.heroTitle}>
              {t('portfolio.heroTitle')} <span>{t('portfolio.heroHighlight')}</span>
            </h1>
            <p className={styles.heroDescription}>
              {t('portfolio.heroDescription')}
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

        {/* Portfolio Grid */}
        <section className={styles.portfolioSection}>
          <div className={styles.container}>
            <div className={styles.portfolioGrid}>
              {filteredItems.map(item => (
                <div key={item.id} className={styles.portfolioCard}>
                  <img src={item.image} alt={t(item.titleKey)} className={styles.portfolioImage} />
                  <div className={styles.portfolioContent}>
                    <div className={styles.portfolioHeader}>
                      <div>
                        <h3 className={styles.portfolioTitle}>{t(item.titleKey)}</h3>
                        <span className={styles.portfolioCategory}>{t(item.categoryKey)}</span>
                      </div>
                    </div>
                    <p className={styles.portfolioDescription}>{t(item.descKey)}</p>
                    
                    <div className={styles.portfolioMeta}>
                      <div className={styles.masterInfo}>
                        <img src={item.master.avatar} alt={item.master.name} className={styles.masterAvatar} />
                        <div className={styles.masterDetails}>
                          <div className={styles.masterName}>{item.master.name}</div>
                          <div className={styles.masterRole}>{item.master.role}</div>
                        </div>
                      </div>
                      
                      <div className={styles.portfolioStats}>
                        <div className={styles.stat}>
                          <MdStar className={styles.statIcon} />
                          <span>{item.rating}</span>
                        </div>
                        <div className={styles.stat}>
                          <MdFavorite className={styles.statIcon} />
                          <span>{item.likes}</span>
                        </div>
                        <div className={styles.stat}>
                          <MdRemoveRedEye className={styles.statIcon} />
                          <span>{item.views}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className={styles.ctaSection}>
          <div className={styles.container}>
            <h2 className={styles.ctaTitle}>{t('portfolio.ctaTitle')}</h2>
            <p className={styles.ctaDescription}>{t('portfolio.ctaDescription')}</p>
            <button className={styles.ctaButton}>{t('portfolio.ctaButton')}</button>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default Portfolio;
