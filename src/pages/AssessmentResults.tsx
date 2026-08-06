import { useUserPreferences } from '../hooks/useUserPreferences';
import { CANNABIS_CATEGORIES } from '../types/cannabis';
import type { AssessmentResult } from '../types/user';
import styles from './AssessmentResults.module.css';

interface AssessmentResultsProps {
  result: AssessmentResult;
}

export function AssessmentResults({ result }: AssessmentResultsProps) {
  const { preferences, loading } = useUserPreferences();

  const userHasPreferences = preferences.categoryPreferences.length > 0;

  // Filter recommended categories by what the user said they prefer
  const matchedCategories = result.recommendedCategories.filter((catId) =>
    !userHasPreferences || preferences.categoryPreferences.includes(catId),
  );

  const allRecommended = CANNABIS_CATEGORIES.filter((c) =>
    result.recommendedCategories.includes(c.id),
  );

  const matched = CANNABIS_CATEGORIES.filter((c) => matchedCategories.includes(c.id));

  const filtered = allRecommended.filter((c) => !matchedCategories.includes(c.id));

  if (loading) {
    return <div className={styles.centered}>Loading your results…</div>;
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Your Assessment Results</h1>
      <p className={styles.sub}>
        Completed {result.completedAt.toLocaleDateString()}
      </p>

      {userHasPreferences && (
        <div className={styles.notice}>
          Showing matches within your preferred categories. To see all recommendations,{' '}
          <a href="/profile">update your preferences</a>.
        </div>
      )}

      {matched.length > 0 ? (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            {userHasPreferences ? 'Recommended for You' : 'All Recommendations'}
          </h2>
          <div className={styles.grid}>
            {matched.map((cat) => (
              <div key={cat.id} className={styles.resultCard}>
                <span className={styles.icon}>{cat.icon}</span>
                <span className={styles.label}>{cat.label}</span>
                <span className={styles.description}>{cat.description}</span>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <div className={styles.empty}>
          <p>None of your assessment matches align with your current preferences.</p>
          <a href="/profile" className={styles.link}>
            Update your preferences
          </a>{' '}
          to broaden your matches.
        </div>
      )}

      {userHasPreferences && filtered.length > 0 && (
        <section className={styles.section}>
          <h2 className={`${styles.sectionTitle} ${styles.dimmed}`}>
            Other Recommendations (outside your preferences)
          </h2>
          <div className={`${styles.grid} ${styles.dimmedGrid}`}>
            {filtered.map((cat) => (
              <div key={cat.id} className={`${styles.resultCard} ${styles.filteredCard}`}>
                <span className={styles.icon}>{cat.icon}</span>
                <span className={styles.label}>{cat.label}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
