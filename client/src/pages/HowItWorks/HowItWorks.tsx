import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiChevronRight, 
  FiChevronDown,
  FiEdit3,
  FiInbox,
  FiUserCheck,
  FiFileText,
  FiCheckCircle,
  FiUser,
  FiBriefcase,
  FiSend,
  FiTool,
  FiDollarSign,
  FiLock,
  FiShield,
  FiHeadphones,
  FiAlertCircle,
  FiArrowRight
} from 'react-icons/fi';
import { useLanguage } from '../../context/LanguageContext';
import { ROUTES } from '../../constants';
import { Button } from '../../components/ui/Button';
import AuthModal from '../../components/AuthModal';
import styles from './HowItWorks.module.css';

type UserType = 'customer' | 'master';

export const HowItWorksPage = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<UserType>('customer');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [showMasterWarning, setShowMasterWarning] = useState(false);

  // Проверка авторизации
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');

  const handleCreateOrder = () => {
    if (!token) {
      // Если не авторизован - показать модальное окно
      setAuthModalOpen(true);
    } else if (userRole === 'master') {
      // Если авторизован как мастер - показать предупреждение
      setShowMasterWarning(true);
      setTimeout(() => setShowMasterWarning(false), 5000);
    } else {
      // Если авторизован как клиент - перейти к созданию заказа
      window.location.href = '/dashboard/create-order';
    }
  };

  const customerSteps = [
    {
      number: 1,
      icon: FiEdit3,
      title: t('howItWorksPage.customer.step1.title'),
      description: t('howItWorksPage.customer.step1.description'),
      tip: t('howItWorksPage.customer.step1.tip'),
      image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&h=450&fit=crop'
    },
    {
      number: 2,
      icon: FiInbox,
      title: t('howItWorksPage.customer.step2.title'),
      description: t('howItWorksPage.customer.step2.description'),
      tip: t('howItWorksPage.customer.step2.tip'),
      image: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=600&h=450&fit=crop'
    },
    {
      number: 3,
      icon: FiUserCheck,
      title: t('howItWorksPage.customer.step3.title'),
      description: t('howItWorksPage.customer.step3.description'),
      tip: t('howItWorksPage.customer.step3.tip'),
      image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=450&fit=crop'
    },
    {
      number: 4,
      icon: FiFileText,
      title: t('howItWorksPage.customer.step4.title'),
      description: t('howItWorksPage.customer.step4.description'),
      tip: t('howItWorksPage.customer.step4.tip'),
      image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&h=450&fit=crop'
    },
    {
      number: 5,
      icon: FiCheckCircle,
      title: t('howItWorksPage.customer.step5.title'),
      description: t('howItWorksPage.customer.step5.description'),
      tip: t('howItWorksPage.customer.step5.tip'),
      image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=450&fit=crop'
    }
  ];

  const masterSteps = [
    {
      number: 1,
      icon: FiUser,
      title: t('howItWorksPage.master.step1.title'),
      description: t('howItWorksPage.master.step1.description'),
      tip: t('howItWorksPage.master.step1.tip'),
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=450&fit=crop'
    },
    {
      number: 2,
      icon: FiBriefcase,
      title: t('howItWorksPage.master.step2.title'),
      description: t('howItWorksPage.master.step2.description'),
      tip: t('howItWorksPage.master.step2.tip'),
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=450&fit=crop'
    },
    {
      number: 3,
      icon: FiSend,
      title: t('howItWorksPage.master.step3.title'),
      description: t('howItWorksPage.master.step3.description'),
      tip: t('howItWorksPage.master.step3.tip'),
      image: 'https://images.unsplash.com/photo-1531538606174-0f90ff5dce83?w=600&h=450&fit=crop'
    },
    {
      number: 4,
      icon: FiTool,
      title: t('howItWorksPage.master.step4.title'),
      description: t('howItWorksPage.master.step4.description'),
      tip: t('howItWorksPage.master.step4.tip'),
      image: 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=600&h=450&fit=crop'
    },
    {
      number: 5,
      icon: FiDollarSign,
      title: t('howItWorksPage.master.step5.title'),
      description: t('howItWorksPage.master.step5.description'),
      tip: t('howItWorksPage.master.step5.tip'),
      image: 'https://images.unsplash.com/photo-1579621970795-87facc2f976d?w=600&h=450&fit=crop'
    }
  ];

  const securityFeatures = [
    {
      icon: FiLock,
      title: t('howItWorksPage.security.payment.title'),
      text: t('howItWorksPage.security.payment.text')
    },
    {
      icon: FiShield,
      title: t('howItWorksPage.security.guarantee.title'),
      text: t('howItWorksPage.security.guarantee.text')
    },
    {
      icon: FiHeadphones,
      title: t('howItWorksPage.security.support.title'),
      text: t('howItWorksPage.security.support.text')
    }
  ];

  const faqItems = [
    {
      question: t('howItWorksPage.faq.q1.question'),
      answer: t('howItWorksPage.faq.q1.answer')
    },
    {
      question: t('howItWorksPage.faq.q2.question'),
      answer: t('howItWorksPage.faq.q2.answer')
    },
    {
      question: t('howItWorksPage.faq.q3.question'),
      answer: t('howItWorksPage.faq.q3.answer')
    },
    {
      question: t('howItWorksPage.faq.q4.question'),
      answer: t('howItWorksPage.faq.q4.answer')
    }
  ];

  const steps = activeTab === 'customer' ? customerSteps : masterSteps;

  return (
    <>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContainer}>
          <nav className={styles.breadcrumbs}>
            <Link to={ROUTES.HOME}>{t('nav.home')}</Link>
            <FiChevronRight className={styles.breadcrumbSeparator} />
            <span>{t('nav.howItWorks')}</span>
          </nav>
          <h1 className={styles.heroTitle}>{t('howItWorksPage.hero.title')}</h1>
          <p className={styles.heroSubtitle}>
            {t('howItWorksPage.hero.subtitle')}
          </p>
          <div className={styles.tabs}>
            <button 
              className={`${styles.tab} ${activeTab === 'customer' ? styles.active : ''}`}
              onClick={() => setActiveTab('customer')}
            >
              {t('howItWorksPage.hero.tabCustomer')}
            </button>
            <button 
              className={`${styles.tab} ${activeTab === 'master' ? styles.active : ''}`}
              onClick={() => setActiveTab('master')}
            >
              {t('howItWorksPage.hero.tabMaster')}
            </button>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className={styles.steps}>
        <div className={styles.stepsContainer}>
          <div className={styles.stepsList}>
            {steps.map((step, index) => {
              const _Icon = step.icon;
              return (
                <div key={index} className={styles.step}>
                  <div className={styles.stepContent}>
                    <div className={styles.stepNumber}>{step.number}</div>
                    <h2 className={styles.stepTitle}>{step.title}</h2>
                    <p className={styles.stepDescription}>{step.description}</p>
                    <div className={styles.stepTip}>
                      <FiAlertCircle />
                      <span>{step.tip}</span>
                    </div>
                  </div>
                  <div className={styles.stepImage}>
                    <img src={step.image} alt={step.title} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className={styles.security}>
        <div className={styles.securityContainer}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{t('howItWorksPage.security.title')}</h2>
            <p className={styles.sectionSubtitle}>
              {t('howItWorksPage.security.subtitle')}
            </p>
          </div>
          <div className={styles.securityGrid}>
            {securityFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className={styles.securityCard}>
                  <div className={styles.securityIcon}>
                    <Icon />
                  </div>
                  <h3 className={styles.securityTitle}>{feature.title}</h3>
                  <p className={styles.securityText}>{feature.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className={styles.faq}>
        <div className={styles.faqContainer}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{t('howItWorksPage.faq.title')}</h2>
            <p className={styles.sectionSubtitle}>
              {t('howItWorksPage.faq.subtitle')}
            </p>
          </div>
          <div className={styles.faqList}>
            {faqItems.map((item, index) => (
              <div 
                key={index} 
                className={`${styles.faqItem} ${openFaq === index ? styles.open : ''}`}
              >
                <button 
                  className={styles.faqQuestion}
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                >
                  {item.question}
                  <FiChevronDown />
                </button>
                {openFaq === index && (
                  <div className={styles.faqAnswer}>
                    {item.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className={styles.faqMore}>
            <Button 
              variant="outline" 
              as={Link} 
              to={ROUTES.FAQ}
              rightIcon={<FiArrowRight />}
            >
              {t('howItWorksPage.faq.moreButton')}
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.cta}>
        <div className={styles.ctaContainer}>
          <div className={styles.ctaGrid}>
            <div className={`${styles.ctaCard} ${styles.customer}`}>
              <h3 className={styles.ctaCardTitle}>{t('howItWorksPage.cta.customerTitle')}</h3>
              <p className={styles.ctaCardText}>
                {t('howItWorksPage.cta.customerText')}
              </p>
              <Button 
                variant="primary" 
                size="large" 
                onClick={handleCreateOrder}
                rightIcon={<FiArrowRight />}
                style={{ backgroundColor: 'white', color: '#1A365D' }}
              >
                {t('howItWorksPage.cta.customerButton')}
              </Button>
              {showMasterWarning && (
                <div style={{
                  marginTop: '16px',
                  padding: '12px',
                  backgroundColor: '#fff3cd',
                  border: '1px solid #ffc107',
                  borderRadius: '8px',
                  color: '#856404',
                  fontSize: '14px'
                }}>
                  {t('howItWorksPage.masterCannotCreateOrder') || 'Мастера не могут создавать заказы. Создавать заказы могут только клиенты.'}
                </div>
              )}
            </div>
            <div className={`${styles.ctaCard} ${styles.master}`}>
              <h3 className={styles.ctaCardTitle}>{t('howItWorksPage.cta.masterTitle')}</h3>
              <p className={styles.ctaCardText}>
                {t('howItWorksPage.cta.masterText')}
              </p>
              <Button 
                variant="primary" 
                size="large" 
                as={Link} 
                to={ROUTES.MASTERS}
                rightIcon={<FiArrowRight />}
                style={{ backgroundColor: 'white', color: '#8B4513' }}
              >
                {t('howItWorksPage.cta.masterButton')}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSwitchToRegister={() => {}}
      />
    </>
  );
};
