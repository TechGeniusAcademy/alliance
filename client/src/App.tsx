import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from './components/Header';
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Contact from './pages/Contact';
import Portfolio from './pages/Portfolio';
import Masters from './pages/Masters';
import HowItWorks from './pages/HowItWorks';
import Pricing from './pages/Pricing';
import DashboardLayout from './layouts/DashboardLayout';
import MasterDashboardLayout from './layouts/MasterDashboardLayout';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import CreateOrder from './pages/CreateOrder';
import Admin from './pages/Admin';
import ProtectedRoute from './components/ProtectedRoute';
import MasterDashboard from './pages/master/MasterDashboard';
import MasterOrders from './pages/master/MasterOrders';
import MasterActiveOrders from './pages/master/MasterActiveOrders';
import MasterCommissions from './pages/master/MasterCommissions';
import MasterWallet from './pages/master/MasterWallet';
import AuctionHistory from './pages/master/AuctionHistory';
import MasterChats from './pages/master/MasterChats';
import MasterRatings from './pages/master/MasterRatings';
import MasterProfile from './pages/master/MasterProfile';
import MasterSettings from './pages/master/MasterSettings';
import MasterPortfolio from './pages/master/MasterPortfolio';
import Placeholder from './pages/Placeholder';
import BrowsePortfolio from './pages/BrowsePortfolio';
import MyOrders from './pages/MyOrders';
import ActiveOrders from './pages/ActiveOrders';
import OrderHistory from './pages/OrderHistory';
import Favorites from './pages/Favorites';
import Payments from './pages/Payments';
import Invoices from './pages/Invoices';
import Delivery from './pages/Delivery';
import PromoCodes from './pages/PromoCodes';
import Chats from './pages/Chats';
import Notifications from './pages/Notifications';
import Reviews from './pages/Reviews';
import SpecialOffers from './pages/SpecialOffers';
import Settings from './pages/Settings';
import Help from './pages/Help';
import PrivacyPolicy from './pages/PrivacyPolicy';
import './App.css';

function App() {
  const { i18n } = useTranslation();

  // Инициализация языка при загрузке приложения
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && savedLanguage !== i18n.language) {
      i18n.changeLanguage(savedLanguage);
    }
  }, [i18n]);

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Публичные маршруты с Header */}
          <Route path="/" element={
            <>
              <Header />
              <Home />
            </>
          } />
          <Route path="/about" element={
            <>
              <Header />
              <About />
            </>
          } />
          <Route path="/services" element={
            <>
              <Header />
              <Services />
            </>
          } />
          <Route path="/contact" element={
            <>
              <Header />
              <Contact />
            </>
          } />
          <Route path="/portfolio" element={
            <>
              <Header />
              <Portfolio />
            </>
          } />
          <Route path="/masters" element={
            <>
              <Header />
              <Masters />
            </>
          } />
          <Route path="/how-it-works" element={
            <>
              <Header />
              <HowItWorks />
            </>
          } />
          <Route path="/pricing" element={
            <>
              <Header />
              <Pricing />
            </>
          } />
          <Route path="/privacy-policy" element={
            <>
              <Header />
              <PrivacyPolicy />
            </>
          } />

          {/* Маршруты Dashboard с Sidebar */}
          <Route path="/dashboard" element={
            <ProtectedRoute requiredRole="customer">
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            
            {/* Orders section */}
            <Route path="orders" element={<MyOrders />} />
            <Route path="orders/active" element={<ActiveOrders />} />
            <Route path="orders/history" element={<OrderHistory />} />
            <Route path="favorites" element={<Favorites />} />
            
            {/* Main section */}
            <Route path="create-order" element={<CreateOrder />} />
            <Route path="browse-portfolio" element={<BrowsePortfolio />} />
            <Route path="ai-designer" element={<Placeholder title="AI Дизайнер" icon="✨" description="Создайте уникальный дизайн мебели с помощью искусственного интеллекта" />} />
            
            {/* Financial section */}
            <Route path="payments" element={<Payments />} />
            <Route path="invoices" element={<Invoices />} />
            <Route path="delivery" element={<Delivery />} />
            <Route path="promocodes" element={<PromoCodes />} />
            
            {/* Communication section */}
            <Route path="chats" element={<Chats />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="reviews" element={<Reviews />} />
            <Route path="offers" element={<SpecialOffers />} />
            
            {/* Account section */}
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />
            <Route path="help" element={<Help />} />
          </Route>

          {/* Админ панель */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute requiredRole="admin">
                <Admin />
              </ProtectedRoute>
            } 
          />

          {/* Личный кабинет мастера */}
          <Route path="/master" element={
            <ProtectedRoute requiredRole="master">
              <MasterDashboardLayout />
            </ProtectedRoute>
          }>
            {/* Главное */}
            <Route index element={<MasterDashboard />} />
            
            {/* Работа с заказами */}
            <Route path="auctions" element={<MasterOrders />} />
            <Route path="active-orders" element={<MasterActiveOrders />} />
            <Route path="orders" element={<MasterOrders />} />
            <Route path="history" element={<AuctionHistory />} />
            <Route path="schedule" element={<Placeholder title="Расписание" icon="📅" description="График работы и дедлайны" />} />
            
            {/* Финансы */}
            <Route path="wallet" element={<MasterWallet />} />
            <Route path="earnings" element={<Placeholder title="Доходы" icon="💰" description="История заработка и выплаты" />} />
            <Route path="commissions" element={<MasterCommissions />} />
            <Route path="invoices" element={<Placeholder title="Счета" icon="📄" description="Выставленные и оплаченные счета" />} />
            <Route path="statistics" element={<Placeholder title="Статистика" icon="📊" description="Аналитика вашей работы" />} />
            
            {/* Коммуникация */}
            <Route path="chats" element={<MasterChats />} />
            <Route path="notifications" element={<Placeholder title="Уведомления" icon="🔔" description="Все уведомления и оповещения" />} />
            
            {/* Репутация */}
            <Route path="ratings" element={<MasterRatings />} />
            <Route path="portfolio" element={<MasterPortfolio />} />
            <Route path="clients" element={<Placeholder title="Клиенты" icon="👥" description="База клиентов и история работы" />} />
            
            {/* Настройки */}
            <Route path="profile" element={<MasterProfile />} />
            <Route path="settings" element={<MasterSettings />} />
            <Route path="help" element={<Help />} />
            
            {/* Старые маршруты для обратной совместимости */}
            <Route path="auction-history" element={<AuctionHistory />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
