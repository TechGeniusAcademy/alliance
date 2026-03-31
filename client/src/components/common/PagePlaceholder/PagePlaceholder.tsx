import styles from './PagePlaceholder.module.css';

interface PagePlaceholderProps {
  title: string;
  description?: string;
}

export const PagePlaceholder = ({ title, description }: PagePlaceholderProps) => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{title}</h1>
      {description && <p className={styles.description}>{description}</p>}
      <p className={styles.note}>Страница в разработке</p>
    </div>
  );
};
