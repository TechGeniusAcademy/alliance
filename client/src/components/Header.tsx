import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MdMenu, MdClose, MdLanguage, MdLogin, MdPerson, MdLogout, MdDashboard } from 'react-icons/md';
import { FiChevronDown } from 'react-icons/fi';
import AuthModal from './AuthModal';
import RegisterModal from './RegisterModal';
import styles from './Header.module.css';

const Header = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  // Проверяем авторизацию
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');
  const userName = localStorage.getItem('userName') || 'Пользователь';
  const isAuthenticated = !!token;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isMobileMenuOpen]);

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
    setIsLangOpen(false);
  };

  const languageNames: { [key: string]: string } = {
    ru: 'Русский',
    kk: 'Қазақша',
    en: 'English',
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    setIsUserMenuOpen(false);
    navigate('/');
  };

  const handleGoToDashboard = () => {
    const dashboardPath = userRole === 'master' ? '/master' : userRole === 'admin' ? '/admin' : '/dashboard';
    navigate(dashboardPath);
    setIsUserMenuOpen(false);
  };

  const navItems = [
    { path: '/', label: t('nav.home') || 'Главная' },
    { path: '/categories', label: t('nav.categories') || 'Категории' },
    { path: '/masters', label: t('nav.masters') || 'Мастера' },
    { path: '/projects', label: t('nav.projects') || 'Проекты' },
    { path: '/how-it-works', label: t('nav.howItWorks') || 'Как это работает' },
    { path: '/pricing', label: t('nav.pricing') || 'Цены' },
  ];

  return (
    <>
      <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
        <div className={styles.container}>
          <Link to="/" className={styles.logo}>
            <img src="/vite.svg" alt="Logo" className={styles.logoImage} />
            <span className={styles.logoText}>ALLIANCE</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className={styles.nav}>
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `${styles.navLink} ${isActive ? styles.active : ''}`
                }
                end={item.path === '/'}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className={styles.actions}>
            {/* Language Selector */}
            <div className={styles.langSelector}>
              <button
                className={styles.langButton}
                onClick={() => setIsLangOpen(!isLangOpen)}
              >
                <MdLanguage />
                <span>{i18n.language.toUpperCase()}</span>
                <FiChevronDown className={`${styles.chevron} ${isLangOpen ? styles.open : ''}`} />
              </button>
              {isLangOpen && (
                <div className={styles.langDropdown}>
                  {Object.keys(languageNames).map((lang) => (
                    <button
                      key={lang}
                      className={`${styles.langOption} ${i18n.language === lang ? styles.activeLang : ''}`}
                      onClick={() => changeLanguage(lang)}
                    >
                      {languageNames[lang]}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Auth Buttons or User Menu */}
            {isAuthenticated ? (
              <div className={styles.userMenu}>
                <button
                  className={styles.userButton}
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                >
                  <MdPerson />
                  <span>{userName}</span>
                  <FiChevronDown className={`${styles.chevron} ${isUserMenuOpen ? styles.open : ''}`} />
                </button>
                {isUserMenuOpen && (
                  <div className={styles.userDropdown}>
                    <button onClick={handleGoToDashboard} className={styles.dropdownItem}>
                      <MdDashboard />
                      <span>Личный кабинет</span>
                    </button>
                    <button onClick={handleLogout} className={styles.dropdownItem}>
                      <MdLogout />
                      <span>Выйти</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className={styles.authButtons}>
                <button 
                  className={styles.loginButton}
                  onClick={() => setIsAuthModalOpen(true)}
                >
                  <MdLogin />
                  <span>{t('auth.login') || 'Войти'}</span>
                </button>
                <button 
                  className={styles.registerButton}
                  onClick={() => setIsRegisterModalOpen(true)}
                >
                  {t('auth.register') || 'Регистрация'}
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className={styles.menuButton}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <MdClose size={28} /> : <MdMenu size={28} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className={`${styles.mobileMenu} ${isMobileMenuOpen ? styles.open : ''}`}>
          <div className={styles.mobileMenuContent}>
            <nav className={styles.mobileNav}>
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `${styles.mobileNavLink} ${isActive ? styles.active : ''}`
                  }
                  onClick={closeMobileMenu}
                  end={item.path === '/'}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className={styles.mobileActions}>
              {/* Language Selector Mobile */}
              <div className={styles.mobileLangSelector}>
                <span className={styles.mobileLabel}>Язык:</span>
                <select 
                  value={i18n.language} 
                  onChange={(e) => {
                    changeLanguage(e.target.value);
                    closeMobileMenu();
                  }}
                  className={styles.mobileLangSelect}
                >
                  {Object.keys(languageNames).map((lang) => (
                    <option key={lang} value={lang}>{languageNames[lang]}</option>
                  ))}
                </select>
              </div>

              {/* Auth Buttons Mobile */}
              {isAuthenticated ? (
                <div className={styles.mobileAuthButtons}>
                  <button 
                    className={styles.mobileDashboardButton}
                    onClick={() => {
                      handleGoToDashboard();
                      closeMobileMenu();
                    }}
                  >
                    <MdDashboard />
                    <span>Личный кабинет</span>
                  </button>
                  <button 
                    className={styles.mobileLogoutButton}
                    onClick={() => {
                      handleLogout();
                      closeMobileMenu();
                    }}
                  >
                    <MdLogout />
                    <span>Выйти</span>
                  </button>
                </div>
              ) : (
                <div className={styles.mobileAuthButtons}>
                  <button 
                    className={styles.mobileLoginButton}
                    onClick={() => {
                      setIsAuthModalOpen(true);
                      closeMobileMenu();
                    }}
                  >
                    <MdLogin />
                    <span>{t('auth.login') || 'Войти'}</span>
                  </button>
                  <button 
                    className={styles.mobileRegisterButton}
                    onClick={() => {
                      setIsRegisterModalOpen(true);
                      closeMobileMenu();
                    }}
                  >
                    {t('auth.register') || 'Регистрация'}
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className={styles.mobileMenuOverlay} onClick={closeMobileMenu} />
        </div>
      )}

      {/* Modals */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)}
        onSwitchToRegister={() => {
          setIsAuthModalOpen(false);
          setIsRegisterModalOpen(true);
        }}
      />

      <RegisterModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onSwitchToLogin={() => {
          setIsRegisterModalOpen(false);
          setIsAuthModalOpen(true);
        }}
      />
    </>
  );
};

export default Header;
