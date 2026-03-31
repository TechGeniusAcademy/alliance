import { Link } from 'react-router-dom';
import { FiClock, FiArrowRight } from 'react-icons/fi';
import { useLanguage } from '../../../context/LanguageContext';
import { ROUTES } from '../../../constants';
import { Button } from '../../ui/Button';
import styles from './Blog.module.css';

export const Blog = () => {
  const { t } = useLanguage();

  const articles = [
    {
      id: '1',
      slug: 'kitchen-trends-2024',
      title: t('blog.article1.title'),
      excerpt: t('blog.article1.excerpt'),
      category: t('categories.kitchen'),
      date: '2024-01-15',
      readTime: 5,
      image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&h=300&fit=crop',
    },
    {
      id: '2',
      slug: 'how-to-choose-master',
      title: t('blog.article2.title'),
      excerpt: t('blog.article2.excerpt'),
      category: t('blog.guides'),
      date: '2024-01-10',
      readTime: 8,
      image: 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=500&h=300&fit=crop',
    },
    {
      id: '3',
      slug: 'materials-guide',
      title: t('blog.article3.title'),
      excerpt: t('blog.article3.excerpt'),
      category: t('blog.materials'),
      date: '2024-01-05',
      readTime: 12,
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=300&fit=crop',
    },
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <h2 className={styles.title}>{t('blog.title')}</h2>
            <p className={styles.subtitle}>{t('blog.subtitle')}</p>
          </div>
          <Button 
            variant="outline" 
            as={Link} 
            to={ROUTES.BLOG}
            rightIcon={<FiArrowRight />}
          >
            {t('blog.viewAll')}
          </Button>
        </div>

        <div className={styles.grid}>
          {articles.map((article) => (
            <Link
              key={article.id}
              to={`${ROUTES.BLOG}/${article.slug}`}
              className={styles.card}
            >
              <div className={styles.imageWrapper}>
                <img 
                  src={article.image} 
                  alt={article.title}
                  className={styles.articleImage}
                />
              </div>
              <div className={styles.cardContent}>
                <span className={styles.category}>{article.category}</span>
                <h3 className={styles.articleTitle}>{article.title}</h3>
                <p className={styles.excerpt}>{article.excerpt}</p>
                <div className={styles.meta}>
                  <span className={styles.date}>{formatDate(article.date)}</span>
                  <span className={styles.readTime}>
                    <FiClock />
                    {article.readTime} {t('blog.minRead')}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
