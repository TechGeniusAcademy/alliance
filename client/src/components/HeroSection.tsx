import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styles from "./HeroSection.module.css";

const HeroSection = () => {
  const { t } = useTranslation();
  
  const heroImages = [
    '/hero/carpenter-working-with-wooden-plank-in-workshop-m-2025-03-26-00-31-53-utc.jpg',
    '/hero/craftsman-working-in-his-studio-2024-10-18-05-47-57-utc.jpg',
    '/hero/only-our-best-will-do-carpenter-cutting-wood-on-e-2025-03-25-04-24-53-utc.jpg'
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 4000); // Меняем каждые 4 секунды

    return () => clearInterval(interval);
  }, [heroImages.length]);

  return (
    <section className={styles.heroSection}>
      <div className={styles.heroContainer}>
        <div className={styles.heroTextBox}>
          <h1 className={styles.headingPrimary}>{t('hero.title')}</h1>
          <p className={styles.heroDescription}>{t('hero.description')}</p>
          <a href="#" className={`${styles.btn} ${styles.btnFill} ${styles.marginRightBtn}`}>
            {t('hero.createOrder')}
          </a>
          <a href="#" className={`${styles.btn} ${styles.btnOutline}`}>
            {t('hero.learnMore')} &darr;
          </a>
        </div>

        <div className={styles.heroImgBox}>
          {heroImages.map((image, index) => (
            <img
              key={index}
              src={image}
              alt="Мастер за работой"
              className={`${styles.heroImg} ${index === currentImageIndex ? styles.active : ''}`}
            />
          ))}
        </div>

        <div className={styles.deliveredStats}>
          <div className={styles.deliveredImgs}>
            <img src="https://prayagtandon.github.io/Omnifood-Project/Hero-section/img/customers/customer-1.jpg" alt="Довольный клиент" />
            <img src="https://prayagtandon.github.io/Omnifood-Project/Hero-section/img/customers/customer-2.jpg" alt="Довольный клиент" />
            <img src="https://prayagtandon.github.io/Omnifood-Project/Hero-section/img/customers/customer-3.jpg" alt="Довольный клиент" />
            <img src="https://prayagtandon.github.io/Omnifood-Project/Hero-section/img/customers/customer-4.jpg" alt="Довольный клиент" />
            <img src="https://prayagtandon.github.io/Omnifood-Project/Hero-section/img/customers/customer-5.jpg" alt="Довольный клиент" />
            <img src="https://prayagtandon.github.io/Omnifood-Project/Hero-section/img/customers/customer-6.jpg" alt="Довольный клиент" />
          </div>
          <p className={styles.deliveredText}>
            <span>1,500+</span> {t('hero.ordersCompleted')}
          </p>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
