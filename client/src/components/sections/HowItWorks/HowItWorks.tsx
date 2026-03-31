import { FiFileText, FiUsers, FiUserCheck, FiCheck, FiArrowRight, FiX, FiAlertCircle } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import styles from './HowItWorks.module.css';

export const HowItWorks = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [showMasterModal, setShowMasterModal] = useState(false);

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
      navigate('/login');
      return;
    }

    if (user.role === 'master') {
      setShowMasterModal(true);
      return;
    }

    navigate('/create-order');
  };

  const steps = [
    {
      icon: FiFileText,
      step: '01',
      title: t('howItWorks.step1.title'),
      description: t('howItWorks.step1.description'),
    },
    {
      icon: FiUsers,
      step: '02',
      title: t('howItWorks.step2.title'),
      description: t('howItWorks.step2.description'),
    },
    {
      icon: FiUserCheck,
      step: '03',
      title: t('howItWorks.step3.title'),
      description: t('howItWorks.step3.description'),
    },
    {
      icon: FiCheck,
      step: '04',
      title: t('howItWorks.step4.title'),
      description: t('howItWorks.step4.description'),
    },
  ];

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>{t('howItWorks.title')}</h2>
          <p className={styles.subtitle}>{t('howItWorks.subtitle')}</p>
        </div>

        <div className={styles.steps}>
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className={styles.stepItem}>
                <div className={styles.stepHeader}>
                  <div className={styles.stepNumber}>{step.step}</div>
                  <div className={styles.iconWrapper}>
                    <Icon className={styles.icon} />
                  </div>
                </div>
                <div className={styles.stepContent}>
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <p className={styles.stepDescription}>{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className={styles.connector}>
                    <FiArrowRight className={styles.arrow} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className={styles.actions}>
          <button onClick={handleCreateOrder} className={styles.primaryBtn}>
            {t('howItWorks.createOrder')}
          </button>
          <Link to="/how-it-works" className={styles.linkBtn}>
            {t('howItWorks.learnMore')}
            <FiArrowRight className={styles.linkIcon} />
          </Link>
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
    </section>
  );
};
