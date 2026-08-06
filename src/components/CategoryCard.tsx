import type { CannabisCategory } from '../types/cannabis';
import styles from './CategoryCard.module.css';

interface CategoryCardProps {
  category: CannabisCategory;
  selected: boolean;
  onToggle: () => void;
}

export function CategoryCard({ category, selected, onToggle }: CategoryCardProps) {
  return (
    <button
      type="button"
      className={`${styles.card} ${selected ? styles.selected : ''}`}
      onClick={onToggle}
      aria-pressed={selected}
    >
      <span className={styles.icon}>{category.icon}</span>
      <span className={styles.label}>{category.label}</span>
      <span className={styles.description}>{category.description}</span>
      {selected && <span className={styles.check}>✓</span>}
    </button>
  );
}
