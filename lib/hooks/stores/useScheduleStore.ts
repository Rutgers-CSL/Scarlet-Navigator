'use client';

import { StateCreator, create } from 'zustand';
import { persist, PersistOptions } from 'zustand/middleware';
import {
  Course,
  CourseByID,
  CourseID,
  CoursesBySemesterID,
  ScheduleActions,
  ScheduleState,
  Semester,
  SemesterID,
  SemesterOrder,
} from '@/types/models';
import {
  COURSE_CREATION_CONTAINER_ID,
  COURSE_CREATION_COURSE_ID,
} from '@/app/features/leftPanel/courseCreation/CourseCreation';
import useHistoryStore from './useHistoryStore';

type ScheduleStore = ScheduleActions & Omit<ScheduleState, 'past' | 'future'>;
type SchedulePersist = (
  config: StateCreator<ScheduleStore>,
  options: PersistOptions<ScheduleStore>
) => StateCreator<ScheduleStore>;

export const useScheduleStore = create<ScheduleStore>()(
  (persist as unknown as SchedulePersist)(
    (
      set: (state: Partial<ScheduleStore>) => void,
      get: () => ScheduleStore
    ) => {
      const saveToHistory = (currentState: ScheduleStore) => {
        useHistoryStore.getState().addToHistory(currentState);
      };

      return {
        semesterOrder: [],
        coursesBySemesterID: {},
        semesterByID: {},
        courses: {},
        globalCores: new Set<string>(),

        setSemesterOrder: (semOrder: SemesterOrder) => {
          const currentState = get();
          saveToHistory(currentState);
          set({ semesterOrder: semOrder });
        },

        setCoursesBySemesterID: (
          semesters: CoursesBySemesterID,
          skipHistory: boolean = false
        ) => {
          const currentState = get();
          if (!skipHistory) {
            saveToHistory(currentState);
          }
          set({ coursesBySemesterID: semesters });
        },

        setCourses: (courses: CourseByID) => {
          const currentState = get();
          saveToHistory(currentState);
          set({ courses });
        },

        addGlobalCores: (cores: string[]) => {
          const currentState = get();
          saveToHistory(currentState);
          const updatedCores = new Set(currentState.globalCores);
          cores.forEach((core) => updatedCores.add(core));
          set({ globalCores: updatedCores });
        },

        addCourse: (name: string, credits: number, cores: string[] = []) => {
          const state = get();
          saveToHistory(state);
          const newCourseId = `course_${Date.now()}`;
          const newCourse: Course = {
            id: newCourseId,
            name: name.trim(),
            credits: credits,
            cores: cores,
            grade: null,
          };

          const updatedCores = new Set(state.globalCores);
          cores.forEach((core) => updatedCores.add(core));

          const updatedCourses = {
            ...state.courses,
            [newCourseId]: newCourse,
          };

          const updatedCoursesBySemesterID = {
            ...state.coursesBySemesterID,
            [COURSE_CREATION_CONTAINER_ID]: [
              ...(state.coursesBySemesterID[COURSE_CREATION_CONTAINER_ID] ||
                []),
              newCourseId,
            ],
          };

          set({
            courses: updatedCourses,
            coursesBySemesterID: updatedCoursesBySemesterID,
            globalCores: updatedCores,
          });

          return newCourseId;
        },

        updateCourse: (id: CourseID, updates: Partial<Course>) => {
          const state = get();
          saveToHistory(state);

          const updatedCourse = {
            ...state.courses[id],
            ...updates,
          };

          const updatedCores = new Set(state.globalCores);
          updatedCourse.cores.forEach((core) => updatedCores.add(core));

          set({
            courses: {
              ...state.courses,
              [id]: updatedCourse,
            },
            globalCores: updatedCores,
          });
        },

        updateSemester: (id: SemesterID, updates: Partial<Semester>) => {
          const state = get();
          saveToHistory(state);

          const updatedSemester = {
            ...state.semesterByID[id],
            ...updates,
          };

          set({
            semesterByID: {
              ...state.semesterByID,
              [id]: updatedSemester,
            },
          });
        },

        handleDragOperation: (
          semesters: CoursesBySemesterID,
          isNewContainerMove: boolean = false
        ) => {
          const currentState = get();
          if (isNewContainerMove) {
            saveToHistory(currentState);
          }
          set({ coursesBySemesterID: semesters });
        },

        undo: () => {
          useHistoryStore.getState().undo();
        },

        redo: () => {
          useHistoryStore.getState().redo();
        },

        ___TEMP___populate: () => {
          const state = createDummySchedule();
          useHistoryStore.getState().clear();
          set(state);
        },

        ______reset______: () => {
          useHistoryStore.getState().clear();
          set({
            semesterOrder: [],
            coursesBySemesterID: {},
            semesterByID: {},
            courses: {},
            globalCores: new Set(),
          });
        },

        removeSemester: (id: SemesterID) => {
          const state = get();
          saveToHistory(state);

          // Remove semester from order
          const updatedSemesterOrder = state.semesterOrder.filter(
            (semId) => semId !== id
          );

          // Remove semester from semesterByID
          const { [id]: _, ...updatedSemesterByID } = state.semesterByID;

          // Remove courses associated with this semester
          const { [id]: coursesToRemove, ...updatedCoursesBySemesterID } =
            state.coursesBySemesterID;
          const updatedCourses = { ...state.courses };
          coursesToRemove?.forEach((courseId) => {
            delete updatedCourses[courseId];
          });

          set({
            semesterOrder: updatedSemesterOrder,
            semesterByID: updatedSemesterByID,
            coursesBySemesterID: updatedCoursesBySemesterID,
            courses: updatedCourses,
          });
        },
      };
    },
    {
      name: 'schedule-storage',
      storage: {
        getItem: (name: string) => {
          const str = localStorage.getItem(name) || '';
          try {
            const parsed = JSON.parse(str);
            return {
              ...parsed,
              state: {
                ...parsed.state,
                globalCores: new Set(parsed.state.globalCores || []),
              },
            };
          } catch {
            return str;
          }
        },
        setItem: (name: string, value: any) => {
          const toStore = {
            ...value,
            state: {
              ...value.state,
              globalCores: Array.from(value.state.globalCores),
            },
          };
          localStorage.setItem(name, JSON.stringify(toStore));
        },
        removeItem: (name: string) => localStorage.removeItem(name),
      },
    }
  )
);

let counter = 0;
function createCourseArray() {
  return Array.from({ length: 5 }, (_, i) => {
    const id = Math.random().toString(36).substring(2, 9);

    return {
      id,
      name: `Course ${++counter}`,
      credits: Math.floor(Math.random() * 4) + 1,
      cores: [`CORE${i + 1}`],
      grade: null,
    };
  });
}

const NUM_SEMESTERS = 3;

const allCourses: Course[][] = Array.from({ length: NUM_SEMESTERS }, (_, i) =>
  createCourseArray()
);
const semesterArray: Semester[] = Array.from(
  { length: NUM_SEMESTERS },
  (_, i) => ({
    id: `semester${i}`,
    courses: allCourses[i].map((course) => course.id),
    title: `Semester ${i + 1}`,
    grade: null,
  })
);

const semesterOrder = semesterArray.map((semester) => semester.id);

export const createDummySchedule = (): Omit<
  ScheduleState,
  'past' | 'future'
> => {
  const courses: CourseByID = {};

  allCourses.forEach((semester) => {
    semester.forEach((course) => {
      courses[course.id] = course;
    });
  });

  const coursesBySemesterID: CoursesBySemesterID = {};
  const semesterByID: Record<string, Semester> = {};

  semesterArray.forEach((semester) => {
    coursesBySemesterID[semester.id] = semester.courses;
    semesterByID[semester.id] = semester;
  });

  coursesBySemesterID[COURSE_CREATION_CONTAINER_ID] = [
    COURSE_CREATION_COURSE_ID,
  ];

  // Create initial global cores set
  const globalCores = new Set<string>();
  allCourses.forEach((semester) => {
    semester.forEach((course) => {
      course.cores.forEach((core) => globalCores.add(core));
    });
  });

  return {
    semesterOrder,
    coursesBySemesterID,
    courses,
    semesterByID,
    globalCores,
  };
};
