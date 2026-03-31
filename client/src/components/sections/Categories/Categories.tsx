import { Link } from 'react-router-dom';
import { 
  FiGrid, 
  FiHome, 
  FiLayers, 
  FiBox, 
  FiTarget, 
  FiPackage,
  FiArrowRight 
} from 'react-icons/fi';
import { useLanguage } from '../../../context/LanguageContext';
import { ROUTES } from '../../../constants';
import { Button } from '../../ui/Button';
import styles from './Categories.module.css';

const categoryIcons: Record<string, React.ElementType> = {
  kitchen: FiGrid,
  bedroom: FiHome,
  living: FiLayers,
  office: FiBox,
  bathroom: FiTarget,
  other: FiPackage,
};

const categoryImages: Record<string, string> = {
  kitchen: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop',
  bedroom: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=400&h=300&fit=crop',
  living: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop',
  office: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400&h=300&fit=crop',
  bathroom: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=400&h=300&fit=crop',
  other: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=400&h=300&fit=crop',
};

export const Categories = () => {
  const { t } = useLanguage();

  const categories = [
    { 
      id: 'kitchen', 
      icon: categoryIcons.kitchen,
      image: categoryImages.kitchen,
      title: t('categories.kitchen'),
      count: 450 
    },
    { 
      id: 'bedroom', 
      icon: categoryIcons.bedroom,
      image: categoryImages.bedroom,
      title: t('categories.bedroom'),
      count: 380 
    },
    { 
      id: 'living', 
      icon: categoryIcons.living,
      image: categoryImages.living,
      title: t('categories.living'),
      count: 320 
    },
    { 
      id: 'office', 
      icon: categoryIcons.office,
      image: categoryImages.office,
      title: t('categories.office'),
      count: 280 
    },
    { 
      id: 'bathroom', 
      icon: categoryIcons.bathroom,
      image: categoryImages.bathroom,
      title: t('categories.bathroom'),
      count: 190 
    },
    { 
      id: 'other', 
      icon: categoryIcons.other,
      image: categoryImages.other,
      title: t('categories.other'),
      count: 410 
    },
  ];

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <h2 className={styles.title}>{t('categories.title')}</h2>
            <p className={styles.subtitle}>{t('categories.subtitle')}</p>
          </div>
          <Button 
            variant="outline" 
            as={Link} 
            to={ROUTES.CATEGORIES}
            rightIcon={<FiArrowRight />}
          >
            {t('categories.viewAll')}
          </Button>
        </div>

        <div className={styles.grid}>
          {categories.map((category) => {
            const Icon = category.icon as React.ComponentType<{className?: string}>;
            return (
              <Link
                key={category.id}
                to={`${ROUTES.CATEGORIES}/${category.id}`}
                className={styles.card}
                style={{ backgroundImage: `url(${category.image})` }}
              >
                <div className={styles.cardOverlay}></div>
                <div className={styles.cardContent}>
                  <div className={styles.iconWrapper}>
                    <Icon className={styles.icon} />
                  </div>
                  <h3 className={styles.cardTitle}>{category.title}</h3>
                  <span className={styles.count}>
                    {category.count} {t('categories.masters')}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};
