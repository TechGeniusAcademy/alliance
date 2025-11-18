import { NavLink } from 'react-router-dom';
import {
  MdDashboard,
  MdChat,
  MdAssignment,
  MdMoreHoriz
} from 'react-icons/md';
import { useUnreadChats } from '../hooks/useUnreadChats';
import styles from './MasterMobileNav.module.css';

const MasterMobileNav = () => {
  const { unreadCount } = useUnreadChats();
  // TODO: Получать реальные значения из контекста/API
  const activeOrdersCount = 0;

  return (
    <nav className={styles.mobileNav}>
      <NavLink
        to="/master"
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
        to="/master/chats"
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
        to="/master/active-orders"
        className={({ isActive }) =>
          `${styles.navItem} ${isActive ? styles.active : ''}`
        }
      >
        <div className={styles.iconContainer}>
          <MdAssignment size={24} />
          {activeOrdersCount > 0 && (
            <span className={styles.badge}>{activeOrdersCount > 9 ? '9+' : activeOrdersCount}</span>
          )}
        </div>
        <span>Заказы</span>
      </NavLink>

      <NavLink
        to="/master/more"
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

export default MasterMobileNav;
