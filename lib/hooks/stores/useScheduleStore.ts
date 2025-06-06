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
} from '@/lib/types/models';
import { COURSE_POOL_CONTAINER_ID } from '@/app/(app)/dashboard/panels/leftPanel/tabs/CourseCreation';
import { SEARCH_CONTAINER_ID, SEARCH_ITEM_DELIMITER } from '@/lib/constants';
import useHistoryStore from './useHistoryStore';
import { UniqueIdentifier } from '@dnd-kit/core';
import { SCHEDULE_STORAGE_KEY } from './storeKeys';
import { cleanSchedule } from '@/lib/utils/adjusters/scheduleFixer';

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
        // useHistoryStore.getState().addToHistory(currentState);
      };

      return {
        semesterOrder: [],
        coursesBySemesterID: {
          [COURSE_POOL_CONTAINER_ID]: [],
          [SEARCH_CONTAINER_ID]: [],
        },
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

        addCourse: (
          name: string,
          credits: number,
          cores: string[] = [],
          customId: CourseID
        ) => {
          const state = get();
          saveToHistory(state);
          const newCourseId = customId;
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
            [newCourseId]: newCourse,
            ...state.courses,
          };

          const updatedCoursesBySemesterID = {
            ...state.coursesBySemesterID,
            [COURSE_POOL_CONTAINER_ID]: [
              newCourseId,
              ...(state.coursesBySemesterID[COURSE_POOL_CONTAINER_ID] || []),
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

        handleDragOperation: (semesters: CoursesBySemesterID) => {
          // if (isNewContainerMove) {
          //   saveToHistory(currentState);
          // }

          //go through every container and remove duplicate courses
          //that appear in any other container, and remove null/blank values

          const cleanedSemesters = cleanSchedule(semesters);

          set({ coursesBySemesterID: cleanedSemesters });
        },

        undo: () => {
          useHistoryStore.getState().undo();
        },

        redo: () => {
          useHistoryStore.getState().redo();
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

        removeCourse: (courseId: CourseID, containerId: UniqueIdentifier) => {
          const state = get();
          saveToHistory(state);

          // Remove course from coursesBySemesterID
          const updatedCoursesBySemesterID = {
            ...state.coursesBySemesterID,
            [containerId]: state.coursesBySemesterID[containerId].filter(
              (id) => id !== courseId
            ),
          };

          // Remove course from courses object
          const { [courseId]: _, ...updatedCourses } = state.courses;

          set({
            coursesBySemesterID: updatedCoursesBySemesterID,
            courses: updatedCourses,
          });
        },

        /**
         *
         * Adds logical verification for edit/creation form for courses. For now,
         * this function only checks the new proposed ID (if it exists).
         *
         * @param oldCourse state of course before edits are made
         * if oldCourse is null, we can assume that its a course being created.
         * @param updates
         */
        validateCourseEdit: (
          oldCourse: Course | null,
          updates: Partial<Course>
        ) => {
          const keys = Object.keys(get().courses);
          const proposedID = updates.id as string;

          const errors: string[] = [];
          if (proposedID) {
            //verify that a course ID is in the format xxx:xxxx:xxx
            const regex = /^\d{1,3}:\d{1,3}:\d{1,3}$/;
            if (!regex.test(proposedID)) {
              errors.push(
                'ID must be in a course number format xxx:xxx:xxx (e.g. 01:198:112, 121:302:101)'
              );
            }

            if (
              oldCourse &&
              oldCourse.id !== proposedID &&
              keys.includes(proposedID)
            ) {
              errors.push('A course with this ID already exists');
            }
          }

          return { success: errors.length === 0, errors };
        },

        setSearchResults: (courses: Course[]) => {
          const state = get();
          const updatedCourses = { ...state.courses };
          const updatedCoursesBySemesterID: CoursesBySemesterID = {
            ...state.coursesBySemesterID,
            // on new searches always start with a blank slate
            [SEARCH_CONTAINER_ID]: [],
          };

          // Delete existing search results from course id mapping
          Object.keys(updatedCourses).forEach((courseId) => {
            if (courseId.endsWith(SEARCH_ITEM_DELIMITER)) {
              delete updatedCourses[courseId];
            }
          });

          //TODO REMOVE: for debugging. checking if course search items have actually been deleted
          Object.keys(updatedCourses).forEach((courseId) => {
            if (courseId.endsWith(SEARCH_ITEM_DELIMITER)) {
              console.log(
                'WRONGGGGGGG!!!! Course from search STILL EXISTS: ',
                courseId
              );
            }
          });

          // Add new search results to new search container
          courses.forEach((course) => {
            const courseId = `${course.id}${SEARCH_ITEM_DELIMITER}`;
            course.id = courseId;
            updatedCourses[courseId] = course;
            updatedCoursesBySemesterID[SEARCH_CONTAINER_ID].push(courseId);
          });

          set({
            courses: updatedCourses,
            coursesBySemesterID: updatedCoursesBySemesterID,
          });
        },
      };
    },
    {
      name: SCHEDULE_STORAGE_KEY,
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

export default useScheduleStore;
