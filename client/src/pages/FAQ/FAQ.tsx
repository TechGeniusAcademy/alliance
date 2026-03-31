import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiSearch,
  FiChevronDown,
  FiArrowRight,
  FiUsers,
  FiBriefcase,
  FiCreditCard,
  FiShield,
  FiSettings,
  FiHelpCircle,
  FiMail,
  FiMessageCircle,
  FiPhone
} from 'react-icons/fi';
import { useLanguage } from '../../context/LanguageContext';
import styles from './FAQ.module.css';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

interface FAQCategory {
  id: string;
  title: string;
  icon: React.ReactNode;
  count: number;
  questions: FAQItem[];
}

export const FAQPage = () => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('general');
  const [openQuestions, setOpenQuestions] = useState<number[]>([]);

  const toggleQuestion = (id: number) => {
    setOpenQuestions(prev => 
      prev.includes(id) 
        ? prev.filter(q => q !== id) 
        : [...prev, id]
    );
  };

  const faqCategories: FAQCategory[] = [
    {
      id: 'general',
      title: t('faqPage.categories.general'),
      icon: <FiHelpCircle />,
      count: 6,
      questions: [
        {
          id: 1,
          question: t('faqPage.questions.whatIsAlliance'),
          answer: t('faqPage.answers.whatIsAlliance')
        },
        {
          id: 2,
          question: t('faqPage.questions.howPlatformWorks'),
          answer: t('faqPage.answers.howPlatformWorks')
        },
        {
          id: 3,
          question: t('faqPage.questions.allKazakhstan'),
          answer: t('faqPage.answers.allKazakhstan')
        },
        {
          id: 4,
          question: t('faqPage.questions.registrationFee'),
          answer: t('faqPage.answers.registrationFee')
        },
        {
          id: 5,
          question: t('faqPage.questions.languages'),
          answer: t('faqPage.answers.languages')
        },
        {
          id: 6,
          question: t('faqPage.questions.contactSupport'),
          answer: t('faqPage.answers.contactSupport')
        }
      ]
    },
    {
      id: 'customers',
      title: t('faqPage.categories.customers'),
      icon: <FiUsers />,
      count: 5,
      questions: [
        {
          id: 7,
          question: t('faqPage.questions.placeOrder'),
          answer: t('faqPage.answers.placeOrder')
        },
        {
          id: 8,
          question: t('faqPage.questions.chooseMaster'),
          answer: t('faqPage.answers.chooseMaster')
        },
        {
          id: 9,
          question: t('faqPage.questions.payment'),
          answer: t('faqPage.answers.payment')
        },
        {
          id: 10,
          question: t('faqPage.questions.dispute'),
          answer: t('faqPage.answers.dispute')
        },
        {
          id: 11,
          question: t('faqPage.questions.cancelOrder'),
          answer: t('faqPage.answers.cancelOrder')
        }
      ]
    },
    {
      id: 'masters',
      title: t('faqPage.categories.masters'),
      icon: <FiBriefcase />,
      count: 5,
      questions: [
        {
          id: 12,
          question: t('faqPage.questions.becomeMaster'),
          answer: t('faqPage.answers.becomeMaster')
        },
        {
          id: 13,
          question: t('faqPage.questions.verification'),
          answer: t('faqPage.answers.verification')
        },
        {
          id: 14,
          question: t('faqPage.questions.commission'),
          answer: t('faqPage.answers.commission')
        },
        {
          id: 15,
          question: t('faqPage.questions.moreOrders'),
          answer: t('faqPage.answers.moreOrders')
        },
        {
          id: 16,
          question: t('faqPage.questions.moreReviews'),
          answer: t('faqPage.answers.moreReviews')
        }
      ]
    },
    {
      id: 'payments',
      title: t('faqPage.categories.payment'),
      icon: <FiCreditCard />,
      count: 4,
      questions: [
        {
          id: 17,
          question: t('faqPage.questions.tariffs'),
          answer: t('faqPage.answers.tariffs')
        },
        {
          id: 18,
          question: t('faqPage.questions.paymentMethods'),
          answer: t('faqPage.answers.paymentMethods')
        },
        {
          id: 19,
          question: t('faqPage.questions.refund'),
          answer: t('faqPage.answers.refund')
        },
        {
          id: 20,
          question: t('faqPage.questions.yearlyDiscount'),
          answer: t('faqPage.answers.yearlyDiscount')
        }
      ]
    },
    {
      id: 'security',
      title: t('faqPage.categories.security'),
      icon: <FiShield />,
      count: 4,
      questions: [
        {
          id: 21,
          question: t('faqPage.questions.dataProtection'),
          answer: t('faqPage.answers.dataProtection')
        },
        {
          id: 22,
          question: t('faqPage.questions.masterVerification'),
          answer: t('faqPage.answers.masterVerification')
        },
        {
          id: 23,
          question: t('faqPage.questions.suspiciousActivity'),
          answer: t('faqPage.answers.suspiciousActivity')
        },
        {
          id: 24,
          question: t('faqPage.questions.deleteAccount'),
          answer: t('faqPage.answers.deleteAccount')
        }
      ]
    },
    {
      id: 'technical',
      title: t('faqPage.categories.technical'),
      icon: <FiSettings />,
      count: 4,
      questions: [
        {
          id: 25,
          question: t('faqPage.questions.notifications'),
          answer: t('faqPage.answers.notifications')
        },
        {
          id: 26,
          question: t('faqPage.questions.passwordReset'),
          answer: t('faqPage.answers.passwordReset')
        },
        {
          id: 27,
          question: t('faqPage.questions.browsers'),
          answer: t('faqPage.answers.browsers')
        },
        {
          id: 28,
          question: t('faqPage.questions.mobileApp'),
          answer: t('faqPage.answers.mobileApp')
        }
      ]
    }
  ];

  const popularQuestions = [
    t('faqPage.questions.whatIsAlliance'),
    t('faqPage.questions.placeOrder'),
    t('faqPage.questions.becomeMaster'),
    t('faqPage.questions.tariffs'),
    t('faqPage.questions.chooseMaster'),
    t('faqPage.questions.dataProtection')
  ];

  const currentCategory = faqCategories.find(c => c.id === activeCategory);

  return (
    <div className={styles.faq}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContainer}>
          <div className={styles.breadcrumbs}>
            <Link to="/">{t('nav.home')}</Link>
            <span>/</span>
            <span>FAQ</span>
          </div>
          
          <h1>{t('faqPage.heroTitle')}</h1>
          <p>
            {t('faqPage.heroSubtitle')}
          </p>
          
          <div className={styles.heroSearch}>
            <FiSearch />
            <input
              type="text"
              placeholder={t('faqPage.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className={styles.mainContent}>
        {/* Categories */}
        <div className={styles.categories}>
          {faqCategories.map((cat) => (
            <button
              key={cat.id}
              className={`${styles.categoryBtn} ${activeCategory === cat.id ? styles.active : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.icon}
              {cat.title}
            </button>
          ))}
        </div>

        <div className={styles.faqGrid}>
          {/* Sidebar */}
          <div className={styles.sidebar}>
            <div className={styles.sidebarCard}>
              <h3>{t('faqPage.categoriesTitle')}</h3>
              <nav className={styles.sidebarNav}>
                {faqCategories.map((cat) => (
                  <button
                    key={cat.id}
                    className={`${styles.sidebarLink} ${activeCategory === cat.id ? styles.active : ''}`}
                    onClick={() => setActiveCategory(cat.id)}
                  >
                    {cat.icon}
                    {cat.title}
                    <span>{cat.count}</span>
                  </button>
                ))}
              </nav>
            </div>

            <div className={`${styles.sidebarCard} ${styles.supportCard}`}>
              <h3>{t('faqPage.noAnswer')}</h3>
              <p>{t('faqPage.contactSupport')}</p>
              <Link to="/contact" className={styles.supportBtn}>
                <FiMail />
                {t('faqPage.writeUs')}
              </Link>
            </div>
          </div>

          {/* FAQ Content */}
          <div className={styles.faqContent}>
            {currentCategory && (
              <div className={styles.categorySection}>
                <div className={styles.categoryHeader}>
                  <div className={styles.categoryIcon}>
                    {currentCategory.icon}
                  </div>
                  <div className={styles.categoryTitle}>
                    <h2>{currentCategory.title}</h2>
                    <span>{currentCategory.count} {t('faqPage.questionsCount')}</span>
                  </div>
                </div>

                <div className={styles.accordion}>
                  {currentCategory.questions.map((item) => (
                    <div
                      key={item.id}
                      className={`${styles.accordionItem} ${openQuestions.includes(item.id) ? styles.open : ''}`}
                    >
                      <button
                        className={styles.accordionHeader}
                        onClick={() => toggleQuestion(item.id)}
                      >
                        {item.question}
                        <FiChevronDown />
                      </button>
                      {openQuestions.includes(item.id) && (
                        <div className={styles.accordionBody}>
                          {item.answer.split('\n').map((paragraph, idx) => (
                            <p key={idx}>{paragraph}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Popular Questions */}
      <section className={styles.popularSection}>
        <div className={styles.popularContainer}>
          <h2>{t('faqPage.popularQuestions')}</h2>
          <div className={styles.popularGrid}>
            {popularQuestions.map((question, index) => (
              <button key={index} className={styles.popularItem}>
                <span className={styles.popularNumber}>{index + 1}</span>
                <div className={styles.popularText}>
                  <span>{question}</span>
                </div>
                <FiArrowRight />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Still Need Help */}
      <section className={styles.helpSection}>
        <div className={styles.helpContainer}>
          <h2>{t('faqPage.stillHaveQuestions')}</h2>
          <p>{t('faqPage.chooseContactMethod')}</p>
          
          <div className={styles.helpOptions}>
            <Link to="/contact" className={styles.helpOption}>
              <div className={styles.helpIcon}>
                <FiMail />
              </div>
              <h3>{t('faqPage.writeUs')}</h3>
              <p>{t('faqPage.sendFeedback')}</p>
              <span className={styles.helpLink}>
                {t('faqPage.goTo')} <FiArrowRight />
              </span>
            </Link>
            
            <a href="tel:+77273555555" className={styles.helpOption}>
              <div className={styles.helpIcon}>
                <FiPhone />
              </div>
              <h3>{t('faqPage.callUs')}</h3>
              <p>+7 (727) 355-55-55<br />{t('faqPage.workingHours')}</p>
              <span className={styles.helpLink}>
                {t('faqPage.callUs')} <FiArrowRight />
              </span>
            </a>
            
            <a href="#" className={styles.helpOption}>
              <div className={styles.helpIcon}>
                <FiMessageCircle />
              </div>
              <h3>{t('faqPage.onlineChat')}</h3>
              <p>{t('faqPage.realtimeAnswer')}</p>
              <span className={styles.helpLink}>
                {t('faqPage.openChat')} <FiArrowRight />
              </span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
