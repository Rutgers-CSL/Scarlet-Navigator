'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PROGRAMS_STORAGE_KEY } from './storeKeys';
import { fetchProgramRequirementsAndCourseSets } from '@/lib/utils/fetchYAMLData';
import {
  evaluateAllRequirements,
  RequirementEvaluation,
} from '@/lib/utils/programValidation';

export interface ProgramState {
  availablePrograms: string[]; // List of program file names (without extension)
  selectedPrograms: string[]; // Programs the user has selected to track
  programEvaluations: Record<string, RequirementEvaluation[]>; // Program name -> evaluations

  // Actions
  loadAvailablePrograms: () => Promise<void>;
  setAvailablePrograms: (programs: string[]) => void;
  selectProgram: (programName: string) => void;
  deselectProgram: (programName: string) => void;
  updateProgramEvaluation: (
    programName: string,
    evaluations: RequirementEvaluation[]
  ) => void;
  evaluateSelectedPrograms: (
    scheduleBoard: string[][],
    courseMap: Record<string, any>
  ) => Promise<void>;
}

export const useProgramsStore = create<ProgramState>()(
  persist(
    (set, get) => ({
      availablePrograms: [],
      selectedPrograms: [],
      programEvaluations: {},

      loadAvailablePrograms: async () => {
        try {
          // This would typically fetch from an API endpoint
          // For now, hardcoding the initial available program
          set({ availablePrograms: ['computerScience'] });
        } catch (error) {
          console.error('Failed to load available programs:', error);
        }
      },

      setAvailablePrograms: (programs: string[]) => {
        set({ availablePrograms: programs });
      },

      selectProgram: (programName: string) => {
        set((state) => ({
          selectedPrograms: [...state.selectedPrograms, programName],
        }));
      },

      deselectProgram: (programName: string) => {
        set((state) => {
          const newEvaluations = { ...state.programEvaluations };
          delete newEvaluations[programName];

          return {
            selectedPrograms: state.selectedPrograms.filter(
              (p) => p !== programName
            ),
            programEvaluations: newEvaluations,
          };
        });
      },

      updateProgramEvaluation: (
        programName: string,
        evaluations: RequirementEvaluation[]
      ) => {
        set((state) => ({
          programEvaluations: {
            ...state.programEvaluations,
            [programName]: evaluations,
          },
        }));
      },

      evaluateSelectedPrograms: async (
        scheduleBoard: string[][],
        courseMap: Record<string, any>
      ) => {
        const { selectedPrograms } = get();

        for (const programName of selectedPrograms) {
          try {
            // Fetch program requirements and course sets
            const { program, courseSets } =
              await fetchProgramRequirementsAndCourseSets(
                `/study-programs/${programName}.yaml`
              );

            // Evaluate requirements
            const evaluations = evaluateAllRequirements(
              program.requirements,
              courseSets,
              scheduleBoard,
              courseMap
            );

            // Update store with evaluations
            get().updateProgramEvaluation(programName, evaluations);
          } catch (error) {
            console.error(`Failed to evaluate program ${programName}:`, error);
          }
        }
      },
    }),
    {
      name: PROGRAMS_STORAGE_KEY,
    }
  )
);
