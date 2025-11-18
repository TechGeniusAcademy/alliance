import { NavLink } from 'react-router-dom';
import {
  MdDashboard,
  MdChat,
  MdShoppingCart,
  MdMoreHoriz
} from 'react-icons/md';
import { useUnreadChats } from '../hooks/useUnreadChats';
import styles from './ClientMobileNav.module.css';

const ClientMobileNav = () => {
  const { unreadCount } = useUnreadChats();
  // TODO: Получать реальные значения из контекста/API
  const activeOrders = 0;

  return (
    <nav className={styles.mobileNav}>
      <NavLink
        to="/dashboard"
        end
        className={({ isActive }) =>
          `${styles.navItem} ${isActive ? styles.active : ''}`
        }
      >
        <div className={styles.iconContainer}>
          <MdDashboard size={24} />
        </div>
        <span>Главная</span>
      </NavLink>

      <NavLink
        to="/dashboard/orders"
        className={({ isActive }) =>
          `${styles.navItem} ${isActive ? styles.active : ''}`
        }
      >
        <div className={styles.iconContainer}>
          <MdShoppingCart size={24} />
          {activeOrders > 0 && (
            <span className={styles.badge}>{activeOrders > 9 ? '9+' : activeOrders}</span>
          )}
        </div>
        <span>Заказы</span>
      </NavLink>

      <NavLink
        to="/dashboard/chats"
        className={({ isActive }) =>
          `${styles.navItem} ${isActive ? styles.active : ''}`
        }
      >
        <div className={styles.iconContainer}>
          <MdChat size={24} />
          {unreadCount > 0 && (
            <span className={styles.badge}>{unreadCount > 9 ? '9+' : unreadCount}</span>
          )}
        </div>
        <span>Чаты</span>
      </NavLink>

      <NavLink
        to="/dashboard/more"
        className={({ isActive }) =>
          `${styles.navItem} ${isActive ? styles.active : ''}`
        }
      >
        <div className={styles.iconContainer}>
          <MdMoreHoriz size={24} />
        </div>
        <span>Ещё</span>
      </NavLink>
    </nav>
  );
};

export default ClientMobileNav;
