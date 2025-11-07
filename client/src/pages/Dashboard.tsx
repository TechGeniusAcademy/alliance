import { useTranslation } from 'react-i18next';
import { MdShoppingCart, MdHourglassEmpty, MdCheckCircle, MdNotifications } from 'react-icons/md';
import styles from './Dashboard.module.css';

const Dashboard = () => {
  const { t } = useTranslation();

  const statsCards = [
    {
      icon: MdShoppingCart,
      title: 'Всего заказов',
      value: '0',
      color: '#3b82f6'
    },
    {
      icon: MdHourglassEmpty,
      title: 'В обработке',
      value: '0',
      color: '#f59e0b'
    },
    {
      icon: MdCheckCircle,
      title: 'Выполнено',
      value: '0',
      color: '#10b981'
    },
    {
      icon: MdNotifications,
      title: 'Уведомления',
      value: '0',
      color: '#8b5cf6'
    }
  ];

  return (
    <div className={styles.dashboard}>
      <h1 className={styles.title}>{t('sidebar.dashboard')}</h1>
      <p className={styles.subtitle}>Добро пожаловать в личный кабинет!</p>
      
      <div className={styles.grid}>
        {statsCards.map((card, index) => {
          const IconComponent = card.icon;
          return (
            <div key={index} className={styles.card}>
              <div className={styles.cardIcon} style={{ color: card.color }}>
                <IconComponent size={40} />
              </div>
              <h3 className={styles.cardTitle}>{card.title}</h3>
              <p className={styles.cardValue}>{card.value}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;
