import { useState } from 'react';
import { MdArrowForward, MdCheck, MdStar, MdPeople, MdHandshake, MdVerified } from 'react-icons/md';
import AuthModal from '../components/AuthModal';
import RegisterModal from '../components/RegisterModal';
import styles from './Home.module.css';

const Home = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  const stats = [
    { value: '500+', label: 'Выполненных проектов' },
    { value: '150+', label: 'Мастеров' },
    { value: '98%', label: 'Довольных клиентов' },
    { value: '5 лет', label: 'На рынке' },
  ];

  const features = [
    {
      icon: MdVerified,
      title: 'Проверенные мастера',
      description: 'Каждый мастер проходит тщательную верификацию и проверку качества работ'
    },
    {
      icon: MdHandshake,
      title: 'Гарантия сделки',
      description: 'Безопасные платежи и гарантия возврата средств при несоответствии качества'
    },
    {
      icon: MdStar,
      title: 'Прозрачные цены',
      description: 'Аукционная система позволяет получить лучшую цену от конкурирующих мастеров'
    },
  ];

  return (
    <div className={styles.home}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroBackground}>
          <div className={styles.heroOverlay}></div>
          <img 
            src="https://images.unsplash.com/photo-1631679706909-1844bbd07221?q=80&w=1920&auto=format&fit=crop"
            alt="Мебельная мастерская"
            className={styles.heroImage}
          />
        </div>
        
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <h1 className={styles.heroTitle}>
              Мебель на заказ<br />
              <span className={styles.heroHighlight}>от лучших мастеров</span>
            </h1>
            <p className={styles.heroSubtitle}>
              Платформа, объединяющая клиентов с профессиональными мебельщиками. 
              Разместите заказ и получите предложения от проверенных мастеров.
            </p>
            
            <div className={styles.heroCta}>
              <button 
                className={styles.primaryButton}
                onClick={() => setIsRegisterModalOpen(true)}
              >
                Разместить заказ
                <MdArrowForward />
              </button>
              <button 
                className={styles.secondaryButton}
                onClick={() => setIsAuthModalOpen(true)}
              >
                Войти в систему
              </button>
            </div>

            <div className={styles.heroFeatures}>
              <div className={styles.heroFeature}>
                <MdCheck />
                <span>Бесплатное размещение</span>
              </div>
              <div className={styles.heroFeature}>
                <MdCheck />
                <span>Без посредников</span>
              </div>
              <div className={styles.heroFeature}>
                <MdCheck />
                <span>Гарантия качества</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className={styles.stats}>
        <div className={styles.statsContainer}>
          {stats.map((stat, index) => (
            <div key={index} className={styles.statItem}>
              <span className={styles.statValue}>{stat.value}</span>
              <span className={styles.statLabel}>{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.features}>
        <div className={styles.featuresContainer}>
          <div className={styles.featuresHeader}>
            <h2 className={styles.sectionTitle}>Почему выбирают нас</h2>
            <p className={styles.sectionSubtitle}>
              Надежная платформа для заказа мебели с гарантией качества
            </p>
          </div>
          
          <div className={styles.featuresGrid}>
            {features.map((feature, index) => (
              <div key={index} className={styles.featureCard}>
                <div className={styles.featureIcon}>
                  <feature.icon />
                </div>
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.featureDescription}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className={styles.howItWorks}>
        <div className={styles.howItWorksContainer}>
          <div className={styles.howItWorksHeader}>
            <h2 className={styles.sectionTitle}>Как это работает</h2>
            <p className={styles.sectionSubtitle}>
              Простой процесс от заявки до готовой мебели
            </p>
          </div>

          <div className={styles.stepsGrid}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>01</div>
              <h3 className={styles.stepTitle}>Создайте заказ</h3>
              <p className={styles.stepDescription}>
                Опишите желаемую мебель, укажите размеры, материалы и бюджет
              </p>
            </div>
            
            <div className={styles.step}>
              <div className={styles.stepNumber}>02</div>
              <h3 className={styles.stepTitle}>Получите предложения</h3>
              <p className={styles.stepDescription}>
                Мастера увидят ваш заказ и предложат свои условия и цены
              </p>
            </div>
            
            <div className={styles.step}>
              <div className={styles.stepNumber}>03</div>
              <h3 className={styles.stepTitle}>Выберите мастера</h3>
              <p className={styles.stepDescription}>
                Сравните предложения, изучите отзывы и выберите лучшего
              </p>
            </div>
            
            <div className={styles.step}>
              <div className={styles.stepNumber}>04</div>
              <h3 className={styles.stepTitle}>Получите мебель</h3>
              <p className={styles.stepDescription}>
                Мастер изготовит и доставит мебель с гарантией качества
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.cta}>
        <div className={styles.ctaContainer}>
          <div className={styles.ctaContent}>
            <h2 className={styles.ctaTitle}>Готовы заказать мебель?</h2>
            <p className={styles.ctaSubtitle}>
              Присоединяйтесь к платформе и получите доступ к лучшим мастерам вашего региона
            </p>
            <div className={styles.ctaButtons}>
              <button 
                className={styles.ctaPrimaryButton}
                onClick={() => setIsRegisterModalOpen(true)}
              >
                Зарегистрироваться
                <MdArrowForward />
              </button>
              <button 
                className={styles.ctaSecondaryButton}
                onClick={() => setIsRegisterModalOpen(true)}
              >
                <MdPeople />
                Стать мастером
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContainer}>
          <div className={styles.footerContent}>
            <div className={styles.footerBrand}>
              <h3 className={styles.footerLogo}>Alliance</h3>
              <p className={styles.footerTagline}>
                Платформа для заказа мебели от проверенных мастеров
              </p>
            </div>
            
            <div className={styles.footerLinks}>
              <div className={styles.footerColumn}>
                <h4>Клиентам</h4>
                <a href="#" onClick={(e) => { e.preventDefault(); setIsRegisterModalOpen(true); }}>Разместить заказ</a>
                <a href="#" onClick={(e) => { e.preventDefault(); setIsAuthModalOpen(true); }}>Войти</a>
              </div>
              
              <div className={styles.footerColumn}>
                <h4>Мастерам</h4>
                <a href="#" onClick={(e) => { e.preventDefault(); setIsRegisterModalOpen(true); }}>Стать мастером</a>
                <a href="#" onClick={(e) => { e.preventDefault(); setIsAuthModalOpen(true); }}>Вход для мастеров</a>
              </div>
              
              <div className={styles.footerColumn}>
                <h4>Информация</h4>
                <a href="/privacy-policy">Политика конфиденциальности</a>
              </div>
            </div>
          </div>
          
          <div className={styles.footerBottom}>
            <p>&copy; 2024 Alliance. Все права защищены.</p>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)}
        onSwitchToRegister={() => {
          setIsAuthModalOpen(false);
          setIsRegisterModalOpen(true);
        }}
      />

      <RegisterModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onSwitchToLogin={() => {
          setIsRegisterModalOpen(false);
          setIsAuthModalOpen(true);
        }}
      />
    </div>
  );
};

export default Home;
