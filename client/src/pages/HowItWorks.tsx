import { useTranslation } from 'react-i18next';
import { 
  MdCreate, 
  MdSearch, 
  MdHandshake, 
  MdPayment,
  MdCheckCircle,
  MdStar,
  MdPerson,
  MdWork,
  MdNotifications,
  MdAttachMoney
} from 'react-icons/md';
import styles from './HowItWorks.module.css';
import Footer from '../components/Footer';

const HowItWorks = () => {
  const { t } = useTranslation();

  const customerSteps = [
    {
      icon: <MdCreate />,
      title: t('howItWorks.customer.step1.title'),
      description: t('howItWorks.customer.step1.description'),
      color: '#FF6B6B'
    },
    {
      icon: <MdSearch />,
      title: t('howItWorks.customer.step2.title'),
      description: t('howItWorks.customer.step2.description'),
      color: '#4ECDC4'
    },
    {
      icon: <MdHandshake />,
      title: t('howItWorks.customer.step3.title'),
      description: t('howItWorks.customer.step3.description'),
      color: '#45B7D1'
    },
    {
      icon: <MdPayment />,
      title: t('howItWorks.customer.step4.title'),
      description: t('howItWorks.customer.step4.description'),
      color: '#96CEB4'
    },
    {
      icon: <MdCheckCircle />,
      title: t('howItWorks.customer.step5.title'),
      description: t('howItWorks.customer.step5.description'),
      color: '#FFEAA7'
    },
    {
      icon: <MdStar />,
      title: t('howItWorks.customer.step6.title'),
      description: t('howItWorks.customer.step6.description'),
      color: '#DDA15E'
    }
  ];

  const masterSteps = [
    {
      icon: <MdPerson />,
      title: t('howItWorks.master.step1.title'),
      description: t('howItWorks.master.step1.description'),
      color: '#FF6B6B'
    },
    {
      icon: <MdNotifications />,
      title: t('howItWorks.master.step2.title'),
      description: t('howItWorks.master.step2.description'),
      color: '#4ECDC4'
    },
    {
      icon: <MdWork />,
      title: t('howItWorks.master.step3.title'),
      description: t('howItWorks.master.step3.description'),
      color: '#45B7D1'
    },
    {
      icon: <MdAttachMoney />,
      title: t('howItWorks.master.step4.title'),
      description: t('howItWorks.master.step4.description'),
      color: '#96CEB4'
    }
  ];

  const features = [
    {
      icon: <MdCheckCircle />,
      title: t('howItWorks.features.safety.title'),
      description: t('howItWorks.features.safety.description')
    },
    {
      icon: <MdPayment />,
      title: t('howItWorks.features.payment.title'),
      description: t('howItWorks.features.payment.description')
    },
    {
      icon: <MdStar />,
      title: t('howItWorks.features.quality.title'),
      description: t('howItWorks.features.quality.description')
    },
    {
      icon: <MdHandshake />,
      title: t('howItWorks.features.support.title'),
      description: t('howItWorks.features.support.description')
    }
  ];

  return (
    <>
      <div className={styles.howItWorksPage}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>{t('howItWorks.hero.title')}</h1>
            <p className={styles.heroDescription}>
              {t('howItWorks.hero.description')}
            </p>
          </div>
        </section>

        {/* Customer Process */}
        <section className={styles.processSection}>
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>{t('howItWorks.customer.title')}</h2>
              <p className={styles.sectionDescription}>
                {t('howItWorks.customer.subtitle')}
              </p>
            </div>

            <div className={styles.stepsGrid}>
              {customerSteps.map((step, index) => (
                <div key={index} className={styles.stepCard}>
                  <div className={styles.stepNumber} style={{ background: step.color }}>
                    {index + 1}
                  </div>
                  <div className={styles.stepIcon} style={{ color: step.color }}>
                    {step.icon}
                  </div>
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <p className={styles.stepDescription}>{step.description}</p>
                  {index < customerSteps.length - 1 && (
                    <div className={styles.stepArrow}>→</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Master Process */}
        <section className={styles.processSection} style={{ background: '#f8f9fa' }}>
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>{t('howItWorks.master.title')}</h2>
              <p className={styles.sectionDescription}>
                {t('howItWorks.master.subtitle')}
              </p>
            </div>

            <div className={styles.stepsGrid}>
              {masterSteps.map((step, index) => (
                <div key={index} className={styles.stepCard}>
                  <div className={styles.stepNumber} style={{ background: step.color }}>
                    {index + 1}
                  </div>
                  <div className={styles.stepIcon} style={{ color: step.color }}>
                    {step.icon}
                  </div>
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <p className={styles.stepDescription}>{step.description}</p>
                  {index < masterSteps.length - 1 && (
                    <div className={styles.stepArrow}>→</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className={styles.featuresSection}>
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>{t('howItWorks.features.title')}</h2>
              <p className={styles.sectionDescription}>
                {t('howItWorks.features.subtitle')}
              </p>
            </div>

            <div className={styles.featuresGrid}>
              {features.map((feature, index) => (
                <div key={index} className={styles.featureCard}>
                  <div className={styles.featureIcon}>{feature.icon}</div>
                  <h3 className={styles.featureTitle}>{feature.title}</h3>
                  <p className={styles.featureDescription}>{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className={styles.ctaSection}>
          <div className={styles.ctaContent}>
            <h2 className={styles.ctaTitle}>{t('howItWorks.cta.title')}</h2>
            <p className={styles.ctaDescription}>{t('howItWorks.cta.description')}</p>
            <div className={styles.ctaButtons}>
              <button className={styles.primaryButton}>
                {t('howItWorks.cta.startButton')}
              </button>
              <button className={styles.secondaryButton}>
                {t('howItWorks.cta.masterButton')}
              </button>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default HowItWorks;
