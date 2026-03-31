import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiMapPin,
  FiPhone,
  FiMail,
  FiClock,
  FiSend,
  FiUpload,
  FiMessageCircle,
  FiHelpCircle,
  FiFileText,
  FiArrowRight,
  FiMap,
  FiInstagram,
  FiFacebook,
  FiYoutube,
  FiCheck,
  FiX as FiClose
} from 'react-icons/fi';
import { useLanguage } from '../../context/LanguageContext';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';
import styles from './Contact.module.css';

export const ContactPage = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      if (selectedFiles.length > 5) {
        setSubmitError('Максимум 5 файлов');
        return;
      }
      const totalSize = selectedFiles.reduce((sum, file) => sum + file.size, 0);
      if (totalSize > 50 * 1024 * 1024) {
        setSubmitError('Общий размер файлов не должен превышать 50 МБ');
        return;
      }
      setFiles(selectedFiles);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('subject', formData.subject);
      formDataToSend.append('message', formData.message);
      
      files.forEach((file) => {
        formDataToSend.append('attachments', file);
      });

      await axios.post(`${API_BASE_URL}/api/feedback`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setSubmitSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
      setFiles([]);
      
      // Скрыть сообщение об успехе через 5 секунд
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (error: any) {
      console.error('Error submitting feedback:', error);
      setSubmitError(error.response?.data?.error || 'Произошла ошибка при отправке сообщения');
    } finally {
      setIsSubmitting(false);
    }
  };

  const offices = [
    {
      city: t('contactPage.almaty'),
      address: t('contactPage.almatyAddress'),
      phone: '+7 (727) 355-55-55',
      email: 'almaty@alliance.kz'
    },
    {
      city: t('contactPage.astana'),
      address: t('contactPage.astanaAddress'),
      phone: '+7 (717) 255-55-55',
      email: 'astana@alliance.kz'
    },
    {
      city: t('contactPage.shymkent'),
      address: t('contactPage.shymkentAddress'),
      phone: '+7 (725) 255-55-55',
      email: 'shymkent@alliance.kz'
    }
  ];

  return (
    <div className={styles.contact}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContainer}>
          <div className={styles.breadcrumbs}>
            <Link to="/">{t('nav.home')}</Link>
            <span>/</span>
            <span>{t('nav.contact')}</span>
          </div>
          
          <h1>{t('contactPage.heroTitle')}</h1>
          <p>
            {t('contactPage.heroSubtitle')}
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className={styles.mainContent}>
        <div className={styles.contactGrid}>
          {/* Contact Info */}
          <div className={styles.contactInfo}>
            <div className={styles.infoCard}>
              <h3>{t('contactPage.contactInfo')}</h3>
              
              <div className={styles.infoItems}>
                <div className={styles.infoItem}>
                  <div className={styles.infoIcon}>
                    <FiPhone />
                  </div>
                  <div className={styles.infoText}>
                    <h4>{t('contactPage.phone')}</h4>
                    <p>
                      <a href="tel:+77273555555">+7 (727) 355-55-55</a>
                    </p>
                  </div>
                </div>
                
                <div className={styles.infoItem}>
                  <div className={styles.infoIcon}>
                    <FiMail />
                  </div>
                  <div className={styles.infoText}>
                    <h4>Email</h4>
                    <p>
                      <a href="mailto:info@alliance.kz">info@alliance.kz</a>
                    </p>
                  </div>
                </div>
                
                <div className={styles.infoItem}>
                  <div className={styles.infoIcon}>
                    <FiMapPin />
                  </div>
                  <div className={styles.infoText}>
                    <h4>{t('contactPage.mainOffice')}</h4>
                    <p>{t('contactPage.mainOfficeAddress')}</p>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className={styles.socialLinks}>
                <a href="#" className={styles.socialLink} aria-label="Instagram">
                  <FiInstagram />
                </a>
                <a href="#" className={styles.socialLink} aria-label="Facebook">
                  <FiFacebook />
                </a>
                <a href="#" className={styles.socialLink} aria-label="YouTube">
                  <FiYoutube />
                </a>
                <a href="#" className={styles.socialLink} aria-label="WhatsApp">
                  <FiMessageCircle />
                </a>
              </div>

              {/* Work Hours */}
              <div className={styles.workHours}>
                <div className={styles.workHoursTitle}>
                  <FiClock />
                  {t('contactPage.workHours')}
                </div>
                <div className={styles.workHoursList}>
                  <div className={styles.workHourItem}>
                    <span>{t('contactPage.mondayFriday')}</span>
                    <span>09:00 - 18:00</span>
                  </div>
                  <div className={styles.workHourItem}>
                    <span>{t('contactPage.saturday')}</span>
                    <span>10:00 - 15:00</span>
                  </div>
                  <div className={`${styles.workHourItem} ${styles.weekend}`}>
                    <span>{t('contactPage.sunday')}</span>
                    <span>{t('contactPage.dayOff')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className={styles.infoCard}>
              <h3>{t('contactPage.quickActions')}</h3>
              <div className={styles.quickActions}>
                <Link to="/faq" className={styles.quickAction}>
                  <FiHelpCircle />
                  <span>{t('nav.faq')}</span>
                </Link>
                <Link to="/how-it-works" className={styles.quickAction}>
                  <FiFileText />
                  <span>{t('nav.howItWorks')}</span>
                </Link>
                <Link to="/pricing" className={styles.quickAction}>
                  <FiFileText />
                  <span>{t('nav.pricing')}</span>
                </Link>
                <a href="#" className={styles.quickAction}>
                  <FiMessageCircle />
                  <span>{t('contactPage.onlineChat')}</span>
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className={styles.contactForm}>
            <h2>{t('contactPage.sendMessage')}</h2>
            <p className={styles.formSubtitle}>
              {t('contactPage.formSubtitle')}
            </p>
            
            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="name">{t('contactPage.yourName')} <span>*</span></label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder={t('contactPage.enterName')}
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="email">Email <span>*</span></label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="example@mail.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="phone">{t('contactPage.phone')}</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    placeholder="+7 (___) ___-__-__"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="subject">{t('contactPage.subject')} <span>*</span></label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  >
                    <option value="">{t('contactPage.selectSubject')}</option>
                    <option value="general">{t('contactPage.generalQuestion')}</option>
                    <option value="partnership">{t('contactPage.partnership')}</option>
                    <option value="support">{t('contactPage.techSupport')}</option>
                    <option value="complaint">{t('contactPage.complaint')}</option>
                    <option value="press">{t('contactPage.press')}</option>
                  </select>
                </div>
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="message">{t('contactPage.message')} <span>*</span></label>
                <textarea
                  id="message"
                  name="message"
                  placeholder={t('contactPage.messagePlaceholder')}
                  value={formData.message}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className={styles.attachments}>
                <span className={styles.attachLabel}>{t('contactPage.attachFiles')}</span>
                <label htmlFor="file-upload" className={styles.attachArea}>
                  <input
                    id="file-upload"
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar"
                    style={{ display: 'none' }}
                  />
                  <FiUpload />
                  <p>{t('contactPage.dragFiles')}</p>
                  <span>{t('contactPage.fileLimit')}</span>
                </label>
                
                {files.length > 0 && (
                  <div className={styles.filesList}>
                    {files.map((file, index) => (
                      <div key={index} className={styles.fileItem}>
                        <FiFileText />
                        <span className={styles.fileName}>{file.name}</span>
                        <span className={styles.fileSize}>
                          ({(file.size / 1024).toFixed(1)} KB)
                        </span>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className={styles.removeFileBtn}
                        >
                          <FiClose />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {submitSuccess && (
                <div className={styles.successMessage}>
                  <FiCheck />
                  <span>Сообщение успешно отправлено! Мы свяжемся с вами в ближайшее время.</span>
                </div>
              )}

              {submitError && (
                <div className={styles.errorMessage}>
                  <span>{submitError}</span>
                </div>
              )}
              
              <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                <FiSend />
                {isSubmitting ? 'Отправка...' : t('contactPage.sendMessage')}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <section className={styles.mapSection}>
        <div className={styles.mapContainer}>
          <h2>{t('contactPage.ourLocation')}</h2>
          <div className={styles.mapWrapper}>
            <div className={styles.mapPlaceholder}>
              <FiMap />
              <p>{t('contactPage.mapPlaceholder')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Offices Section */}
      <section className={styles.officesSection}>
        <div className={styles.officesContainer}>
          <h2>{t('contactPage.ourOffices')}</h2>
          
          <div className={styles.officesGrid}>
            {offices.map((office, index) => (
              <div key={index} className={styles.officeCard}>
                <h3>
                  <FiMapPin />
                  {office.city}
                </h3>
                <div className={styles.officeDetails}>
                  <div className={styles.officeDetail}>
                    <FiMapPin />
                    <span>{office.address}</span>
                  </div>
                  <div className={styles.officeDetail}>
                    <FiPhone />
                    <a href={`tel:${office.phone.replace(/[^+\d]/g, '')}`}>
                      {office.phone}
                    </a>
                  </div>
                  <div className={styles.officeDetail}>
                    <FiMail />
                    <a href={`mailto:${office.email}`}>{office.email}</a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Promo */}
      <section className={styles.faqPromo}>
        <div className={styles.faqPromoContainer}>
          <div className={styles.faqPromoText}>
            <h2>{t('contactPage.noAnswer')}</h2>
            <p>
              {t('contactPage.checkFaq')}
            </p>
          </div>
          <Link to="/faq" className={styles.faqPromoBtn}>
            <FiHelpCircle />
            {t('contactPage.goToFaq')}
            <FiArrowRight />
          </Link>
        </div>
      </section>
    </div>
  );
};
