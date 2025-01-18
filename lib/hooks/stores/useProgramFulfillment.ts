'use client';

import { StateCreator, create } from 'zustand';
import { persist, PersistOptions } from 'zustand/middleware';
import {
  ProgramFulfillmentState,
  ProgramFulfillmentActions,
  CoreCategory,
  CoreRequirement,
  ProgramOfStudy,
} from '@/lib/types/models';

type ProgramFulfillmentStore = ProgramFulfillmentState &
  ProgramFulfillmentActions;

type ProgramFulfillmentPersist = (
  config: StateCreator<ProgramFulfillmentStore>,
  options: PersistOptions<ProgramFulfillmentStore>
) => StateCreator<ProgramFulfillmentStore>;

type SetState = (
  fn: (state: ProgramFulfillmentStore) => Partial<ProgramFulfillmentStore>
) => void;

// Helper functions for immutable state updates
const updateCategories = (
  categories: Record<string, CoreCategory>,
  categoryId: string,
  updater: (category: CoreCategory) => CoreCategory
): Record<string, CoreCategory> => {
  const category = categories[categoryId];
  if (!category) return categories;

  return {
    ...categories,
    [categoryId]: updater(category),
  };
};

const updatePrograms = (
  programs: Record<string, ProgramOfStudy>,
  programId: string,
  updater: (program: ProgramOfStudy) => ProgramOfStudy
): Record<string, ProgramOfStudy> => {
  const program = programs[programId];
  if (!program) return programs;

  return {
    ...programs,
    [programId]: updater(program),
  };
};

const removeFromRecord = <T>(
  record: Record<string, T>,
  keyToRemove: string
): Record<string, T> => {
  const { [keyToRemove]: _, ...rest } = record;
  return rest;
};

const removeCategoryFromPrograms = (
  programs: Record<string, ProgramOfStudy>,
  categoryId: string
): Record<string, ProgramOfStudy> => {
  return Object.entries(programs).reduce(
    (acc, [programId, program]) => ({
      ...acc,
      [programId]: {
        ...program,
        categoryIds: program.categoryIds.filter(
          (catId) => catId !== categoryId
        ),
      },
    }),
    {}
  );
};

const createCore = (
  name: string,
  requiredCredits: number
): CoreRequirement => ({
  id: `core_${Date.now()}`,
  name,
  requiredCredits,
});

const createCategory = (name: string): CoreCategory => ({
  id: `category_${Date.now()}`,
  name,
  cores: [],
});

const createProgram = (name: string): ProgramOfStudy => ({
  id: `program_${Date.now()}`,
  name,
  categoryIds: [],
});

const updateCoreInList = (
  cores: CoreRequirement[],
  coreId: string,
  updates: Partial<CoreRequirement>
): CoreRequirement[] => {
  return cores.map((core) => {
    if (core.id !== coreId) return core;
    return { ...core, ...updates };
  });
};

export const useProgramFulfillment = create<ProgramFulfillmentStore>()(
  (persist as unknown as ProgramFulfillmentPersist)(
    (set: SetState, get: () => ProgramFulfillmentStore) => {
      const store: ProgramFulfillmentStore = {
        categories: {},
        programs: {},

        // Category management
        addCategory: (name: string) => {
          const newCategory = createCategory(name);
          set((state) => ({
            categories: {
              ...state.categories,
              [newCategory.id]: newCategory,
            },
          }));
          return newCategory.id;
        },

        removeCategory: (id: string) => {
          set((state) => ({
            categories: removeFromRecord(state.categories, id),
            programs: removeCategoryFromPrograms(state.programs, id),
          }));
        },

        addCoreToCategory: (
          categoryId: string,
          coreName: string,
          requiredCredits: number
        ) => {
          const newCore = createCore(coreName, requiredCredits);

          set((state) => ({
            categories: updateCategories(
              state.categories,
              categoryId,
              (category) => ({
                ...category,
                cores: [...category.cores, newCore],
              })
            ),
          }));
        },

        removeCoreFromCategory: (categoryId: string, coreId: string) => {
          set((state) => ({
            categories: updateCategories(
              state.categories,
              categoryId,
              (category) => ({
                ...category,
                cores: category.cores.filter((core) => core.id !== coreId),
              })
            ),
          }));
        },

        updateCategory: (
          categoryId: string,
          updates: Partial<CoreCategory>
        ) => {
          set((state) => ({
            categories: updateCategories(
              state.categories,
              categoryId,
              (category) => ({
                ...category,
                ...updates,
              })
            ),
          }));
        },

        updateCoreRequirement: (
          categoryId: string,
          coreId: string,
          updates: Partial<CoreRequirement>
        ) => {
          set((state) => ({
            categories: updateCategories(
              state.categories,
              categoryId,
              (category) => ({
                ...category,
                cores: updateCoreInList(category.cores, coreId, updates),
              })
            ),
          }));
        },

        // Program management
        addProgram: (name: string) => {
          const newProgram = createProgram(name);
          set((state) => ({
            programs: {
              ...state.programs,
              [newProgram.id]: newProgram,
            },
          }));
        },

        removeProgram: (id: string) => {
          set((state) => ({
            programs: removeFromRecord(state.programs, id),
          }));
        },

        updateProgram: (id: string, updates: Partial<ProgramOfStudy>) => {
          set((state) => ({
            programs: updatePrograms(state.programs, id, (program) => ({
              ...program,
              ...updates,
            })),
          }));
        },

        addCategoryToProgram: (programId: string, categoryId: string) => {
          set((state) => ({
            programs: updatePrograms(state.programs, programId, (program) => ({
              ...program,
              categoryIds: Array.from(
                new Set([...program.categoryIds, categoryId])
              ),
            })),
          }));
        },

        removeCategoryFromProgram: (programId: string, categoryId: string) => {
          set((state) => ({
            programs: updatePrograms(state.programs, programId, (program) => ({
              ...program,
              categoryIds: program.categoryIds.filter(
                (id) => id !== categoryId
              ),
            })),
          }));
        },
      };

      return store;
    },
    {
      name: 'program-fulfillment-storage',
    }
  )
);
