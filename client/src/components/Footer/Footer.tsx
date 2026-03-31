import { Link } from 'react-router-dom';
import { 
  FiMail, 
  FiPhone, 
  FiMapPin,
  FiFacebook,
  FiInstagram,
  FiYoutube,
  FiLinkedin
} from 'react-icons/fi';
import { useLanguage } from '../../context/LanguageContext';
import { ROUTES } from '../../constants';
import styles from './Footer.module.css';

export const Footer = () => {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [
      { path: ROUTES.ABOUT, label: t('footer.about') },
      { path: ROUTES.HOW_IT_WORKS, label: t('footer.howItWorks') },
      { path: ROUTES.PRICING, label: t('footer.pricing') },
      { path: ROUTES.BLOG, label: t('footer.blog') },
      { path: ROUTES.CONTACT, label: t('footer.contact') },
    ],
    services: [
      { path: ROUTES.CATEGORIES, label: t('footer.categories') },
      { path: ROUTES.MASTERS, label: t('footer.findMasters') },
      { path: ROUTES.PROJECTS, label: t('footer.portfolio') },
      { path: ROUTES.ORDERS, label: t('footer.placeOrder') },
    ],
    support: [
      { path: ROUTES.FAQ, label: t('footer.faq') },
      { path: ROUTES.TERMS, label: t('footer.terms') },
      { path: ROUTES.PRIVACY, label: t('footer.privacy') },
    ],
  };

  const socialLinks = [
    { icon: FiFacebook, href: 'https://facebook.com', label: 'Facebook' },
    { icon: FiInstagram, href: 'https://instagram.com', label: 'Instagram' },
    { icon: FiYoutube, href: 'https://youtube.com', label: 'YouTube' },
    { icon: FiLinkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
  ];

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>
          {/* Brand Column */}
          <div className={styles.brand}>
            <Link to={ROUTES.HOME} className={styles.logo}>
              ALLIANCE
            </Link>
            <p className={styles.description}>
              {t('footer.description')}
            </p>
            <div className={styles.contacts}>
              <a href="tel:+77001234567" className={styles.contactItem}>
                <FiPhone />
                <span>+7 (700) 123-45-67</span>
              </a>
              <a href="mailto:info@alliance.kz" className={styles.contactItem}>
                <FiMail />
                <span>info@alliance.kz</span>
              </a>
              <div className={styles.contactItem}>
                <FiMapPin />
                <span>{t('footer.address')}</span>
              </div>
            </div>
          </div>

          {/* Company Links */}
          <div className={styles.column}>
            <h4 className={styles.columnTitle}>{t('footer.companyTitle')}</h4>
            <ul className={styles.links}>
              {footerLinks.company.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className={styles.link}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services Links */}
          <div className={styles.column}>
            <h4 className={styles.columnTitle}>{t('footer.servicesTitle')}</h4>
            <ul className={styles.links}>
              {footerLinks.services.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className={styles.link}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div className={styles.column}>
            <h4 className={styles.columnTitle}>{t('footer.supportTitle')}</h4>
            <ul className={styles.links}>
              {footerLinks.support.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className={styles.link}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            
            {/* Social Links */}
            <div className={styles.social}>
              <h4 className={styles.columnTitle}>{t('footer.socialTitle')}</h4>
              <div className={styles.socialLinks}>
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.socialLink}
                    aria-label={social.label}
                  >
                    <social.icon />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={styles.bottom}>
          <p className={styles.copyright}>
            © {currentYear} ALLIANCE. {t('footer.rights')}
          </p>
          <div className={styles.bottomLinks}>
            <Link to={ROUTES.TERMS} className={styles.bottomLink}>
              {t('footer.terms')}
            </Link>
            <Link to={ROUTES.PRIVACY} className={styles.bottomLink}>
              {t('footer.privacy')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
