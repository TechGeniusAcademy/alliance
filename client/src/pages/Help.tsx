import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  MdHelp, 
  MdSearch, 
  MdExpandMore, 
  MdExpandLess, 
  MdSend,
  MdMenuBook,
  MdChat as MdChatIcon,
  MdEmail,
  MdPhone,
  MdAccessTime
} from 'react-icons/md';
import { appService } from '../services/appService';
import type { FAQItem } from '../types/app';
import styles from './Help.module.css';

const Help = () => {
  const { t } = useTranslation();
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');

  useEffect(() => {
    loadFAQs();
  }, []);

  const loadFAQs = async () => {
    try {
      setLoading(true);
      const data = await appService.getFAQs();
      setFaqs(data);
    } catch (error) {
      console.error('Failed to load FAQs:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFAQ = (id: number) => {
    setFaqs(faqs.map(faq => 
      faq.id === id ? { ...faq, isExpanded: !faq.isExpanded } : faq
    ));
  };

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || faq.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...Array.from(new Set(faqs.map(faq => faq.category)))];

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!ticketSubject.trim() || !ticketMessage.trim()) {
      alert(t('help.fillAllFields'));
      return;
    }

    try {
      await appService.createSupportTicket({
        subject: ticketSubject,
        description: ticketMessage,
        priority: 'medium'
      });
      alert(t('help.ticketSent'));
      setTicketSubject('');
      setTicketMessage('');
    } catch (error) {
      console.error('Failed to create ticket:', error);
      alert(t('help.ticketError'));
    }
  };

  if (loading) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.loader}></div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>
          <MdHelp className={styles.titleIcon} />
          {t('help.title')}
        </h1>
      </div>

      <div className={styles.helpContent}>
        {/* FAQ Section */}
        <div className={styles.faqSection}>
          <h2>
            <MdMenuBook style={{ verticalAlign: 'middle', marginRight: '8px' }} />
            {t('help.faqTitle')}
          </h2>

          <div className={styles.searchBox}>
            <MdSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder={t('help.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className={styles.categoryTabs}>
            {categories.map(category => (
              <button
                key={category}
                className={categoryFilter === category ? styles.active : ''}
                onClick={() => setCategoryFilter(category)}
              >
                {category === 'all' ? t('help.allCategories') : category}
              </button>
            ))}
          </div>

          <div className={styles.faqList}>
            {filteredFAQs.length === 0 ? (
              <div className={styles.emptyState}>
                <p>{t('help.noResults')}</p>
              </div>
            ) : (
              filteredFAQs.map((faq) => (
                <div
                  key={faq.id}
                  className={`${styles.faqItem} ${faq.isExpanded ? styles.expanded : ''}`}
                >
                  <button
                    className={styles.faqQuestion}
                    onClick={() => toggleFAQ(faq.id)}
                  >
                    <span>{faq.question}</span>
                    {faq.isExpanded ? <MdExpandLess size={24} /> : <MdExpandMore size={24} />}
                  </button>
                  {faq.isExpanded && (
                    <div className={styles.faqAnswer}>
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Contact Support Section */}
        <div className={styles.supportSection}>
          <h2>
            <MdChatIcon style={{ verticalAlign: 'middle', marginRight: '8px' }} />
            {t('help.contactSupport')}
          </h2>
          <p className={styles.supportDescription}>
            {t('help.supportDescription')}
          </p>

          <form onSubmit={handleSubmitTicket} className={styles.supportForm}>
            <div className={styles.formGroup}>
              <label htmlFor="subject">{t('help.ticketSubject')}</label>
              <input
                id="subject"
                type="text"
                placeholder={t('help.subjectPlaceholder')}
                value={ticketSubject}
                onChange={(e) => setTicketSubject(e.target.value)}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="message">{t('help.message')}</label>
              <textarea
                id="message"
                rows={6}
                placeholder={t('help.messagePlaceholder')}
                value={ticketMessage}
                onChange={(e) => setTicketMessage(e.target.value)}
                required
              />
            </div>

            <button type="submit" className={styles.submitButton}>
              <MdSend size={20} />
              {t('help.submitButton')}
            </button>
          </form>

          <div className={styles.contactInfo}>
            <h3>{t('help.otherContacts')}</h3>
            <ul>
              <li>
                <MdEmail style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                {t('help.email')}: {t('help.emailValue')}
              </li>
              <li>
                <MdPhone style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                {t('help.phone')}: {t('help.phoneValue')}
              </li>
              <li>
                <MdAccessTime style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                {t('help.workingHours')}: {t('help.workingHoursValue')}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;
