import { useTranslation } from 'react-i18next';
import styles from './Footer.module.css';
import { MdEmail, MdPhone, MdLocationOn, MdFacebook } from 'react-icons/md';
import { FaInstagram, FaTelegram, FaWhatsapp, FaTwitter } from 'react-icons/fa';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        {/* О компании */}
        <div className={styles.footerSection}>
          <h3 className={styles.footerTitle}>{t('footer.aboutTitle')}</h3>
          <p className={styles.footerText}>
            {t('footer.aboutText')}
          </p>
          <div className={styles.socialLinks}>
            <a href="#" className={styles.socialLink} aria-label="Instagram">
              <FaInstagram />
            </a>
            <a href="#" className={styles.socialLink} aria-label="Facebook">
              <MdFacebook />
            </a>
            <a href="#" className={styles.socialLink} aria-label="Telegram">
              <FaTelegram />
            </a>
            <a href="#" className={styles.socialLink} aria-label="WhatsApp">
              <FaWhatsapp />
            </a>
            <a href="#" className={styles.socialLink} aria-label="Twitter">
              <FaTwitter />
            </a>
          </div>
        </div>

        {/* Быстрые ссылки */}
        <div className={styles.footerSection}>
          <h3 className={styles.footerTitle}>{t('footer.quickLinksTitle')}</h3>
          <ul className={styles.footerList}>
            <li><a href="#" className={styles.footerLink}>{t('footer.aboutUs')}</a></li>
            <li><a href="#" className={styles.footerLink}>{t('footer.howItWorks')}</a></li>
            <li><a href="#" className={styles.footerLink}>{t('footer.pricing')}</a></li>
            <li><a href="#" className={styles.footerLink}>{t('footer.portfolio')}</a></li>
            <li><a href="#" className={styles.footerLink}>{t('footer.blog')}</a></li>
          </ul>
        </div>

        {/* Для клиентов */}
        <div className={styles.footerSection}>
          <h3 className={styles.footerTitle}>{t('footer.forClientsTitle')}</h3>
          <ul className={styles.footerList}>
            <li><a href="#" className={styles.footerLink}>{t('footer.createOrder')}</a></li>
            <li><a href="#" className={styles.footerLink}>{t('footer.findMaster')}</a></li>
            <li><a href="#" className={styles.footerLink}>{t('footer.faq')}</a></li>
            <li><a href="#" className={styles.footerLink}>{t('footer.reviews')}</a></li>
            <li><a href="#" className={styles.footerLink}>{t('footer.guarantees')}</a></li>
          </ul>
        </div>

        {/* Для мастеров */}
        <div className={styles.footerSection}>
          <h3 className={styles.footerTitle}>{t('footer.forMastersTitle')}</h3>
          <ul className={styles.footerList}>
            <li><a href="#" className={styles.footerLink}>{t('footer.becomeMaster')}</a></li>
            <li><a href="#" className={styles.footerLink}>{t('footer.howToStart')}</a></li>
            <li><a href="#" className={styles.footerLink}>{t('footer.commission')}</a></li>
            <li><a href="#" className={styles.footerLink}>{t('footer.support')}</a></li>
            <li><a href="#" className={styles.footerLink}>{t('footer.masterGuide')}</a></li>
          </ul>
        </div>

        {/* Контакты */}
        <div className={styles.footerSection}>
          <h3 className={styles.footerTitle}>{t('footer.contactsTitle')}</h3>
          <ul className={styles.contactList}>
            <li className={styles.contactItem}>
              <MdPhone className={styles.contactIcon} />
              <div>
                <a href="tel:+77001234567" className={styles.contactLink}>+7 (700) 123-45-67</a>
                <span className={styles.contactLabel}>{t('footer.support')}</span>
              </div>
            </li>
            <li className={styles.contactItem}>
              <MdEmail className={styles.contactIcon} />
              <div>
                <a href="mailto:info@alliance.kz" className={styles.contactLink}>info@alliance.kz</a>
                <span className={styles.contactLabel}>{t('footer.email')}</span>
              </div>
            </li>
            <li className={styles.contactItem}>
              <MdLocationOn className={styles.contactIcon} />
              <div>
                <span className={styles.contactText}>{t('footer.address')}</span>
                <span className={styles.contactLabel}>{t('footer.office')}</span>
              </div>
            </li>
          </ul>
        </div>
      </div>

      {/* Нижняя часть */}
      <div className={styles.footerBottom}>
        <div className={styles.footerBottomContent}>
          <p className={styles.copyright}>
            © 2025 Alliance. {t('footer.allRightsReserved')}
          </p>
          <div className={styles.footerLinks}>
            <a href="#" className={styles.footerBottomLink}>{t('footer.privacy')}</a>
            <a href="#" className={styles.footerBottomLink}>{t('footer.terms')}</a>
            <a href="#" className={styles.footerBottomLink}>{t('footer.cookies')}</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
