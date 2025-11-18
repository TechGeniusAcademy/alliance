import { NavLink, useNavigate } from 'react-router-dom';
import {
  MdAddCircleOutline,
  MdViewModule,
  MdAutoAwesome,
  MdTrendingUp,
  MdHistory,
  MdFavorite,
  MdPayment,
  MdReceipt,
  MdLocalShipping,
  MdCardGiftcard,
  MdNotifications,
  MdStars,
  MdLocalOffer,
  MdPerson,
  MdSettings,
  MdHelp,
  MdLogout
} from 'react-icons/md';
import styles from './ClientMore.module.css';

const ClientMore = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    navigate('/');
  };

  const menuSections = [
    {
      title: 'Главное',
      items: [
        { icon: MdAddCircleOutline, label: 'Создать заказ', path: '/dashboard/create-order', isNew: true, isPremium: false },
        { icon: MdViewModule, label: 'Работы мебельщиков', path: '/dashboard/browse-portfolio', isNew: true, isPremium: false },
        { icon: MdAutoAwesome, label: 'AI Дизайнер', path: '/dashboard/ai-designer', isNew: false, isPremium: true }
      ]
    },
    {
      title: 'Заказы',
      items: [
        { icon: MdTrendingUp, label: 'Активные заказы', path: '/dashboard/orders/active', isNew: false, isPremium: false },
        { icon: MdHistory, label: 'История заказов', path: '/dashboard/orders/history', isNew: false, isPremium: false },
        { icon: MdFavorite, label: 'Избранное', path: '/dashboard/favorites', isNew: false, isPremium: false }
      ]
    },
    {
      title: 'Финансы',
      items: [
        { icon: MdPayment, label: 'Платежи', path: '/dashboard/payments', isNew: false, isPremium: false },
        { icon: MdReceipt, label: 'Счета', path: '/dashboard/invoices', isNew: false, isPremium: false },
        { icon: MdLocalShipping, label: 'Доставка', path: '/dashboard/delivery', isNew: false, isPremium: false },
        { icon: MdCardGiftcard, label: 'Промокоды', path: '/dashboard/promocodes', isNew: true, isPremium: false }
      ]
    },
    {
      title: 'Коммуникация',
      items: [
        { icon: MdNotifications, label: 'Уведомления', path: '/dashboard/notifications', isNew: false, isPremium: false },
        { icon: MdStars, label: 'Отзывы', path: '/dashboard/reviews', isNew: false, isPremium: false },
        { icon: MdLocalOffer, label: 'Спецпредложения', path: '/dashboard/offers', isNew: true, isPremium: false }
      ]
    },
    {
      title: 'Аккаунт',
      items: [
        { icon: MdPerson, label: 'Профиль', path: '/dashboard/profile', isNew: false, isPremium: false },
        { icon: MdSettings, label: 'Настройки', path: '/dashboard/settings', isNew: false, isPremium: false },
        { icon: MdHelp, label: 'Помощь', path: '/dashboard/help', isNew: false, isPremium: false }
      ]
    }
  ];

  return (
    <div className={styles.morePage}>
      <div className={styles.header}>
        <h1>Ещё</h1>
        <p>Дополнительные функции и настройки</p>
      </div>

      <div className={styles.content}>
        {menuSections.map((section, index) => (
          <div key={index} className={styles.section}>
            <h2 className={styles.sectionTitle}>{section.title}</h2>
            <div className={styles.menuGrid}>
              {section.items.map((item, itemIndex) => (
                <NavLink
                  key={itemIndex}
                  to={item.path}
                  className={styles.menuItem}
                >
                  <div className={styles.iconWrapper}>
                    <item.icon size={28} />
                    {item.isNew && <span className={styles.newBadge}>NEW</span>}
                    {item.isPremium && <span className={styles.premiumBadge}>⭐</span>}
                  </div>
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}

        <div className={styles.logoutSection}>
          <button onClick={handleLogout} className={styles.logoutButton}>
            <MdLogout size={24} />
            <span>Выйти из аккаунта</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientMore;
