import { useTranslation } from 'react-i18next';
import styles from './FurnitureSection.module.css';
import { MdChair, MdTableRestaurant, MdKitchen, MdBed, MdWeekend } from 'react-icons/md';

const FurnitureSection = () => {
  const { t } = useTranslation();

  const categories = [
    {
      icon: <MdChair />,
      titleKey: 'furniture.category1',
      countKey: 'furniture.category1Count',
      color: '#e67e22'
    },
    {
      icon: <MdTableRestaurant />,
      titleKey: 'furniture.category2',
      countKey: 'furniture.category2Count',
      color: '#3498db'
    },
    {
      icon: <MdKitchen />,
      titleKey: 'furniture.category3',
      countKey: 'furniture.category3Count',
      color: '#2ecc71'
    },
    {
      icon: <MdBed />,
      titleKey: 'furniture.category4',
      countKey: 'furniture.category4Count',
      color: '#9b59b6'
    },
    {
      icon: <MdWeekend />,
      titleKey: 'furniture.category5',
      countKey: 'furniture.category5Count',
      color: '#e74c3c'
    }
  ];

  const popularItems = [
    {
      image: 'https://dantonehome.ru/uploads/blocks/166237363612962.jpg',
      titleKey: 'furniture.item1Title',
      priceKey: 'furniture.item1Price',
      masterKey: 'furniture.item1Master',
      rating: 4.9
    },
    {
      image: 'https://www.brutal-wood.ru/image/cache/catalog/stolreka/img_3998-scaled-770x0.jpeg',
      titleKey: 'furniture.item2Title',
      priceKey: 'furniture.item2Price',
      masterKey: 'furniture.item2Master',
      rating: 4.8
    },
    {
      image: 'https://cdn.domdivanov.kz/files/imgs/ig1111914/garnitur-kuhonnyi-uglovoi-ameli-3-2400-1-chernyioniks-seryi@kit-2000x1460.jpg',
      titleKey: 'furniture.item3Title',
      priceKey: 'furniture.item3Price',
      masterKey: 'furniture.item3Master',
      rating: 5.0
    },
    {
      image: 'https://www.mebelmsk.ru/about/%D1%81/1648042414_59-daeger-club-p-shkaf-dlya-garderobnoi-komnati-krasivo-60.jpg',
      titleKey: 'furniture.item4Title',
      priceKey: 'furniture.item4Price',
      masterKey: 'furniture.item4Master',
      rating: 4.7
    },
    {
      image: 'https://ae04.alicdn.com/kf/S02ac8e3b59564669bbaba989b8d7ba91d.jpg',
      titleKey: 'furniture.item5Title',
      priceKey: 'furniture.item5Price',
      masterKey: 'furniture.item5Master',
      rating: 4.9
    },
    {
      image: 'https://pinskdrev.kz/web/catalogfiles/photogallery/Offer/18114/kanyon_stol.jpg',
      titleKey: 'furniture.item6Title',
      priceKey: 'furniture.item6Price',
      masterKey: 'furniture.item6Master',
      rating: 5.0
    }
  ];

  return (
    <section className={styles.furnitureSection}>
      <div className={styles.container}>
        {/* Заголовок */}
        <div className={styles.headerSection}>
          <h2 className={styles.title}>
            {t('furniture.title')} <span>{t('furniture.titleHighlight')}</span>
          </h2>
          <p className={styles.description}>{t('furniture.description')}</p>
        </div>

        {/* Категории */}
        <div className={styles.categoriesGrid}>
          {categories.map((category, index) => (
            <div 
              key={index} 
              className={styles.categoryCard}
              style={{ '--accent-color': category.color } as React.CSSProperties}
            >
              <div className={styles.categoryIcon}>
                {category.icon}
              </div>
              <h3 className={styles.categoryTitle}>{t(category.titleKey)}</h3>
              <p className={styles.categoryCount}>{t(category.countKey)}</p>
              <button className={styles.categoryButton}>{t('furniture.browse')}</button>
            </div>
          ))}
        </div>

        {/* Популярные работы */}
        <div className={styles.popularSection}>
          <div className={styles.popularHeader}>
            <h3 className={styles.popularTitle}>{t('furniture.popularTitle')}</h3>
            <a href="#" className={styles.viewAll}>{t('furniture.viewAll')} →</a>
          </div>

          <div className={styles.popularGrid}>
            {popularItems.map((item, index) => (
              <div key={index} className={styles.popularCard}>
                <div className={styles.imageWrapper}>
                  <img src={item.image} alt={t(item.titleKey)} className={styles.itemImage} />
                  <div className={styles.imageOverlay}>
                    <button className={styles.quickView}>{t('furniture.quickView')}</button>
                  </div>
                </div>
                <div className={styles.itemContent}>
                  <div className={styles.itemHeader}>
                    <h4 className={styles.itemTitle}>{t(item.titleKey)}</h4>
                    <div className={styles.rating}>
                      <span className={styles.star}>★</span>
                      <span className={styles.ratingValue}>{item.rating}</span>
                    </div>
                  </div>
                  <p className={styles.masterName}>{t(item.masterKey)}</p>
                  <div className={styles.itemFooter}>
                    <span className={styles.price}>{t(item.priceKey)}</span>
                    <button className={styles.orderButton}>{t('furniture.order')}</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FurnitureSection;
