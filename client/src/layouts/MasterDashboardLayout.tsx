import { Outlet } from 'react-router-dom';
import MasterSidebar from '../components/MasterSidebar.tsx';
import styles from './MasterDashboardLayout.module.css';

const MasterDashboardLayout = () => {
  return (
    <div className={styles.dashboardLayout}>
      <MasterSidebar />
      <main className={styles.mainContent}>
        <Outlet />
      </main>
    </div>
  );
};

export default MasterDashboardLayout;
