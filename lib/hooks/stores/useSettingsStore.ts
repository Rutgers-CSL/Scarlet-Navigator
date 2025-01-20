import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import defaultSettings from '@/lib/defaultSettings.json';

export type GradePointMap = Record<string, number | null>;

interface SettingsState {
  gradePoints: GradePointMap;
  visuals: {
    showGrades: boolean;
    showGPAsInSemesterTitles: boolean;
  };
}

interface SettingsActions {
  setGradePoints: (gradePoints: GradePointMap) => void;
  resetGradePoints: () => void;
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
    }),
    {
      name: 'settings-storage',
      version: 1,
    }
  )
);
