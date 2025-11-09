import { useTranslation } from 'react-i18next';
import Footer from '../components/Footer';
import styles from './Services.module.css';
import { MdChair, MdKitchen, MdBed, MdWeekend, MdTableRestaurant, MdDoorFront, MdCheckCircle } from 'react-icons/md';

const Services = () => {
  const { t } = useTranslation();

  const services = [
    {
      icon: <MdKitchen />,
      titleKey: 'services.kitchen.title',
      descKey: 'services.kitchen.desc',
      features: [
        'services.kitchen.feature1',
        'services.kitchen.feature2',
        'services.kitchen.feature3',
        'services.kitchen.feature4',
      ],
      priceKey: 'services.kitchen.price',
      image: 'https://www.nur-mebel.kz/wp-content/uploads/2022/05/1-1-1.png'
    },
    {
      icon: <MdBed />,
      titleKey: 'services.bedroom.title',
      descKey: 'services.bedroom.desc',
      features: [
        'services.bedroom.feature1',
        'services.bedroom.feature2',
        'services.bedroom.feature3',
        'services.bedroom.feature4',
      ],
      priceKey: 'services.bedroom.price',
      image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&q=80'
    },
    {
      icon: <MdTableRestaurant />,
      titleKey: 'services.dining.title',
      descKey: 'services.dining.desc',
      features: [
        'services.dining.feature1',
        'services.dining.feature2',
        'services.dining.feature3',
        'services.dining.feature4',
      ],
      priceKey: 'services.dining.price',
      image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800&q=80'
    },
    {
      icon: <MdWeekend />,
      titleKey: 'services.living.title',
      descKey: 'services.living.desc',
      features: [
        'services.living.feature1',
        'services.living.feature2',
        'services.living.feature3',
        'services.living.feature4',
      ],
      priceKey: 'services.living.price',
      image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80'
    },
    {
      icon: <MdChair />,
      titleKey: 'services.office.title',
      descKey: 'services.office.desc',
      features: [
        'services.office.feature1',
        'services.office.feature2',
        'services.office.feature3',
        'services.office.feature4',
      ],
      priceKey: 'services.office.price',
      image: 'https://images.unsplash.com/photo-1554295405-abb8fd54f153?w=800&q=80'
    },
    {
      icon: <MdDoorFront />,
      titleKey: 'services.wardrobe.title',
      descKey: 'services.wardrobe.desc',
      features: [
        'services.wardrobe.feature1',
        'services.wardrobe.feature2',
        'services.wardrobe.feature3',
        'services.wardrobe.feature4',
      ],
      priceKey: 'services.wardrobe.price',
      image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800&q=80'
    }
  ];

  return (
    <>
      <div className={styles.servicesPage}>
        {/* Hero Section */}
        <section className={styles.heroSection}>
          <div className={styles.container}>
            <h1 className={styles.heroTitle}>
              {t('services.heroTitle')} <span>{t('services.heroHighlight')}</span>
            </h1>
            <p className={styles.heroDescription}>
              {t('services.heroDescription')}
            </p>
          </div>
        </section>

        {/* Services Grid */}
        <section className={styles.servicesSection}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>{t('services.sectionTitle')}</h2>
            <p className={styles.sectionSubtitle}>{t('services.sectionSubtitle')}</p>
            
            <div className={styles.servicesGrid}>
              {services.map((service, index) => (
                <div key={index} className={styles.serviceCard}>
                  <img src={service.image} alt={t(service.titleKey)} className={styles.serviceImage} />
                  <div className={styles.serviceContent}>
                    <div className={styles.serviceHeader}>
                      <div className={styles.serviceIcon}>{service.icon}</div>
                      <h3 className={styles.serviceTitle}>{t(service.titleKey)}</h3>
                    </div>
                    <p className={styles.serviceDescription}>{t(service.descKey)}</p>
                    
                    <div className={styles.serviceFeatures}>
                      {service.features.map((feature, fIndex) => (
                        <div key={fIndex} className={styles.feature}>
                          <MdCheckCircle className={styles.featureIcon} />
                          <span>{t(feature)}</span>
                        </div>
                      ))}
                    </div>

                    <div className={styles.serviceFooter}>
                      <div className={styles.servicePrice}>
                        <span className={styles.priceLabel}>от</span> {t(service.priceKey)}
                      </div>
                      <button className={styles.orderButton}>
                        {t('services.orderButton')}
                      </button>
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
            <h2 className={styles.ctaTitle}>{t('services.ctaTitle')}</h2>
            <p className={styles.ctaDescription}>{t('services.ctaDescription')}</p>
            <div className={styles.ctaButtons}>
              <button className={styles.primaryButton}>{t('services.ctaButton1')}</button>
              <button className={styles.secondaryButton}>{t('services.ctaButton2')}</button>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default Services;
