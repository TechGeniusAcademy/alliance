import { useTranslation } from 'react-i18next';
import styles from './About.module.css';
import { MdCheckCircle, MdGroups, MdStar, MdTrendingUp, MdGpsFixed, MdHandshake, MdEmojiEvents, MdRocket } from 'react-icons/md';
import Footer from '../components/Footer';

const About = () => {
  const { t } = useTranslation();

  const stats = [
    {
      icon: <MdGroups />,
      number: '2,500+',
      labelKey: 'about.stat1'
    },
    {
      icon: <MdCheckCircle />,
      number: '15,000+',
      labelKey: 'about.stat2'
    },
    {
      icon: <MdStar />,
      number: '4.9/5',
      labelKey: 'about.stat3'
    },
    {
      icon: <MdTrendingUp />,
      number: '98%',
      labelKey: 'about.stat4'
    }
  ];

  const values = [
    {
      titleKey: 'about.value1Title',
      descKey: 'about.value1Desc',
      icon: <MdGpsFixed />
    },
    {
      titleKey: 'about.value2Title',
      descKey: 'about.value2Desc',
      icon: <MdHandshake />
    },
    {
      titleKey: 'about.value3Title',
      descKey: 'about.value3Desc',
      icon: <MdEmojiEvents />
    },
    {
      titleKey: 'about.value4Title',
      descKey: 'about.value4Desc',
      icon: <MdRocket />
    }
  ];

  const team = [
    {
      name: 'Алексей Иванов',
      role: 'CEO & Основатель',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80'
    },
    {
      name: 'Мария Петрова',
      role: 'Директор по развитию',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80'
    },
    {
      name: 'Дмитрий Козлов',
      role: 'Технический директор',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80'
    },
    {
      name: 'Елена Смирнова',
      role: 'Руководитель поддержки',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80'
    }
  ];

  return (
    <div className={styles.aboutPage}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.container}>
          <div className={styles.heroGrid}>
            <div className={styles.heroText}>
              <h1 className={styles.mainTitle}>{t('about.heroTitle')}</h1>
              <p className={styles.mainDescription}>{t('about.heroDescription')}</p>
              <div className={styles.heroFeatures}>
                <div className={styles.feature}>
                  <MdCheckCircle className={styles.featureIcon} />
                  <span>{t('about.feature1')}</span>
                </div>
                <div className={styles.feature}>
                  <MdCheckCircle className={styles.featureIcon} />
                  <span>{t('about.feature2')}</span>
                </div>
                <div className={styles.feature}>
                  <MdCheckCircle className={styles.featureIcon} />
                  <span>{t('about.feature3')}</span>
                </div>
              </div>
            </div>
            <div className={styles.heroImageWrapper}>
              <img 
                src="https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?w=800&q=80" 
                alt="About us" 
                className={styles.heroImg}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className={styles.statsSection}>
        <div className={styles.container}>
          <div className={styles.statsGrid}>
            {stats.map((stat, index) => (
              <div key={index} className={styles.statCard}>
                <div className={styles.statIcon}>{stat.icon}</div>
                <div className={styles.statNumber}>{stat.number}</div>
                <div className={styles.statLabel}>{t(stat.labelKey)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className={styles.missionSection}>
        <div className={styles.container}>
          <div className={styles.missionContent}>
            <div className={styles.missionText}>
              <h2 className={styles.sectionTitle}>{t('about.missionTitle')}</h2>
              <p className={styles.missionDescription}>{t('about.missionDesc1')}</p>
              <p className={styles.missionDescription}>{t('about.missionDesc2')}</p>
              <p className={styles.missionDescription}>{t('about.missionDesc3')}</p>
            </div>
            <div className={styles.missionImage}>
              <img src="https://elements-resized.envatousercontent.com/envato-dam-assets-production/bf1c8381-32aa-4189-aaf6-1c4bd8917591/3a9985a1-0ff2-4b1a-8247-fc31dc60cf1b.jpg?w=1600&cf_fit=scale-down&mark-alpha=18&mark=https%3A%2F%2Felements-assets.envato.com%2Fstatic%2Fwatermark4.png&q=85&format=auto&s=edba6f680fa72e9483ceae6f8afb192823e4636b9e94c440954e42b459280d20" alt="Mission" />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className={styles.valuesSection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>{t('about.valuesTitle')}</h2>
          <div className={styles.valuesGrid}>
            {values.map((value, index) => (
              <div key={index} className={styles.valueCard}>
                <div className={styles.valueIcon}>{value.icon}</div>
                <h3 className={styles.valueTitle}>{t(value.titleKey)}</h3>
                <p className={styles.valueDesc}>{t(value.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className={styles.teamSection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>{t('about.teamTitle')}</h2>
          <p className={styles.teamSubtitle}>{t('about.teamSubtitle')}</p>
          <div className={styles.teamGrid}>
            {team.map((member, index) => (
              <div key={index} className={styles.teamCard}>
                <div className={styles.teamImage}>
                  <img src={member.image} alt={member.name} />
                </div>
                <h3 className={styles.teamName}>{member.name}</h3>
                <p className={styles.teamRole}>{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.container}>
          <h2 className={styles.ctaTitle}>{t('about.ctaTitle')}</h2>
          <p className={styles.ctaDesc}>{t('about.ctaDesc')}</p>
          <div className={styles.ctaButtons}>
            <button className={styles.primaryButton}>{t('about.ctaButton1')}</button>
            <button className={styles.secondaryButton}>{t('about.ctaButton2')}</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default About;
