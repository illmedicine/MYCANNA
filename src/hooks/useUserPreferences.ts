import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { getUserPreferences, saveUserPreferences } from '../services/userService';
import type { CategoryId } from '../types/cannabis';
import type { UserPreferences } from '../types/user';
import { DEFAULT_PREFERENCES } from '../types/user';

interface UseUserPreferencesReturn {
  preferences: UserPreferences;
  loading: boolean;
  saving: boolean;
  error: string | null;
  toggleCategory: (id: CategoryId) => void;
  savePreferences: () => Promise<void>;
  hasUnsavedChanges: boolean;
}

export function useUserPreferences(): UseUserPreferencesReturn {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [savedPreferences, setSavedPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    getUserPreferences(user.uid)
      .then((prefs) => {
        const loaded = prefs ?? DEFAULT_PREFERENCES;
        setPreferences(loaded);
        setSavedPreferences(loaded);
      })
      .catch(() => setError('Failed to load preferences'))
      .finally(() => setLoading(false));
  }, [user]);

  const toggleCategory = useCallback((id: CategoryId) => {
    setPreferences((prev) => {
      const current = prev.categoryPreferences;
      const next = current.includes(id)
        ? current.filter((c) => c !== id)
        : [...current, id];
      return { ...prev, categoryPreferences: next };
    });
  }, []);

  const savePreferences = useCallback(async () => {
    if (!user) return;
    setSaving(true);
    setError(null);
    try {
      await saveUserPreferences(user.uid, preferences.categoryPreferences);
      setSavedPreferences({ ...preferences, updatedAt: new Date() });
    } catch {
      setError('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  }, [user, preferences]);

  const hasUnsavedChanges =
    JSON.stringify(preferences.categoryPreferences.sort()) !==
    JSON.stringify(savedPreferences.categoryPreferences.sort());

  return { preferences, loading, saving, error, toggleCategory, savePreferences, hasUnsavedChanges };
}
