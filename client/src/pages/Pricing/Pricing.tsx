import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiCheck,
  FiChevronDown,
  FiArrowRight,
  FiPercent,
  FiShield,
  FiClock,
  FiDollarSign,
  FiUsers,
  FiStar,
  FiPhone,
  FiHelpCircle,
  FiAlertCircle
} from 'react-icons/fi';
import { useLanguage } from '../../context/LanguageContext';
import AuthModal from '../../components/AuthModal';
import styles from './Pricing.module.css';

export const PricingPage = () => {
  const { t } = useLanguage();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [showMasterWarning, setShowMasterWarning] = useState(false);
  const [showClientWarning, setShowClientWarning] = useState(false);

  const toggleFaq = (id: number) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  // Проверка авторизации
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');

  const handleBecomeMaster = () => {
    if (!token) {
      setAuthModalOpen(true);
    } else if (userRole === 'master') {
      window.location.href = '/master-dashboard';
    } else if (userRole === 'client') {
      setShowClientWarning(true);
      setTimeout(() => setShowClientWarning(false), 5000);
    }
  };

  const handleCreateOrder = () => {
    if (!token) {
      setAuthModalOpen(true);
    } else if (userRole === 'master') {
      setShowMasterWarning(true);
      setTimeout(() => setShowMasterWarning(false), 5000);
    } else {
      window.location.href = '/dashboard/create-order';
    }
  };

  const handleRegister = () => {
    if (!token) {
      setAuthModalOpen(true);
    } else if (userRole === 'master') {
      window.location.href = '/master-dashboard';
    } else {
      window.location.href = '/dashboard';
    }
  };

  const commissionTiers = [
    {
      range: t('pricingPage.commission.tier1.range'),
      commission: t('pricingPage.commission.tier1.rate'),
      description: t('pricingPage.commission.tier1.description')
    },
    {
      range: t('pricingPage.commission.tier2.range'),
      commission: t('pricingPage.commission.tier2.rate'),
      description: t('pricingPage.commission.tier2.description')
    },
    {
      range: t('pricingPage.commission.tier3.range'),
      commission: t('pricingPage.commission.tier3.rate'),
      description: t('pricingPage.commission.tier3.description')
    }
  ];

  const benefits = [
    {
      icon: <FiShield />,
      title: t('pricingPage.benefits.security.title'),
      description: t('pricingPage.benefits.security.description')
    },
    {
      icon: <FiPercent />,
      title: t('pricingPage.benefits.transparent.title'),
      description: t('pricingPage.benefits.transparent.description')
    },
    {
      icon: <FiClock />,
      title: t('pricingPage.benefits.fast.title'),
      description: t('pricingPage.benefits.fast.description')
    },
    {
      icon: <FiDollarSign />,
      title: t('pricingPage.benefits.noHidden.title'),
      description: t('pricingPage.benefits.noHidden.description')
    }
  ];

  const forMasters = [
    t('pricingPage.forMasters.item1'),
    t('pricingPage.forMasters.item2'),
    t('pricingPage.forMasters.item3'),
    t('pricingPage.forMasters.item4'),
    t('pricingPage.forMasters.item5'),
    t('pricingPage.forMasters.item6')
  ];

  const forClients = [
    t('pricingPage.forClients.item1'),
    t('pricingPage.forClients.item2'),
    t('pricingPage.forClients.item3'),
    t('pricingPage.forClients.item4'),
    t('pricingPage.forClients.item5'),
    t('pricingPage.forClients.item6')
  ];

  const stats = [
    { value: '5000+', label: t('pricingPage.stats.masters') },
    { value: '15 000+', label: t('pricingPage.stats.orders') },
    { value: '98%', label: t('pricingPage.stats.satisfaction') },
    { value: '24/7', label: t('pricingPage.stats.support') }
  ];

  const faqs = [
    {
      id: 1,
      question: t('pricingPage.faq.q1.question'),
      answer: t('pricingPage.faq.q1.answer')
    },
    {
      id: 2,
      question: t('pricingPage.faq.q2.question'),
      answer: t('pricingPage.faq.q2.answer')
    },
    {
      id: 3,
      question: t('pricingPage.faq.q3.question'),
      answer: t('pricingPage.faq.q3.answer')
    },
    {
      id: 4,
      question: t('pricingPage.faq.q4.question'),
      answer: t('pricingPage.faq.q4.answer')
    },
    {
      id: 5,
      question: t('pricingPage.faq.q5.question'),
      answer: t('pricingPage.faq.q5.answer')
    },
    {
      id: 6,
      question: t('pricingPage.faq.q6.question'),
      answer: t('pricingPage.faq.q6.answer')
    }
  ];

  const testimonials = [
    {
      name: t('pricingPage.testimonials.review1.name'),
      role: t('pricingPage.testimonials.review1.role'),
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
      text: t('pricingPage.testimonials.review1.text')
    },
    {
      name: t('pricingPage.testimonials.review2.name'),
      role: t('pricingPage.testimonials.review2.role'),
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
      text: t('pricingPage.testimonials.review2.text')
    },
    {
      name: t('pricingPage.testimonials.review3.name'),
      role: t('pricingPage.testimonials.review3.role'),
      avatar: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop',
      text: t('pricingPage.testimonials.review3.text')
    }
  ];

  return (
    <div className={styles.pricing}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContainer}>
          <div className={styles.breadcrumbs}>
            <Link to="/">{t('pricingPage.breadcrumb.home')}</Link>
            <span>/</span>
            <span>{t('pricingPage.breadcrumb.pricing')}</span>
          </div>
          
          <h1>{t('pricingPage.hero.title')}</h1>
          <p>
            {t('pricingPage.hero.subtitle')}
          </p>

          <div className={styles.heroStats}>
            {stats.map((stat, index) => (
              <div key={index} className={styles.statItem}>
                <span className={styles.statValue}>{stat.value}</span>
                <span className={styles.statLabel}>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Commission Section */}
      <section className={styles.commissionSection}>
        <div className={styles.commissionContainer}>
          <div className={styles.sectionHeader}>
            <h2>{t('pricingPage.commission.title')}</h2>
            <p>{t('pricingPage.commission.subtitle')}</p>
          </div>

          <div className={styles.commissionGrid}>
            {commissionTiers.map((tier, index) => (
              <div key={index} className={styles.commissionCard}>
                <div className={styles.commissionRange}>{tier.range}</div>
                <div className={styles.commissionRate}>{tier.commission}</div>
                <div className={styles.commissionDesc}>{tier.description}</div>
              </div>
            ))}
          </div>

          <div className={styles.commissionNote}>
            <FiHelpCircle />
            <span>{t('pricingPage.commission.note')}</span>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className={styles.benefitsSection}>
        <div className={styles.benefitsContainer}>
          <div className={styles.sectionHeader}>
            <h2>{t('pricingPage.benefits.title')}</h2>
            <p>{t('pricingPage.benefits.subtitle')}</p>
          </div>

          <div className={styles.benefitsGrid}>
            {benefits.map((benefit, index) => (
              <div key={index} className={styles.benefitCard}>
                <div className={styles.benefitIcon}>{benefit.icon}</div>
                <h3>{benefit.title}</h3>
                <p>{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Who Section */}
      <section className={styles.forWhoSection}>
        <div className={styles.forWhoContainer}>
          <div className={styles.forWhoGrid}>
            <div className={styles.forWhoCard}>
              <div className={styles.forWhoHeader}>
                <FiUsers />
                <h3>{t('pricingPage.forMasters.title')}</h3>
              </div>
              <ul className={styles.forWhoList}>
                {forMasters.map((item, index) => (
                  <li key={index}>
                    <FiCheck />
                    {item}
                  </li>
                ))}
              </ul>
              <button onClick={handleBecomeMaster} className={styles.forWhoBtn}>
                {t('pricingPage.forMasters.button')}
                <FiArrowRight />
              </button>
            </div>

            <div className={styles.forWhoCard}>
              <div className={styles.forWhoHeader}>
                <FiStar />
                <h3>{t('pricingPage.forClients.title')}</h3>
              </div>
              <ul className={styles.forWhoList}>
                {forClients.map((item, index) => (
                  <li key={index}>
                    <FiCheck />
                    {item}
                  </li>
                ))}
              </ul>
              <button onClick={handleCreateOrder} className={styles.forWhoBtnOutline}>
                {t('pricingPage.forClients.button')}
                <FiArrowRight />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* How Payment Works */}
      <section className={styles.paymentSection}>
        <div className={styles.paymentContainer}>
          <div className={styles.sectionHeader}>
            <h2>{t('pricingPage.payment.title')}</h2>
            <p>{t('pricingPage.payment.subtitle')}</p>
          </div>

          <div className={styles.paymentSteps}>
            <div className={styles.paymentStep}>
              <div className={styles.stepNumber}>1</div>
              <h4>{t('pricingPage.payment.step1.title')}</h4>
              <p>{t('pricingPage.payment.step1.description')}</p>
            </div>
            <div className={styles.paymentArrow}>→</div>
            <div className={styles.paymentStep}>
              <div className={styles.stepNumber}>2</div>
              <h4>{t('pricingPage.payment.step2.title')}</h4>
              <p>{t('pricingPage.payment.step2.description')}</p>
            </div>
            <div className={styles.paymentArrow}>→</div>
            <div className={styles.paymentStep}>
              <div className={styles.stepNumber}>3</div>
              <h4>{t('pricingPage.payment.step3.title')}</h4>
              <p>{t('pricingPage.payment.step3.description')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className={styles.testimonialsSection}>
        <div className={styles.testimonialsContainer}>
          <div className={styles.sectionHeader}>
            <h2>{t('pricingPage.testimonials.title')}</h2>
            <p>{t('pricingPage.testimonials.subtitle')}</p>
          </div>
          
          <div className={styles.testimonialsGrid}>
            {testimonials.map((testimonial, index) => (
              <div key={index} className={styles.testimonialCard}>
                <div className={styles.testimonialHeader}>
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.name}
                    className={styles.testimonialAvatar}
                  />
                  <div className={styles.testimonialInfo}>
                    <h4>{testimonial.name}</h4>
                    <span>{testimonial.role}</span>
                  </div>
                </div>
                <p className={styles.testimonialText}>"{testimonial.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className={styles.faqSection}>
        <div className={styles.faqContainer}>
          <div className={styles.sectionHeader}>
            <h2>{t('pricingPage.faq.title')}</h2>
            <p>{t('pricingPage.faq.subtitle')}</p>
          </div>
          
          <div className={styles.faqList}>
            {faqs.map((faq) => (
              <div 
                key={faq.id} 
                className={`${styles.faqItem} ${openFaq === faq.id ? styles.open : ''}`}
              >
                <button 
                  className={styles.faqHeader}
                  onClick={() => toggleFaq(faq.id)}
                >
                  {faq.question}
                  <FiChevronDown />
                </button>
                {openFaq === faq.id && (
                  <div className={styles.faqBody}>
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaContainer}>
          <h2>{t('pricingPage.cta.title')}</h2>
          <p>
            {t('pricingPage.cta.subtitle')}
          </p>
          
          <div className={styles.ctaButtons}>
            <button onClick={handleRegister} className={styles.ctaBtnPrimary}>
              {t('pricingPage.cta.registerButton')}
              <FiArrowRight />
            </button>
            <Link to="/contact" className={styles.ctaBtnOutline}>
              <FiPhone />
              {t('pricingPage.cta.contactButton')}
            </Link>
          </div>
        </div>
      </section>

      {/* Предупреждения */}
      {showMasterWarning && (
        <div className={styles.warningBanner}>
          <FiAlertCircle />
          <span>{t('howItWorksPage.masterCannotCreateOrder')}</span>
        </div>
      )}

      {showClientWarning && (
        <div className={styles.warningBanner}>
          <FiAlertCircle />
          <span>Вы уже зарегистрированы как клиент. Обратитесь в поддержку для изменения роли.</span>
        </div>
      )}

      {/* Модальное окно авторизации */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
};
