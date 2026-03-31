import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  FiHome,
  FiChevronRight,
  FiCalendar,
  FiClock,
  FiEye,
  FiMessageCircle,
  FiShare2,
  FiHeart,
  FiBookmark,
  FiSend,
  FiTag,
  FiList,
  FiFolder
} from 'react-icons/fi';
import styles from './BlogArticle.module.css';

// Mock article data
const articleData = {
  slug: 'kitchen-trends-2025',
  title: 'Тренды кухонь 2025: что выбирают заказчики',
  category: 'Дизайн',
  publishedAt: '15 января 2025',
  readTime: '8 мин',
  views: 2456,
  commentsCount: 18,
  featuredImage: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&h=675&fit=crop',
  author: {
    name: 'Анна Соколова',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
    bio: 'Дизайнер интерьеров с 10-летним опытом. Специализируюсь на современных кухнях и жилых пространствах.'
  },
  tags: ['Кухни', 'Дизайн', 'Тренды 2025', 'Минимализм', 'Интерьер'],
  tableOfContents: [
    'Минимализм и чистые линии',
    'Натуральные материалы',
    'Умные технологии',
    'Цветовые решения',
    'Функциональность'
  ],
  content: `
    <h2>Минимализм и чистые линии</h2>
    <p>2025 год продолжает тренд на минимализм в кухонном пространстве. Заказчики всё чаще выбирают гладкие фасады без ручек (push-to-open), интегрированные бытовые приборы и скрытые системы хранения.</p>
    
    <p>Ключевые особенности минималистичных кухонь:</p>
    <ul>
      <li>Фасады без видимых ручек — система push-to-open или интегрированные профили</li>
      <li>Единая цветовая гамма для фасадов и стен</li>
      <li>Скрытая бытовая техника за панелями</li>
      <li>Минимум декора на рабочих поверхностях</li>
    </ul>

    <blockquote>«Современная кухня должна быть не только красивой, но и функциональной. Минимализм позволяет достичь обеих целей.» — Анна Соколова</blockquote>

    <h2>Натуральные материалы</h2>
    <p>Экологичность становится ключевым критерием при выборе материалов. Заказчики отдают предпочтение натуральному дереву, камню и металлу.</p>

    <p>Популярные материалы в 2025:</p>
    <ul>
      <li><strong>Массив дуба</strong> — для фасадов и столешниц</li>
      <li><strong>Кварцевый агломерат</strong> — износостойкая столешница</li>
      <li><strong>Терраццо</strong> — для фартуков и островов</li>
      <li><strong>Латунь и медь</strong> — для фурнитуры и декоративных элементов</li>
    </ul>

    <h2>Умные технологии</h2>
    <p>Интеграция smart-технологий в кухонное пространство набирает обороты. От голосового управления освещением до встроенных зарядных станций.</p>

    <p>Что заказывают чаще всего:</p>
    <ul>
      <li>Встроенные USB и беспроводные зарядки в столешницу</li>
      <li>Датчики движения для подсветки</li>
      <li>Умные смесители с сенсорным управлением</li>
      <li>Выдвижные розеточные блоки</li>
    </ul>

    <h2>Цветовые решения</h2>
    <p>Палитра 2025 года — это спокойные природные оттенки с яркими акцентами. Уходят глянцевые белые кухни, на смену приходят матовые текстуры.</p>

    <p>Топ цветов года:</p>
    <ul>
      <li><strong>Тёплый серый</strong> — универсальная база</li>
      <li><strong>Терракотовый</strong> — для акцентных элементов</li>
      <li><strong>Оливковый</strong> — природный и успокаивающий</li>
      <li><strong>Тёмно-синий</strong> — элегантность и глубина</li>
    </ul>

    <h2>Функциональность</h2>
    <p>Пандемия изменила отношение к кухне — теперь это не только место для готовки, но и рабочее пространство, зона для семейных встреч и отдыха.</p>

    <p>Функциональные решения:</p>
    <ul>
      <li>Кухни-острова с интегрированным рабочим местом</li>
      <li>Системы сортировки мусора</li>
      <li>Выдвижные столы и барные стойки</li>
      <li>Модульные системы хранения</li>
    </ul>

    <blockquote>Кухня 2025 года — это пространство, которое адаптируется под образ жизни владельца, а не наоборот.</blockquote>
  `,
  relatedArticles: [
    {
      slug: 'choosing-kitchen-countertop',
      title: 'Как выбрать столешницу для кухни',
      image: 'https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=200&h=150&fit=crop',
      date: '10 января 2025'
    },
    {
      slug: 'kitchen-lighting-guide',
      title: 'Освещение на кухне: полное руководство',
      image: 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=200&h=150&fit=crop',
      date: '5 января 2025'
    },
    {
      slug: 'small-kitchen-ideas',
      title: '10 идей для маленькой кухни',
      image: 'https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=200&h=150&fit=crop',
      date: '28 декабря 2024'
    }
  ],
  categories: [
    { name: 'Дизайн', count: 24 },
    { name: 'Советы', count: 18 },
    { name: 'Материалы', count: 15 },
    { name: 'Тренды', count: 12 },
    { name: 'Уход', count: 9 }
  ],
  comments: [
    {
      id: 1,
      author: 'Марина К.',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
      date: '16 января 2025',
      text: 'Отличная статья! Как раз планируем заказывать кухню и теперь понятно, на что обратить внимание. Особенно понравилась идея со встроенными USB-зарядками.',
      likes: 12
    },
    {
      id: 2,
      author: 'Алексей П.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
      date: '16 января 2025',
      text: 'Согласен насчёт минимализма, но у нас большая семья и нужно много места для хранения. Как это совместить с чистыми линиями?',
      likes: 8
    },
    {
      id: 3,
      author: 'Елена Т.',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
      date: '15 января 2025',
      text: 'Терракотовый цвет — это что-то новенькое! Раньше боялась ярких оттенков на кухне, но возможно стоит попробовать как акцент.',
      likes: 15
    }
  ]
};

export const BlogArticlePage = () => {
  const { slug } = useParams();
  const [email, setEmail] = useState('');
  const [comment, setComment] = useState('');

  const article = articleData;

  return (
    <div className={styles.page}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContainer}>
          {/* Breadcrumb */}
          <nav className={styles.breadcrumb}>
            <Link to="/" className={styles.breadcrumbLink}>
              <FiHome /> Главная
            </Link>
            <FiChevronRight className={styles.breadcrumbSeparator} />
            <Link to="/blog" className={styles.breadcrumbLink}>
              Блог
            </Link>
            <FiChevronRight className={styles.breadcrumbSeparator} />
            <span className={styles.breadcrumbCurrent}>{article.category}</span>
          </nav>

          <span className={styles.articleCategory}>{article.category}</span>
          <h1 className={styles.heroTitle}>{article.title}</h1>

          <div className={styles.articleMeta}>
            <div className={styles.authorInfo}>
              <img src={article.author.avatar} alt={article.author.name} className={styles.authorAvatar} />
              <span className={styles.authorName}>{article.author.name}</span>
            </div>
            <div className={styles.metaItem}>
              <FiCalendar /> {article.publishedAt}
            </div>
            <div className={styles.metaItem}>
              <FiClock /> {article.readTime} чтения
            </div>
            <div className={styles.metaItem}>
              <FiEye /> {article.views}
            </div>
            <div className={styles.metaItem}>
              <FiMessageCircle /> {article.commentsCount}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Image */}
      <div className={styles.featuredImage}>
        <img src={article.featuredImage} alt={article.title} className={styles.featuredImageInner} />
      </div>

      {/* Main Content */}
      <main className={styles.main}>
        <div className={styles.content}>
          {/* Article */}
          <div>
            <article className={styles.article}>
              <div
                className={styles.articleContent}
                dangerouslySetInnerHTML={{ __html: article.content }}
              />

              {/* Tags */}
              <div className={styles.articleTags}>
                {article.tags.map((tag, index) => (
                  <Link key={index} to={`/blog?tag=${tag}`} className={styles.articleTag}>
                    #{tag}
                  </Link>
                ))}
              </div>

              {/* Share */}
              <div className={styles.shareSection}>
                <span className={styles.shareLabel}>Поделиться:</span>
                <div className={styles.shareButtons}>
                  <button className={`${styles.shareButton} ${styles.shareButtonFacebook}`}>
                    <span>f</span>
                  </button>
                  <button className={`${styles.shareButton} ${styles.shareButtonTwitter}`}>
                    <span>𝕏</span>
                  </button>
                  <button className={`${styles.shareButton} ${styles.shareButtonTelegram}`}>
                    <FiSend />
                  </button>
                  <button className={`${styles.shareButton} ${styles.shareButtonWhatsapp}`}>
                    <FiMessageCircle />
                  </button>
                  <button className={`${styles.shareButton} ${styles.shareButtonCopy}`}>
                    <FiShare2 />
                  </button>
                </div>
              </div>

              {/* Author Box */}
              <div className={styles.authorBox}>
                <img src={article.author.avatar} alt={article.author.name} className={styles.authorBoxAvatar} />
                <div className={styles.authorBoxInfo}>
                  <span className={styles.authorBoxLabel}>Автор статьи</span>
                  <h4 className={styles.authorBoxName}>{article.author.name}</h4>
                  <p className={styles.authorBoxBio}>{article.author.bio}</p>
                </div>
              </div>
            </article>

            {/* Comments */}
            <section className={styles.comments}>
              <h2 className={styles.commentsTitle}>
                <FiMessageCircle /> Комментарии ({article.comments.length})
              </h2>

              <div className={styles.commentForm}>
                <textarea
                  className={styles.commentTextarea}
                  placeholder="Напишите комментарий..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
                <div className={styles.commentFormFooter}>
                  <button className={styles.commentSubmitButton}>
                    <FiSend /> Отправить
                  </button>
                </div>
              </div>

              <div className={styles.commentsList}>
                {article.comments.map((item) => (
                  <div key={item.id} className={styles.commentCard}>
                    <div className={styles.commentHeader}>
                      <div className={styles.commentAuthor}>
                        <img src={item.avatar} alt={item.author} className={styles.commentAvatar} />
                        <div>
                          <div className={styles.commentName}>{item.author}</div>
                          <div className={styles.commentDate}>{item.date}</div>
                        </div>
                      </div>
                    </div>
                    <p className={styles.commentText}>{item.text}</p>
                    <div className={styles.commentActions}>
                      <button className={styles.commentAction}>
                        <FiHeart /> {item.likes}
                      </button>
                      <button className={styles.commentAction}>
                        <FiMessageCircle /> Ответить
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <aside className={styles.sidebar}>
            {/* Table of Contents */}
            <div className={styles.sidebarCard}>
              <h3 className={styles.sidebarTitle}>
                <FiList /> Содержание
              </h3>
              <nav className={styles.tableOfContents}>
                {article.tableOfContents.map((item, index) => (
                  <a key={index} href={`#section-${index}`} className={styles.tocItem}>
                    {index + 1}. {item}
                  </a>
                ))}
              </nav>
            </div>

            {/* Related Articles */}
            <div className={styles.sidebarCard}>
              <h3 className={styles.sidebarTitle}>
                <FiBookmark /> Похожие статьи
              </h3>
              <div className={styles.relatedList}>
                {article.relatedArticles.map((related, index) => (
                  <Link key={index} to={`/blog/${related.slug}`} className={styles.relatedItem}>
                    <img src={related.image} alt={related.title} className={styles.relatedImage} />
                    <div className={styles.relatedInfo}>
                      <div className={styles.relatedTitle}>{related.title}</div>
                      <div className={styles.relatedDate}>{related.date}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div className={styles.sidebarCard}>
              <h3 className={styles.sidebarTitle}>
                <FiFolder /> Категории
              </h3>
              <div className={styles.categoriesList}>
                {article.categories.map((cat, index) => (
                  <Link key={index} to={`/blog?category=${cat.name}`} className={styles.categoryItem}>
                    {cat.name}
                    <span className={styles.categoryCount}>{cat.count}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Newsletter */}
            <div className={styles.newsletterCard}>
              <h3 className={styles.newsletterTitle}>Подписка на блог</h3>
              <p className={styles.newsletterText}>
                Получайте свежие статьи о дизайне и мебели на вашу почту
              </p>
              <form className={styles.newsletterForm} onSubmit={(e) => e.preventDefault()}>
                <input
                  type="email"
                  className={styles.newsletterInput}
                  placeholder="Ваш email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <button type="submit" className={styles.newsletterButton}>
                  Подписаться
                </button>
              </form>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};
