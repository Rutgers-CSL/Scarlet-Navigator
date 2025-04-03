import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import defaultSettings from '@/lib/defaultSettings.json';
import { SETTINGS_STORAGE_KEY } from './storeKeys';

export type GradePointMap = Record<string, number | null>;
export type ValidTerm = 'Fall' | 'Spring' | 'Winter' | 'Summer';

export interface SettingsState {
  gradePoints: GradePointMap;
  general: {
    beginningTerm: ValidTerm;
    beginningYear: number;
    includeWinterAndSummerTerms: boolean;
    validatePrerequisites: boolean;
  };
  visuals: {
    goalCreditsForGraduation: number;
    showQuarterlyStudentTitlesOnSemesterTitles: boolean;
  };
}

interface SettingsActions {
  setGradePoints: (gradePoints: GradePointMap) => void;
  resetGradePoints: () => void;
  setVisuals: (visuals: Partial<SettingsState['visuals']>) => void;
  resetVisuals: () => void;
  resetAllSettings: () => void;
  setGeneral: (general: Partial<SettingsState['general']>) => void;
}

type SettingsStore = SettingsState & SettingsActions;

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      gradePoints: defaultSettings.gradePoints,
      general: {
        beginningTerm: defaultSettings.general.beginningTerm as ValidTerm,
        beginningYear: parseInt(defaultSettings.general.beginningYear),
        includeWinterAndSummerTerms:
          defaultSettings.general.includeWinterAndSummerTerms,
        validatePrerequisites: true,
      },
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

      setGeneral: (newGeneral) => {
        set((state) => ({
          general: {
            ...state.general,
            ...newGeneral,
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
          general: {
            beginningTerm: defaultSettings.general.beginningTerm as ValidTerm,
            beginningYear: parseInt(defaultSettings.general.beginningYear),
            includeWinterAndSummerTerms:
              defaultSettings.general.includeWinterAndSummerTerms,
            validatePrerequisites: true,
          },
        });
      },
    }),
    {
      name: SETTINGS_STORAGE_KEY,
      version: 1,
    }
  )
);
