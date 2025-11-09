import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import styles from './ThreeDViewerSection.module.css';
import { MdViewInAr, MdZoomOutMap, Md360 } from 'react-icons/md';
import ThreeDModal from './ThreeDModal';

const ThreeDViewerSection = () => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState('');

  const apartments = [
    {
      titleKey: 'viewer.apartment1Title',
      descKey: 'viewer.apartment1Desc',
      modelPath: '/obj/kitchen.obj',
      thumbnail: 'https://elements-resized.envatousercontent.com/envato-dam-assets-production/EVA/TRX/56/65/d0/f6/f4/v1_E11/E118NMKP.png?w=2038&cf_fit=scale-down&q=85&format=auto&s=339eb685235fcc6faca9e7c99038964a702ea04af67f780a973d53de361e3293'
    },
    {
      titleKey: 'viewer.apartment2Title',
      descKey: 'viewer.apartment2Desc',
      modelPath: '/obj/Castleobj.obj',
      thumbnail: 'https://elements-resized.envatousercontent.com/envato-dam-assets-production/EVA/TRX/4b/29/cb/be/0c/v1_E11/E118NR8W.png?w=2038&cf_fit=scale-down&q=85&format=auto&s=ab5c7a0bf7206150bf32552106368a257fa429b7b3bfeea0b513813303bf0879'
    },
    {
      titleKey: 'viewer.apartment3Title',
      descKey: 'viewer.apartment3Desc',
      modelPath: '/obj/stair.obj',
      thumbnail: 'https://elements-resized.envatousercontent.com/envato-dam-assets-production/EVA/TRX/35/5a/60/9a/31/v1_E11/E118SJK5.png?w=2038&cf_fit=scale-down&q=85&format=auto&s=f9fbf6e5889588606007b554c7f8ada2b9fcaa924dead04db3069572a2e89598'
    }
  ];

  const handleOpenModal = (modelPath: string) => {
    setSelectedModel(modelPath);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedModel('');
  };

  const features = [
    {
      icon: <MdViewInAr />,
      titleKey: 'viewer.feature1Title',
      descKey: 'viewer.feature1Desc'
    },
    {
      icon: <Md360 />,
      titleKey: 'viewer.feature2Title',
      descKey: 'viewer.feature2Desc'
    },
    {
      icon: <MdZoomOutMap />,
      titleKey: 'viewer.feature3Title',
      descKey: 'viewer.feature3Desc'
    }
  ];

  return (
    <section className={styles.viewerSection}>
      <div className={styles.container}>
        {/* Заголовок */}
        <div className={styles.headerSection}>
          <h2 className={styles.title}>
            {t('viewer.title')} <span>{t('viewer.titleHighlight')}</span>
          </h2>
          <p className={styles.description}>{t('viewer.description')}</p>
        </div>

        {/* Особенности */}
        <div className={styles.featuresGrid}>
          {features.map((feature, index) => (
            <div key={index} className={styles.featureCard}>
              <div className={styles.featureIcon}>{feature.icon}</div>
              <h3 className={styles.featureTitle}>{t(feature.titleKey)}</h3>
              <p className={styles.featureDesc}>{t(feature.descKey)}</p>
            </div>
          ))}
        </div>

        {/* 3D Квартиры */}
        <div className={styles.apartmentsGrid}>
          {apartments.map((apartment, index) => (
            <div key={index} className={styles.apartmentCard}>
              <div className={styles.thumbnailWrapper}>
                <img 
                  src={apartment.thumbnail} 
                  alt={t(apartment.titleKey)} 
                  className={styles.thumbnail}
                />
                <div className={styles.overlay}>
                  <button 
                    className={styles.viewButton}
                    onClick={() => handleOpenModal(apartment.modelPath)}
                  >
                    <MdViewInAr />
                    <span>{t('viewer.view3D')}</span>
                  </button>
                </div>
                <div className={styles.badge3D}>3D</div>
              </div>
              <div className={styles.apartmentInfo}>
                <h3 className={styles.apartmentTitle}>{t(apartment.titleKey)}</h3>
                <p className={styles.apartmentDesc}>{t(apartment.descKey)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className={styles.ctaSection}>
          <h3 className={styles.ctaTitle}>{t('viewer.ctaTitle')}</h3>
          <p className={styles.ctaDesc}>{t('viewer.ctaDesc')}</p>
          <button className={styles.ctaButton}>{t('viewer.ctaButton')}</button>
        </div>
      </div>

      <ThreeDModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        modelPath={selectedModel}
      />
    </section>
  );
};

export default ThreeDViewerSection;
