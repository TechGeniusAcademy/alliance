import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiSearch,
  FiClock,
  FiEye,
  FiHeart,
  FiChevronLeft,
  FiChevronRight,
  FiTrendingUp,
  FiTag,
  FiMail,
  FiStar,
  FiArrowRight
} from 'react-icons/fi';
import { useLanguage } from '../../context/LanguageContext';
import styles from './Blog.module.css';

export const BlogPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'Все статьи' },
    { id: 'guides', label: 'Руководства' },
    { id: 'trends', label: 'Тренды' },
    { id: 'tips', label: 'Советы' },
    { id: 'interviews', label: 'Интервью' },
    { id: 'cases', label: 'Кейсы' },
    { id: 'news', label: 'Новости' }
  ];

  const featuredArticle = {
    id: 1,
    title: 'Как выбрать качественную кухонную мебель: полное руководство',
    excerpt: 'Разбираем все аспекты выбора кухонной мебели: от материалов и фурнитуры до планировки и эргономики. Советы от профессионалов с 20-летним опытом.',
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=500&fit=crop',
    category: 'Руководства',
    date: '15 января 2025',
    readTime: '12 мин',
    views: 3420
  };

  const articles = [
    {
      id: 2,
      title: 'Топ-10 трендов в дизайне мебели 2025 года',
      excerpt: 'Обзор главных тенденций: устойчивые материалы, модульность, умная мебель и природные цвета.',
      image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=400&fit=crop',
      category: 'Тренды',
      author: { name: 'Анна Иванова', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop' },
      date: '12 января 2025',
      readTime: '8 мин',
      views: 1850,
      likes: 124
    },
    {
      id: 3,
      title: '5 ошибок при заказе мебели на заказ',
      excerpt: 'Избегайте типичных ошибок заказчиков: от неправильных замеров до выбора неподходящих материалов.',
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=400&fit=crop',
      category: 'Советы',
      author: { name: 'Сергей Петров', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop' },
      date: '10 января 2025',
      readTime: '6 мин',
      views: 2340,
      likes: 98
    },
    {
      id: 4,
      title: 'Интервью: мастер с 25-летним стажем о секретах профессии',
      excerpt: 'Беседа с Алексеем Кимом о пути в профессии, сложностях и радостях работы мебельщика.',
      image: 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=600&h=400&fit=crop',
      category: 'Интервью',
      author: { name: 'Редакция', avatar: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop' },
      date: '8 января 2025',
      readTime: '15 мин',
      views: 1560,
      likes: 215
    },
    {
      id: 5,
      title: 'Как мастерская "Уют" увеличила заказы на 300%',
      excerpt: 'Кейс использования платформы ALLIANCE: от регистрации до стабильного потока клиентов.',
      image: 'https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=600&h=400&fit=crop',
      category: 'Кейсы',
      author: { name: 'Марина Джумабаева', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop' },
      date: '5 января 2025',
      readTime: '10 мин',
      views: 980,
      likes: 156
    },
    {
      id: 6,
      title: 'Экологичные материалы в мебельном производстве',
      excerpt: 'Обзор современных экологичных материалов: бамбук, переработанный пластик, FSC-древесина.',
      image: 'https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=600&h=400&fit=crop',
      category: 'Тренды',
      author: { name: 'Айгерим Сатова', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop' },
      date: '3 января 2025',
      readTime: '7 мин',
      views: 1120,
      likes: 89
    }
  ];

  const popularArticles = [
    { id: 7, title: 'Как правильно замерить помещение для мебели', date: '1 янв 2025', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200&h=150&fit=crop' },
    { id: 8, title: 'Выбор фурнитуры: Blum vs Hettich', date: '28 дек 2024', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200&h=150&fit=crop' },
    { id: 9, title: 'ЛДСП vs МДФ: что выбрать?', date: '25 дек 2024', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=200&h=150&fit=crop' },
    { id: 10, title: 'Умная мебель: обзор технологий', date: '20 дек 2024', image: 'https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=200&h=150&fit=crop' }
  ];

  const tags = [
    'Кухни', 'Шкафы', 'Дизайн', 'Материалы', 'Фурнитура', 
    'Тренды 2025', 'Экология', 'Советы', 'Реставрация', 'Детская мебель'
  ];

  return (
    <div className={styles.blog}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContainer}>
          <div className={styles.breadcrumbs}>
            <Link to="/">Главная</Link>
            <span>/</span>
            <span>Блог</span>
          </div>
          
          <h1>Блог о мебели</h1>
          <p>
            Советы экспертов, тренды дизайна и истории успеха мастеров мебельного дела
          </p>
          
          <div className={styles.heroSearch}>
            <FiSearch />
            <input
              type="text"
              placeholder="Поиск статей..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className={styles.categoriesSection}>
        <div className={styles.categoriesContainer}>
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`${styles.categoryBtn} ${activeCategory === cat.id ? styles.active : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* Main Content */}
      <div className={styles.mainContent}>
        {/* Featured Article */}
        <article className={styles.featuredArticle}>
          <img 
            src={featuredArticle.image} 
            alt={featuredArticle.title}
            className={styles.featuredImage}
          />
          <div className={styles.featuredContent}>
            <span className={styles.featuredBadge}>
              <FiStar />
              Рекомендуем
            </span>
            <h2>
              <Link to={`/blog/${featuredArticle.id}`}>{featuredArticle.title}</Link>
            </h2>
            <p className={styles.featuredExcerpt}>{featuredArticle.excerpt}</p>
            <div className={styles.featuredMeta}>
              <span><FiClock /> {featuredArticle.readTime}</span>
              <span><FiEye /> {featuredArticle.views} просмотров</span>
              <span>{featuredArticle.date}</span>
            </div>
          </div>
        </article>

        <div className={styles.contentGrid}>
          {/* Articles */}
          <div className={styles.articlesSection}>
            <h3>Последние статьи</h3>
            <div className={styles.articlesGrid}>
              {articles.map((article) => (
                <article key={article.id} className={styles.articleCard}>
                  <img 
                    src={article.image} 
                    alt={article.title}
                    className={styles.articleImage}
                  />
                  <div className={styles.articleContent}>
                    <span className={styles.articleCategory}>{article.category}</span>
                    <h4>
                      <Link to={`/blog/${article.id}`}>{article.title}</Link>
                    </h4>
                    <p className={styles.articleExcerpt}>{article.excerpt}</p>
                    <div className={styles.articleMeta}>
                      <div className={styles.articleAuthor}>
                        <img 
                          src={article.author.avatar} 
                          alt={article.author.name}
                          className={styles.authorAvatar}
                        />
                        <span>{article.author.name}</span>
                      </div>
                      <div className={styles.articleStats}>
                        <span><FiEye /> {article.views}</span>
                        <span><FiHeart /> {article.likes}</span>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Pagination */}
            <div className={styles.pagination}>
              <button className={styles.pageBtn} disabled>
                <FiChevronLeft />
              </button>
              <button className={`${styles.pageBtn} ${styles.active}`}>1</button>
              <button className={styles.pageBtn}>2</button>
              <button className={styles.pageBtn}>3</button>
              <button className={styles.pageBtn}>...</button>
              <button className={styles.pageBtn}>8</button>
              <button className={styles.pageBtn}>
                <FiChevronRight />
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <aside className={styles.sidebar}>
            {/* Popular Articles */}
            <div className={styles.sidebarCard}>
              <h3><FiTrendingUp /> Популярное</h3>
              <div className={styles.popularList}>
                {popularArticles.map((article) => (
                  <div key={article.id} className={styles.popularItem}>
                    <img 
                      src={article.image} 
                      alt={article.title}
                      className={styles.popularImage}
                    />
                    <div className={styles.popularContent}>
                      <h5><Link to={`/blog/${article.id}`}>{article.title}</Link></h5>
                      <span>{article.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className={styles.sidebarCard}>
              <h3><FiTag /> Теги</h3>
              <div className={styles.tagsList}>
                {tags.map((tag, index) => (
                  <Link key={index} to={`/blog?tag=${tag}`} className={styles.tag}>
                    {tag}
                  </Link>
                ))}
              </div>
            </div>

            {/* Newsletter */}
            <div className={`${styles.sidebarCard} ${styles.newsletter}`}>
              <h3><FiMail /> Рассылка</h3>
              <p>Получайте новые статьи и эксклюзивные материалы на почту</p>
              <form className={styles.newsletterForm}>
                <input type="email" placeholder="Ваш email" />
                <button type="submit" className={styles.newsletterBtn}>
                  Подписаться
                </button>
              </form>
            </div>
          </aside>
        </div>
      </div>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaContainer}>
          <h2>Хотите стать автором?</h2>
          <p>
            Поделитесь своим опытом и знаниями с тысячами читателей. 
            Мы всегда рады экспертным материалам.
          </p>
          <Link to="/contact" className={styles.ctaBtn}>
            Написать нам
            <FiArrowRight />
          </Link>
        </div>
      </section>
    </div>
  );
};
