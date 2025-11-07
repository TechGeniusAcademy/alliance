import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AuthModal from './AuthModal';
import RegisterModal from './RegisterModal';
import styles from './Header.module.css';

const Header = () => {
  const { t, i18n } = useTranslation();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

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

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <Link to="/">
            <img src="/logo.svg" alt="Logo" className={styles.logoImage} />
            <span>Logo</span>
          </Link>
        </div>
        
        <nav className={styles.nav}>
          <Link to="/" className={styles.navLink}>
            {t('nav.home')}
          </Link>
          <Link to="/about" className={styles.navLink}>
            {t('nav.about')}
          </Link>
          <Link to="/services" className={styles.navLink}>
            {t('nav.services')}
          </Link>
          <Link to="/contact" className={styles.navLink}>
            {t('nav.contact')}
          </Link>
        </nav>

        <div className={styles.languageSwitcher}>
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
          {t('auth.login')}
        </button>
      </div>

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
