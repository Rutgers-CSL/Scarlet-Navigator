import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import defaultSettings from '@/lib/defaultSettings.json';

export type GradePointMap = Record<string, number | null>;

export interface SettingsState {
  gradePoints: GradePointMap;
  visuals: {
    showGrades: boolean;
    showCoreLabelsInCoursesInsideScheduleBoard: boolean;
    showGPAsInSemesterTitles: boolean;
    goalCreditsForGraduation: number;
    progressivelyDarkenSemestersBasedOnCreditGoal: boolean;
    showCreditCountOnCourseTitles: boolean;
    showQuarterlyStudentTitlesOnSemesterTitles: boolean;
  };
}

interface SettingsActions {
  setGradePoints: (gradePoints: GradePointMap) => void;
  resetGradePoints: () => void;
  setVisuals: (visuals: Partial<SettingsState['visuals']>) => void;
  resetVisuals: () => void;
  resetAllSettings: () => void;
}

type SettingsStore = SettingsState & SettingsActions;

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      gradePoints: defaultSettings.gradePoints,
      visuals: {
        ...defaultSettings.visuals,
      },

      setGradePoints: (gradePoints) => {
        set({ gradePoints });
      },

      resetGradePoints: () => {
        set({ gradePoints: defaultSettings.gradePoints });
      },

      setVisuals: (newVisuals) => {
        set((state) => ({
          visuals: {
            ...state.visuals,
            ...newVisuals,
          },
        }));
      },

      resetVisuals: () => {
        set({ visuals: defaultSettings.visuals });
      },

      resetAllSettings: () => {
        set({
          gradePoints: defaultSettings.gradePoints,
          visuals: defaultSettings.visuals,
        });
      },
    }),
    {
      name: 'settings-storage',
      version: 1,
    }
  )
);
