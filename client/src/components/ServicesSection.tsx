import styles from "./ServicesSection.module.css";
import { useTranslation } from "react-i18next";
import { MdConstruction, MdDesignServices, MdHandyman, MdLocalShipping, MdSecurity, MdTrendingUp } from "react-icons/md";

const ServicesSection = () => {
  const { t } = useTranslation();
  
  const services = [
    {
      icon: <MdConstruction />,
      titleKey: 'services.service1Title',
      descKey: 'services.service1Desc'
    },
    {
      icon: <MdDesignServices />,
      titleKey: 'services.service2Title',
      descKey: 'services.service2Desc'
    },
    {
      icon: <MdHandyman />,
      titleKey: 'services.service3Title',
      descKey: 'services.service3Desc'
    },
    {
      icon: <MdLocalShipping />,
      titleKey: 'services.service4Title',
      descKey: 'services.service4Desc'
    },
    {
      icon: <MdSecurity />,
      titleKey: 'services.service5Title',
      descKey: 'services.service5Desc'
    },
    {
      icon: <MdTrendingUp />,
      titleKey: 'services.service6Title',
      descKey: 'services.service6Desc'
    },
  ];

  // Дублируем массив для бесконечной прокрутки
  const duplicatedServices = [...services, ...services];

  return (
    <section className={styles.servicesSection}>
      <div className={styles.container}>
        <div className={styles.headerSection}>
          <h2 className={styles.title}>
            {t('services.title')} <span>{t('services.titleHighlight')}</span>
          </h2>
          <p className={styles.description}>{t('services.description')}</p>
        </div>

        <div className={styles.carouselWrapper}>
          <div className={styles.carouselTrack}>
            {duplicatedServices.map((service, index) => (
              <div key={index} className={styles.singleService}>
                <div className={styles.part1}>
                  <div className={styles.iconWrapper}>{service.icon}</div>
                  <h3 className={styles.serviceTitle}>{t(service.titleKey)}</h3>
                </div>
                <div className={styles.part2}>
                  <p className={styles.serviceDescription}>{t(service.descKey)}</p>
                  <a href="#" className={styles.readMore}>
                    <span>{t('services.readMore')}</span>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
