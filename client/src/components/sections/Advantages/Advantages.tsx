import { 
  FiShield, 
  FiUsers, 
  FiClock, 
  FiDollarSign,
  FiMessageSquare,
  FiAward
} from 'react-icons/fi';
import { useLanguage } from '../../../context/LanguageContext';
import styles from './Advantages.module.css';

export const Advantages = () => {
  const { t } = useLanguage();

  const advantages = [
    {
      icon: FiShield,
      title: t('advantages.security.title'),
      description: t('advantages.security.description'),
    },
    {
      icon: FiUsers,
      title: t('advantages.verified.title'),
      description: t('advantages.verified.description'),
    },
    {
      icon: FiClock,
      title: t('advantages.fast.title'),
      description: t('advantages.fast.description'),
    },
    {
      icon: FiDollarSign,
      title: t('advantages.price.title'),
      description: t('advantages.price.description'),
    },
    {
      icon: FiMessageSquare,
      title: t('advantages.support.title'),
      description: t('advantages.support.description'),
    },
    {
      icon: FiAward,
      title: t('advantages.quality.title'),
      description: t('advantages.quality.description'),
    },
  ];

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>{t('advantages.title')}</h2>
          <p className={styles.subtitle}>{t('advantages.subtitle')}</p>
        </div>

        <div className={styles.grid}>
          {advantages.map((advantage, index) => {
            const Icon = advantage.icon;
            return (
              <div key={index} className={styles.card}>
                <div className={styles.iconWrapper}>
                  <Icon className={styles.icon} />
                </div>
                <h3 className={styles.cardTitle}>{advantage.title}</h3>
                <p className={styles.cardDescription}>{advantage.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
