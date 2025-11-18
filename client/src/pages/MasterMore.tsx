import { NavLink, useNavigate } from 'react-router-dom';
import {
  MdGavel,
  MdShoppingCart,
  MdHistory,
  MdSchedule,
  MdAccountBalanceWallet,
  MdAttachMoney,
  MdReceipt,
  MdBarChart,
  MdStar,
  MdPhotoLibrary,
  MdGroup,
  MdPerson,
  MdSettings,
  MdHelp,
  MdNotifications,
  MdLogout
} from 'react-icons/md';
import styles from './MasterMore.module.css';

const MasterMore = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/');
  };

  const menuSections = [
    {
      title: 'Работа с заказами',
      items: [
        { icon: MdGavel, label: 'Аукционы', path: '/master/auctions' },
        { icon: MdShoppingCart, label: 'Все заказы', path: '/master/orders' },
        { icon: MdHistory, label: 'История', path: '/master/history' },
        { icon: MdSchedule, label: 'Расписание', path: '/master/schedule' }
      ]
    },
    {
      title: 'Финансы',
      items: [
        { icon: MdAccountBalanceWallet, label: 'Кошелек', path: '/master/wallet' },
        { icon: MdAttachMoney, label: 'Заработок', path: '/master/earnings' },
        { icon: MdReceipt, label: 'Комиссии', path: '/master/commissions' },
        { icon: MdReceipt, label: 'Счета', path: '/master/invoices' },
        { icon: MdBarChart, label: 'Статистика', path: '/master/statistics' }
      ]
    },
    {
      title: 'Репутация',
      items: [
        { icon: MdStar, label: 'Рейтинги', path: '/master/ratings' },
        { icon: MdPhotoLibrary, label: 'Портфолио', path: '/master/portfolio' },
        { icon: MdGroup, label: 'Клиенты', path: '/master/clients' }
      ]
    },
    {
      title: 'Настройки',
      items: [
        { icon: MdNotifications, label: 'Уведомления', path: '/master/notifications' },
        { icon: MdPerson, label: 'Профиль', path: '/master/profile' },
        { icon: MdSettings, label: 'Настройки', path: '/master/settings' },
        { icon: MdHelp, label: 'Помощь', path: '/master/help' }
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

export default MasterMore;
