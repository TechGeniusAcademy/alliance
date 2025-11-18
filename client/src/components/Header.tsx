import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MdMenu, MdClose, MdLanguage, MdLogin } from 'react-icons/md';
import AuthModal from './AuthModal';
import RegisterModal from './RegisterModal';
import styles from './Header.module.css';

const Header = () => {
  const { t, i18n } = useTranslation();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const changeLanguage = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = e.target.value;
    i18n.changeLanguage(newLanguage);
    // Сохраняем в localStorage для синхронизации со страницей настроек
    localStorage.setItem('language', newLanguage);
  };

  const languageNames: { [key: string]: string } = {
    ru: 'Русский',
    kk: 'Қазақша',
    en: 'English',
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <Link to="/" onClick={closeMobileMenu}>
            <img src="/logo.svg" alt="Logo" className={styles.logoImage} />
            <span>Logo</span>
          </Link>
        </div>

        {/* Кнопка бургер-меню для мобильных */}
        <button 
          className={styles.burgerButton}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <MdClose size={28} /> : <MdMenu size={28} />}
        </button>
        
        {/* Навигация */}
        <nav className={`${styles.nav} ${isMobileMenuOpen ? styles.navOpen : ''}`}>
          <Link to="/" className={styles.navLink} onClick={closeMobileMenu}>
            {t('nav.home')}
          </Link>
          <Link to="/about" className={styles.navLink} onClick={closeMobileMenu}>
            {t('nav.about')}
          </Link>
          <Link to="/services" className={styles.navLink} onClick={closeMobileMenu}>
            {t('nav.services')}
          </Link>
          <Link to="/portfolio" className={styles.navLink} onClick={closeMobileMenu}>
            {t('nav.portfolio')}
          </Link>
          <Link to="/masters" className={styles.navLink} onClick={closeMobileMenu}>
            {t('nav.masters')}
          </Link>
          <Link to="/how-it-works" className={styles.navLink} onClick={closeMobileMenu}>
            {t('nav.howItWorks')}
          </Link>
          <Link to="/pricing" className={styles.navLink} onClick={closeMobileMenu}>
            {t('nav.pricing')}
          </Link>
          <Link to="/contact" className={styles.navLink} onClick={closeMobileMenu}>
            {t('nav.contact')}
          </Link>

          {/* Кнопки в мобильном меню */}
          <div className={styles.mobileActions}>
            <div className={styles.languageSwitcher}>
              <MdLanguage className={styles.iconOnly} size={24} />
              <select 
                value={i18n.language} 
                onChange={changeLanguage}
                className={styles.langSelect}
              >
                <option value="ru">{languageNames.ru}</option>
                <option value="kk">{languageNames.kk}</option>
                <option value="en">{languageNames.en}</option>
              </select>
            </div>

            <button 
              className={styles.loginButton}
              onClick={() => {
                setIsAuthModalOpen(true);
                closeMobileMenu();
              }}
            >
              <MdLogin className={styles.iconOnly} size={20} />
              <span className={styles.buttonText}>{t('auth.login')}</span>
            </button>
          </div>
        </nav>

        {/* Десктопные кнопки */}
        <div className={styles.desktopActions}>
          <div className={styles.languageSwitcher}>
            <MdLanguage className={styles.iconOnly} size={24} />
            <select 
              value={i18n.language} 
              onChange={changeLanguage}
              className={styles.langSelect}
            >
              <option value="ru">{languageNames.ru}</option>
              <option value="kk">{languageNames.kk}</option>
              <option value="en">{languageNames.en}</option>
            </select>
          </div>

          <button 
            className={styles.loginButton}
            onClick={() => setIsAuthModalOpen(true)}
          >
            <MdLogin className={styles.iconOnly} size={20} />
            <span className={styles.buttonText}>{t('auth.login')}</span>
          </button>
        </div>
      </div>

      {/* Overlay для закрытия меню при клике вне его */}
      {isMobileMenuOpen && (
        <div 
          className={styles.overlay}
          onClick={closeMobileMenu}
        />
      )}

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
    </header>
  );
};

export default Header;
