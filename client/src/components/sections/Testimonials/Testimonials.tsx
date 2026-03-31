import { useState } from 'react';
import { FiChevronLeft, FiChevronRight, FiStar } from 'react-icons/fi';
import { useLanguage } from '../../../context/LanguageContext';
import styles from './Testimonials.module.css';

export const Testimonials = () => {
  const { t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);

  const testimonials = [
    {
      id: '1',
      name: 'Айгуль Тлеубаева',
      role: t('testimonials.customer'),
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
      rating: 5,
      text: t('testimonials.review1'),
    },
    {
      id: '2',
      name: 'Сергей Иванов',
      role: t('testimonials.customer'),
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      rating: 5,
      text: t('testimonials.review2'),
    },
    {
      id: '3',
      name: 'Марат Нурланов',
      role: t('testimonials.master'),
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      rating: 5,
      text: t('testimonials.review3'),
    },
  ];

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>{t('testimonials.title')}</h2>
          <p className={styles.subtitle}>{t('testimonials.subtitle')}</p>
        </div>

        <div className={styles.slider}>
          <button 
            className={`${styles.navButton} ${styles.prev}`}
            onClick={prevSlide}
            aria-label="Previous testimonial"
          >
            <FiChevronLeft />
          </button>

          <div className={styles.track}>
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.id}
                className={`${styles.slide} ${index === currentIndex ? styles.active : ''}`}
              >
                <div className={styles.card}>
                  <div className={styles.rating}>
                    {[...Array(5)].map((_, i) => (
                      <FiStar
                        key={i}
                        className={`${styles.star} ${i < testimonial.rating ? styles.filled : ''}`}
                      />
                    ))}
                  </div>
                  <blockquote className={styles.quote}>
                    "{testimonial.text}"
                  </blockquote>
                  <div className={styles.author}>
                    <div className={styles.avatar}>
                      {testimonial.avatar ? (
                        <img src={testimonial.avatar} alt={testimonial.name} />
                      ) : (
                        <span className={styles.avatarInitial}>
                          {testimonial.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className={styles.authorInfo}>
                      <div className={styles.authorName}>{testimonial.name}</div>
                      <div className={styles.authorRole}>{testimonial.role}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button 
            className={`${styles.navButton} ${styles.next}`}
            onClick={nextSlide}
            aria-label="Next testimonial"
          >
            <FiChevronRight />
          </button>
        </div>

        <div className={styles.dots}>
          {testimonials.map((_, index) => (
            <button
              key={index}
              className={`${styles.dot} ${index === currentIndex ? styles.activeDot : ''}`}
              onClick={() => setCurrentIndex(index)}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
