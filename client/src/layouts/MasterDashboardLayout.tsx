import { Outlet } from 'react-router-dom';
import MasterSidebar from '../components/MasterSidebar.tsx';
import MasterMobileNav from '../components/MasterMobileNav.tsx';
import ChatNotification from '../components/ChatNotification';
import styles from './MasterDashboardLayout.module.css';

const MasterDashboardLayout = () => {
  return (
    <div className={styles.dashboardLayout}>
      <MasterSidebar />
      <main className={styles.mainContent}>
        <Outlet />
      </main>
      <MasterMobileNav />
      <ChatNotification />
    </div>
  );
};

export default MasterDashboardLayout;
