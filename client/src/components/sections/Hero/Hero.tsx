import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { FiSearch, FiArrowRight, FiCheckCircle, FiX, FiAlertCircle } from 'react-icons/fi';
import { useLanguage } from '../../../context/LanguageContext';
import { ROUTES } from '../../../constants';
import { Button } from '../../ui/Button';
import AuthModal from '../../AuthModal';
import RegisterModal from '../../RegisterModal';
import styles from './Hero.module.css';

export const Hero = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState<any>(null);
  const [showMasterModal, setShowMasterModal] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (e) {
        console.error('Error parsing user:', e);
      }
    }
  }, []);

  const handleCreateOrder = () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    if (user.role === 'master') {
      setShowMasterModal(true);
      return;
    }

    navigate('/dashboard/create-order');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Перенаправляем на страницу мастеров с поисковым запросом
      navigate(`${ROUTES.MASTERS}?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const features = [
    t('hero.feature1'),
    t('hero.feature2'),
    t('hero.feature3'),
  ];

  return (
    <section className={styles.hero}>
      <div className={styles.container}>
        <div className={styles.content}>
          <h1 className={styles.title}>
            {t('hero.title')}
            <span className={styles.accent}>{t('hero.titleAccent')}</span>
          </h1>
          <p className={styles.subtitle}>
            {t('hero.subtitle')}
          </p>

          <form className={styles.search} onSubmit={handleSearch}>
            <div className={styles.searchInput}>
              <FiSearch className={styles.searchIcon} />
              <input
                type="text"
                placeholder={t('hero.searchPlaceholder')}
                className={styles.input}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button 
              variant="primary" 
              size="large"
              type="submit"
            >
              {t('hero.searchButton')}
              <FiArrowRight />
            </Button>
          </form>

          <ul className={styles.features}>
            {features.map((feature, index) => (
              <li key={index} className={styles.featureItem}>
                <FiCheckCircle className={styles.featureIcon} />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <div className={styles.actions}>
            <Button 
              variant="outline" 
              size="large" 
              as={Link} 
              to={ROUTES.MASTERS}
              rightIcon={<FiArrowRight />}
            >
              {t('hero.findMaster')}
            </Button>
            <Button 
              variant="secondary" 
              size="large" 
              onClick={handleCreateOrder}
              rightIcon={<FiArrowRight />}
            >
              {t('hero.postOrder')}
            </Button>
          </div>
        </div>

        <div className={styles.image}>
          <div className={styles.imageWrapper}>
            <img 
              src="https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=800&q=80" 
              alt="Мебельная мастерская"
              className={styles.heroImage}
            />
            <div className={styles.statsCard}>
              <div className={styles.statNumber}>2000+</div>
              <div className={styles.statLabel}>{t('hero.mastersCount')}</div>
            </div>
            <div className={styles.projectCard}>
              <div className={styles.statNumber}>5000+</div>
              <div className={styles.statLabel}>{t('hero.projectsCount')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for Master Role */}
      {showMasterModal && (
        <div className={styles.modalOverlay} onClick={() => setShowMasterModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={() => setShowMasterModal(false)}>
              <FiX />
            </button>
            <div className={styles.modalIcon}>
              <FiAlertCircle />
            </div>
            <h3 className={styles.modalTitle}>{t('modal.accessDenied')}</h3>
            <p className={styles.modalText}>
              {t('modal.clientOnlyMessage')}
            </p>
            <div className={styles.modalButtons}>
              <button 
                className={styles.modalBtnPrimary} 
                onClick={() => setShowMasterModal(false)}
              >
                {t('modal.understood')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auth Modals */}
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
    </section>
  );
};
