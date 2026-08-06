import type { CategoryId } from './cannabis';

export interface UserPreferences {
  categoryPreferences: CategoryId[];
  updatedAt: Date | null;
}

export interface AssessmentResult {
  id: string;
  completedAt: Date;
  scores: Record<string, number>;
  recommendedCategories: CategoryId[];
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  preferences: UserPreferences;
  assessmentResults: AssessmentResult[];
  createdAt: Date | null;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  categoryPreferences: [],
  updatedAt: null,
};
