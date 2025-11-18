import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import ClientMobileNav from '../components/ClientMobileNav';
import ChatNotification from '../components/ChatNotification';
import styles from './DashboardLayout.module.css';

const DashboardLayout = () => {
  return (
    <div className={styles.dashboardLayout}>
      <Sidebar />
      <main className={styles.mainContent}>
        <Outlet />
      </main>
      <ClientMobileNav />
      <ChatNotification />
    </div>
  );
};

export default DashboardLayout;
