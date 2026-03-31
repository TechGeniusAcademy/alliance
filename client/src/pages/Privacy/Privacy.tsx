import {
  FiShield,
  FiDatabase,
  FiLock,
  FiUserCheck,
  FiEye,
  FiEdit,
  FiTrash2,
  FiDownload
} from 'react-icons/fi';
import styles from './Privacy.module.css';

const sections = [
  {
    id: 'intro',
    title: '1. Введение',
    content: `ООО «ALLIANCE» (далее — «мы», «нас», «Платформа») серьёзно относится к защите ваших персональных данных. Настоящая Политика конфиденциальности описывает, как мы собираем, используем, храним и защищаем вашу информацию при использовании платформы ALLIANCE.

Используя нашу платформу, вы соглашаетесь с практиками, описанными в данной Политике. Если вы не согласны с условиями, пожалуйста, прекратите использование платформы.`
  },
  {
    id: 'data-collection',
    title: '2. Какие данные мы собираем',
    content: `Мы собираем следующие категории персональных данных:`,
    subsections: [
      {
        title: 'Данные, которые вы предоставляете',
        list: [
          'Имя, фамилия, отчество',
          'Адрес электронной почты',
          'Номер телефона',
          'Адрес (для заказчиков)',
          'Данные о компании (для мастеров)',
          'Фотографии профиля и портфолио'
        ]
      },
      {
        title: 'Данные, собираемые автоматически',
        list: [
          'IP-адрес и данные устройства',
          'Тип браузера и операционная система',
          'Cookies и идентификаторы сеансов',
          'Данные о взаимодействии с платформой',
          'Геолокация (с вашего согласия)'
        ]
      }
    ]
  },
  {
    id: 'data-usage',
    title: '3. Как мы используем данные',
    content: `Мы используем собранные данные для следующих целей:`,
    list: [
      'Предоставление и улучшение услуг платформы',
      'Связь между заказчиками и мастерами',
      'Обработка платежей и транзакций',
      'Отправка уведомлений и маркетинговых сообщений (с вашего согласия)',
      'Анализ использования платформы для улучшения сервиса',
      'Предотвращение мошенничества и обеспечение безопасности',
      'Соблюдение законодательных требований'
    ]
  },
  {
    id: 'data-sharing',
    title: '4. Передача данных третьим лицам',
    content: `Мы можем передавать ваши данные следующим категориям получателей:`,
    list: [
      'Другим пользователям платформы (профиль мастера виден заказчикам)',
      'Платёжным системам для обработки транзакций',
      'Хостинг-провайдерам и облачным сервисам',
      'Аналитическим сервисам (Google Analytics)',
      'Государственным органам по законному запросу'
    ],
    highlight: 'Мы не продаём ваши персональные данные третьим лицам и не передаём их в рекламных целях без вашего явного согласия.'
  },
  {
    id: 'data-storage',
    title: '5. Хранение данных',
    content: `Мы храним ваши персональные данные в течение периода, необходимого для достижения целей, описанных в настоящей Политике:`,
    list: [
      'Данные аккаунта — до удаления аккаунта пользователем + 3 года',
      'Данные транзакций — 5 лет (требование законодательства)',
      'Cookies и данные сеансов — до 1 года',
      'Маркетинговые данные — до отзыва согласия'
    ],
    additionalContent: `После истечения сроков хранения данные безвозвратно удаляются или обезличиваются.`
  },
  {
    id: 'data-security',
    title: '6. Защита данных',
    content: `Мы применяем современные технические и организационные меры для защиты ваших данных:`,
    list: [
      'Шифрование данных при передаче (SSL/TLS)',
      'Шифрование данных при хранении',
      'Двухфакторная аутентификация (опционально)',
      'Регулярное резервное копирование',
      'Ограничение доступа сотрудников к данным',
      'Мониторинг безопасности 24/7'
    ],
    warning: 'Несмотря на все меры безопасности, ни одна система не может гарантировать 100% защиту. Мы рекомендуем использовать надёжные пароли и не передавать их третьим лицам.'
  },
  {
    id: 'cookies',
    title: '7. Cookies и отслеживание',
    content: `Мы используем cookies и аналогичные технологии:`,
    table: [
      { type: 'Необходимые', purpose: 'Работа платформы, авторизация', retention: 'Сессия' },
      { type: 'Аналитические', purpose: 'Анализ использования', retention: '2 года' },
      { type: 'Функциональные', purpose: 'Запоминание настроек', retention: '1 год' },
      { type: 'Маркетинговые', purpose: 'Персонализация рекламы', retention: '1 год' }
    ],
    additionalContent: `Вы можете управлять cookies в настройках браузера. Отключение некоторых cookies может повлиять на функциональность платформы.`
  },
  {
    id: 'international',
    title: '8. Международная передача данных',
    content: `Ваши данные могут обрабатываться на серверах, расположенных за пределами Казахстана. В таких случаях мы обеспечиваем:`,
    list: [
      'Соблюдение требований законодательства РК о персональных данных',
      'Заключение договоров с обработчиками, гарантирующих защиту данных',
      'Использование стандартных договорных условий'
    ]
  },
  {
    id: 'changes',
    title: '9. Изменения политики',
    content: `Мы можем обновлять настоящую Политику конфиденциальности. При существенных изменениях мы уведомим вас:`,
    list: [
      'По электронной почте',
      'Уведомлением на платформе',
      'Публикацией обновлённой версии с датой изменения'
    ],
    additionalContent: `Рекомендуем периодически проверять эту страницу для ознакомления с актуальной версией Политики.`
  }
];

const rights = [
  { icon: <FiEye />, title: 'Право на доступ', desc: 'Получить копию ваших данных' },
  { icon: <FiEdit />, title: 'Право на исправление', desc: 'Исправить неточные данные' },
  { icon: <FiTrash2 />, title: 'Право на удаление', desc: 'Удалить ваши данные' },
  { icon: <FiDownload />, title: 'Право на переносимость', desc: 'Получить данные в машиночитаемом формате' }
];

const quickLinks = [
  { icon: <FiDatabase />, text: 'Какие данные', href: '#data-collection' },
  { icon: <FiLock />, text: 'Защита данных', href: '#data-security' },
  { icon: <FiUserCheck />, text: 'Ваши права', href: '#rights' }
];

export const PrivacyPage = () => {
  return (
    <div className={styles.page}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContainer}>
          <div className={styles.heroIcon}>
            <FiShield />
          </div>
          <h1 className={styles.heroTitle}>Политика конфиденциальности</h1>
          <p className={styles.heroSubtitle}>
            Информация о защите ваших персональных данных
          </p>
          <p className={styles.lastUpdated}>
            Последнее обновление: 15 января 2025 г.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className={styles.main}>
        <div className={styles.content}>
          {/* Quick Links */}
          <div className={styles.quickLinks}>
            {quickLinks.map((link, index) => (
              <a key={index} href={link.href} className={styles.quickLink}>
                <div className={styles.quickLinkIcon}>{link.icon}</div>
                <span className={styles.quickLinkText}>{link.text}</span>
              </a>
            ))}
          </div>

          {/* Table of Contents */}
          <div className={styles.toc}>
            <h2 className={styles.tocTitle}>Содержание</h2>
            <nav className={styles.tocList}>
              {sections.map((section) => (
                <a key={section.id} href={`#${section.id}`} className={styles.tocItem}>
                  {section.title}
                </a>
              ))}
              <a href="#rights" className={styles.tocItem}>10. Ваши права</a>
            </nav>
          </div>

          {/* Sections */}
          {sections.map((section) => (
            <section key={section.id} id={section.id} className={styles.section}>
              <h2 className={styles.sectionTitle}>{section.title}</h2>
              <p className={styles.sectionText}>{section.content}</p>
              
              {section.subsections && section.subsections.map((sub, index) => (
                <div key={index} className={styles.subsection}>
                  <h3 className={styles.subsectionTitle}>{sub.title}</h3>
                  <ul className={styles.sectionList}>
                    {sub.list.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
              
              {section.list && (
                <ul className={styles.sectionList}>
                  {section.list.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              )}
              
              {section.table && (
                <table className={styles.dataTable}>
                  <thead>
                    <tr>
                      <th>Тип cookie</th>
                      <th>Назначение</th>
                      <th>Срок хранения</th>
                    </tr>
                  </thead>
                  <tbody>
                    {section.table.map((row, index) => (
                      <tr key={index}>
                        <td>{row.type}</td>
                        <td>{row.purpose}</td>
                        <td>{row.retention}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              
              {section.additionalContent && (
                <p className={styles.sectionText}>{section.additionalContent}</p>
              )}
              
              {section.highlight && (
                <div className={styles.highlight}>
                  <p className={styles.highlightText}>{section.highlight}</p>
                </div>
              )}
              
              {section.warning && (
                <div className={styles.warning}>
                  <p className={styles.warningText}>{section.warning}</p>
                </div>
              )}
            </section>
          ))}

          {/* Rights Box */}
          <div id="rights" className={styles.rightsBox}>
            <h2 className={styles.rightsTitle}>10. Ваши права</h2>
            <div className={styles.rightsList}>
              {rights.map((right, index) => (
                <div key={index} className={styles.rightsItem}>
                  <div className={styles.rightsIcon}>{right.icon}</div>
                  <div className={styles.rightsText}>
                    <div className={styles.rightsItemTitle}>{right.title}</div>
                    <div className={styles.rightsItemDesc}>{right.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Box */}
          <div className={styles.contactBox}>
            <h3 className={styles.contactTitle}>Вопросы о конфиденциальности?</h3>
            <p className={styles.contactText}>
              Свяжитесь с нашим специалистом по защите данных
            </p>
            <a href="mailto:privacy@alliance.kz" className={styles.contactEmail}>
              privacy@alliance.kz
            </a>
          </div>
        </div>
      </main>
    </div>
  );
};
