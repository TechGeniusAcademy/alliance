import { useLanguage } from '../../../context/LanguageContext';
import styles from './Statistics.module.css';

export const Statistics = () => {
  const { t } = useLanguage();

  const stats = [
    { value: '2000+', label: t('statistics.masters') },
    { value: '5000+', label: t('statistics.projects') },
    { value: '15000+', label: t('statistics.orders') },
    { value: '98%', label: t('statistics.satisfaction') },
  ];

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.content}>
          <h2 className={styles.title}>{t('statistics.title')}</h2>
          <p className={styles.subtitle}>{t('statistics.subtitle')}</p>
        </div>

        <div className={styles.stats}>
          {stats.map((stat, index) => (
            <div key={index} className={styles.statItem}>
              <div className={styles.statValue}>{stat.value}</div>
              <div className={styles.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
