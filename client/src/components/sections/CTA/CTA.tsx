import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { FiArrowRight, FiUsers, FiTool, FiX, FiAlertCircle } from 'react-icons/fi';
import { useLanguage } from '../../../context/LanguageContext';
import { Button } from '../../ui/Button';
import AuthModal from '../../AuthModal';
import RegisterModal from '../../RegisterModal';
import styles from './CTA.module.css';

export const CTA = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [showClientModal, setShowClientModal] = useState(false);
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

  const handleCreateOrder = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    if (user.role === 'master') {
      setShowClientModal(true);
      return;
    }

    navigate('/dashboard/create-order');
  };

  const handleBecomeMaster = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      setIsRegisterModalOpen(true);
      return;
    }

    if (user.role === 'customer' || user.role === 'client') {
      setShowMasterModal(true);
      return;
    }

    // Если пользователь уже мастер, перенаправляем в дашборд мастера
    navigate('/master');
  };

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.content}>
          <h2 className={styles.title}>{t('cta.title')}</h2>
          <p className={styles.subtitle}>{t('cta.subtitle')}</p>
        </div>

        <div className={styles.cards}>
          <div className={styles.card}>
            <div className={styles.iconWrapper}>
              <FiUsers className={styles.icon} />
            </div>
            <h3 className={styles.cardTitle}>{t('cta.customer.title')}</h3>
            <p className={styles.cardDescription}>{t('cta.customer.description')}</p>
            <Button 
              variant="primary" 
              onClick={handleCreateOrder}
              rightIcon={<FiArrowRight />}
            >
              {t('cta.customer.button')}
            </Button>
          </div>

          <div className={`${styles.card} ${styles.cardAccent}`}>
            <div className={styles.iconWrapper}>
              <FiTool className={styles.icon} />
            </div>
            <h3 className={styles.cardTitle}>{t('cta.master.title')}</h3>
            <p className={styles.cardDescription}>{t('cta.master.description')}</p>
            <Button 
              variant="secondary" 
              onClick={handleBecomeMaster}
              rightIcon={<FiArrowRight />}
            >
              {t('cta.master.button')}
            </Button>
          </div>
        </div>
      </div>

      {/* Modal for Master trying to create order */}
      {showClientModal && (
        <div className={styles.modalOverlay} onClick={() => setShowClientModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={() => setShowClientModal(false)}>
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
                onClick={() => setShowClientModal(false)}
              >
                {t('modal.understood')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Client trying to become master */}
      {showMasterModal && (
        <div className={styles.modalOverlay} onClick={() => setShowMasterModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={() => setShowMasterModal(false)}>
              <FiX />
            </button>
            <div className={styles.modalIcon}>
              <FiAlertCircle />
            </div>
            <h3 className={styles.modalTitle}>{t('modal.alreadyRegistered')}</h3>
            <p className={styles.modalText}>
              {t('modal.masterRegistrationMessage')}
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
