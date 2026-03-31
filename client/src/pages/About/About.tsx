import { Link } from 'react-router-dom';
import { 
  FiChevronRight, 
  FiShield, 
  FiHeart, 
  FiUsers, 
  FiTrendingUp,
  FiArrowRight
} from 'react-icons/fi';
import { useLanguage } from '../../context/LanguageContext';
import { ROUTES } from '../../constants';
import { Button } from '../../components/ui/Button';
import styles from './About.module.css';

export const AboutPage = () => {
  const { t } = useLanguage();

  const values = [
    {
      icon: FiShield,
      title: t('aboutPage.values.reliability.title'),
      text: t('aboutPage.values.reliability.text')
    },
    {
      icon: FiHeart,
      title: t('aboutPage.values.care.title'),
      text: t('aboutPage.values.care.text')
    },
    {
      icon: FiUsers,
      title: t('aboutPage.values.community.title'),
      text: t('aboutPage.values.community.text')
    },
    {
      icon: FiTrendingUp,
      title: t('aboutPage.values.growth.title'),
      text: t('aboutPage.values.growth.text')
    }
  ];

  const timeline = [
    {
      year: '2022',
      title: t('aboutPage.timeline.2022.title'),
      text: t('aboutPage.timeline.2022.text')
    },
    {
      year: '2023',
      title: t('aboutPage.timeline.2023.title'),
      text: t('aboutPage.timeline.2023.text')
    },
    {
      year: '2024',
      title: t('aboutPage.timeline.2024.title'),
      text: t('aboutPage.timeline.2024.text')
    },
    {
      year: '2025',
      title: t('aboutPage.timeline.2025.title'),
      text: t('aboutPage.timeline.2025.text')
    }
  ];

  const team = [
    {
      name: t('aboutPage.team.ceo.name'),
      role: t('aboutPage.team.ceo.role'),
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face'
    },
    {
      name: t('aboutPage.team.coo.name'),
      role: t('aboutPage.team.coo.role'),
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face'
    },
    {
      name: t('aboutPage.team.cto.name'),
      role: t('aboutPage.team.cto.role'),
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face'
    },
    {
      name: t('aboutPage.team.cmo.name'),
      role: t('aboutPage.team.cmo.role'),
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face'
    }
  ];

  return (
    <>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContainer}>
          <nav className={styles.breadcrumbs}>
            <Link to={ROUTES.HOME}>{t('nav.home')}</Link>
            <FiChevronRight className={styles.breadcrumbSeparator} />
            <span>{t('nav.about')}</span>
          </nav>
          <h1 className={styles.heroTitle}>{t('aboutPage.heroTitle')}</h1>
          <p className={styles.heroSubtitle}>
            {t('aboutPage.heroSubtitle')}
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className={styles.mission}>
        <div className={styles.missionContainer}>
          <div className={styles.missionGrid}>
            <div className={styles.missionContent}>
              <span className={styles.missionLabel}>{t('aboutPage.missionLabel')}</span>
              <h2 className={styles.missionTitle}>
                {t('aboutPage.missionTitle')}
              </h2>
              <p className={styles.missionText}>
                {t('aboutPage.missionText1')}
              </p>
              <p className={styles.missionText}>
                {t('aboutPage.missionText2')}
              </p>
            </div>
            <div className={styles.missionImage}>
              <img 
                src="https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=600&h=450&fit=crop" 
                alt="Furniture master at work"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className={styles.values}>
        <div className={styles.valuesContainer}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{t('aboutPage.valuesTitle')}</h2>
            <p className={styles.sectionSubtitle}>
              {t('aboutPage.valuesSubtitle')}
            </p>
          </div>
          <div className={styles.valuesGrid}>
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div key={index} className={styles.valueCard}>
                  <div className={styles.valueIcon}>
                    <Icon />
                  </div>
                  <h3 className={styles.valueTitle}>{value.title}</h3>
                  <p className={styles.valueText}>{value.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className={styles.timeline}>
        <div className={styles.timelineContainer}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{t('aboutPage.historyTitle')}</h2>
            <p className={styles.sectionSubtitle}>
              {t('aboutPage.historySubtitle')}
            </p>
          </div>
          <div className={styles.timelineList}>
            {timeline.map((item, index) => (
              <div key={index} className={styles.timelineItem}>
                <div className={styles.timelineDot}></div>
                <div className={styles.timelineContent}>
                  <span className={styles.timelineYear}>{item.year}</span>
                  <h3 className={styles.timelineTitle}>{item.title}</h3>
                  <p className={styles.timelineText}>{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className={styles.team}>
        <div className={styles.teamContainer}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{t('aboutPage.teamTitle')}</h2>
            <p className={styles.sectionSubtitle}>
              {t('aboutPage.teamSubtitle')}
            </p>
          </div>
          <div className={styles.teamGrid}>
            {team.map((member, index) => (
              <div key={index} className={styles.teamCard}>
                <div className={styles.teamImage}>
                  <img src={member.image} alt={member.name} />
                </div>
                <div className={styles.teamInfo}>
                  <h3 className={styles.teamName}>{member.name}</h3>
                  <p className={styles.teamRole}>{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.cta}>
        <div className={styles.ctaContainer}>
          <h2 className={styles.ctaTitle}>{t('aboutPage.ctaTitle')}</h2>
          <p className={styles.ctaText}>
            {t('aboutPage.ctaText')}
          </p>
          <div className={styles.ctaButtons}>
            <Button 
              variant="primary" 
              size="large" 
              as={Link} 
              to={ROUTES.MASTERS}
              rightIcon={<FiArrowRight />}
              style={{ backgroundColor: 'white', color: '#8B4513' }}
            >
              {t('aboutPage.findMaster')}
            </Button>
            <Button 
              variant="outline" 
              size="large" 
              as={Link} 
              to={ROUTES.CONTACT}
              rightIcon={<FiArrowRight />}
              style={{ borderColor: 'white', color: 'white' }}
            >
              {t('aboutPage.contactUs')}
            </Button>
          </div>
        </div>
      </section>
    </>
  );
};
