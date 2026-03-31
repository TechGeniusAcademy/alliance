import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from './components/Header';
import { HomePage } from './pages/Home/Home';
import { AboutPage } from './pages/About/About';
import { ContactPage } from './pages/Contact/Contact';
import { MastersPage } from './pages/Masters/Masters';
import { ProjectsPage } from './pages/Projects/Projects';
import { BlogPage } from './pages/Blog/Blog';
import { BlogArticlePage } from './pages/BlogArticle/BlogArticle';
import { CategoriesPage } from './pages/Categories/Categories';
import { CategoryDetailPage } from './pages/CategoryDetail/CategoryDetail';
import { ProjectDetailPage } from './pages/ProjectDetail/ProjectDetail';
import { MasterProfilePage } from './pages/MasterProfile/MasterProfile';
import { PricingPage } from './pages/Pricing/Pricing';
import { FAQPage } from './pages/FAQ/FAQ';
import { TermsPage } from './pages/Terms/Terms';
import { PrivacyPage } from './pages/Privacy/Privacy';
import { HowItWorksPage } from './pages/HowItWorks/HowItWorks';
import { NotFoundPage } from './pages/NotFound/NotFound';
import { Footer } from './components/Footer/Footer';
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
import MasterIncome from './pages/master/MasterIncome';
import MasterNotifications from './pages/master/MasterNotifications';
import MasterStatistics from './pages/master/MasterStatistics';
import MasterClients from './pages/master/MasterClients';
import MasterMore from './pages/MasterMore';
import ClientMore from './pages/ClientMore';
import Placeholder from './pages/Placeholder';
import BrowsePortfolio from './pages/BrowsePortfolio';
import MasterSchedule from './pages/master/MasterSchedule';
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
import AIDesigner from './pages/AIDesigner';
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
          {/* Публичные страницы */}
          <Route path="/" element={
            <>
              <Header />
              <HomePage />
            </>
          } />
          
          <Route path="/about" element={
            <>
              <Header />
              <AboutPage />
              <Footer />
            </>
          } />
          
          <Route path="/contact" element={
            <>
              <Header />
              <ContactPage />
              <Footer />
            </>
          } />
          
          <Route path="/masters" element={
            <>
              <Header />
              <MastersPage />
              <Footer />
            </>
          } />
          
          <Route path="/masters/:id" element={
            <>
              <Header />
              <MasterProfilePage />
              <Footer />
            </>
          } />
          
          <Route path="/projects" element={
            <>
              <Header />
              <ProjectsPage />
              <Footer />
            </>
          } />
          
          <Route path="/projects/:id" element={
            <>
              <Header />
              <ProjectDetailPage />
              <Footer />
            </>
          } />
          
          <Route path="/blog" element={
            <>
              <Header />
              <BlogPage />
              <Footer />
            </>
          } />
          
          <Route path="/blog/:id" element={
            <>
              <Header />
              <BlogArticlePage />
              <Footer />
            </>
          } />
          
          <Route path="/categories" element={
            <>
              <Header />
              <CategoriesPage />
              <Footer />
            </>
          } />
          
          <Route path="/categories/:id" element={
            <>
              <Header />
              <CategoryDetailPage />
              <Footer />
            </>
          } />
          
          <Route path="/pricing" element={
            <>
              <Header />
              <PricingPage />
              <Footer />
            </>
          } />
          
          <Route path="/faq" element={
            <>
              <Header />
              <FAQPage />
              <Footer />
            </>
          } />
          
          <Route path="/terms" element={
            <>
              <Header />
              <TermsPage />
              <Footer />
            </>
          } />
          
          <Route path="/privacy" element={
            <>
              <Header />
              <PrivacyPage />
              <Footer />
            </>
          } />
          
          <Route path="/privacy-policy" element={
            <>
              <Header />
              <PrivacyPolicy />
              <Footer />
            </>
          } />
          
          <Route path="/how-it-works" element={
            <>
              <Header />
              <HowItWorksPage />
              <Footer />
            </>
          } />

          {/* Редиректы для старых путей */}
          <Route path="/createOrder" element={<Navigate to="/dashboard/create-order" replace />} />
          <Route path="/findMaster" element={<Navigate to="/masters" replace />} />

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
            <Route path="ai-designer" element={<AIDesigner />} />
            
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
            
            {/* Страница "Ещё" для мобильных */}
            <Route path="more" element={<ClientMore />} />
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
            <Route path="schedule" element={<MasterSchedule />} />
            
            {/* Финансы */}
            <Route path="wallet" element={<MasterWallet />} />
            <Route path="earnings" element={<MasterIncome />} />
            <Route path="commissions" element={<MasterCommissions />} />
            <Route path="invoices" element={<Placeholder title="Счета" icon="📄" description="Выставленные и оплаченные счета" />} />
            <Route path="statistics" element={<MasterStatistics />} />
            
            {/* Коммуникация */}
            <Route path="chats" element={<MasterChats />} />
            <Route path="notifications" element={<MasterNotifications />} />
            
            {/* Репутация */}
            <Route path="ratings" element={<MasterRatings />} />
            <Route path="portfolio" element={<MasterPortfolio />} />
            <Route path="clients" element={<MasterClients />} />
            
            {/* Настройки */}
            <Route path="profile" element={<MasterProfile />} />
            <Route path="settings" element={<MasterSettings />} />
            <Route path="help" element={<Help />} />
            
            {/* Страница "Ещё" для мобильных */}
            <Route path="more" element={<MasterMore />} />
            
            {/* Старые маршруты для обратной совместимости */}
            <Route path="auction-history" element={<AuctionHistory />} />
          </Route>
          
          {/* 404 страница */}
          <Route path="*" element={
            <>
              <Header />
              <NotFoundPage />
              <Footer />
            </>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
