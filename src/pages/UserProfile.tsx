import { useAuth } from '../hooks/useAuth';
import { useUserPreferences } from '../hooks/useUserPreferences';
import { CategoryCard } from '../components/CategoryCard';
import { CANNABIS_CATEGORIES, type CategoryId } from '../types/cannabis';
import styles from './UserProfile.module.css';

export function UserProfile() {
  const { user } = useAuth();
  const { preferences, loading, saving, error, toggleCategory, savePreferences, hasUnsavedChanges } =
    useUserPreferences();

  if (loading) {
    return <div className={styles.centered}>Loading profile…</div>;
  }

  if (!user) {
    return <div className={styles.centered}>Please sign in to view your profile.</div>;
  }

  return (
    <div className={styles.page}>
      {/* Profile header */}
      <section className={styles.header}>
        <div className={styles.avatar}>
          {user.photoURL ? (
            <img src={user.photoURL} alt="Profile" className={styles.avatarImg} />
          ) : (
            <div className={styles.avatarFallback}>
              {(user.displayName ?? user.email ?? '?')[0].toUpperCase()}
            </div>
          )}
        </div>
        <div>
          <h1 className={styles.name}>{user.displayName ?? 'My Profile'}</h1>
          <p className={styles.email}>{user.email}</p>
        </div>
      </section>

      {/* Category preferences */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>Category Preferences</h2>
            <p className={styles.sectionSubtitle}>
              Select every product type you're open to. Your assessment matches will be filtered to
              these categories.
            </p>
          </div>
          {preferences.categoryPreferences.length > 0 && (
            <span className={styles.badge}>
              {preferences.categoryPreferences.length} selected
            </span>
          )}
        </div>

        <div className={styles.grid}>
          {CANNABIS_CATEGORIES.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              selected={preferences.categoryPreferences.includes(category.id as CategoryId)}
              onToggle={() => toggleCategory(category.id as CategoryId)}
            />
          ))}
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.actions}>
          {preferences.updatedAt && !hasUnsavedChanges && (
            <span className={styles.savedAt}>
              Saved {preferences.updatedAt.toLocaleDateString()}
            </span>
          )}
          <button
            className={styles.saveBtn}
            onClick={savePreferences}
            disabled={saving || !hasUnsavedChanges}
          >
            {saving ? 'Saving…' : 'Save Preferences'}
          </button>
        </div>
      </section>
    </div>
  );
}
