import { UniqueIdentifier } from '@dnd-kit/core';

export enum STORE_NAMES {
  schedule = 'schedule',
  courses = 'courses',
  semesters = 'semesters',
}

/**
 * TODO:
 *
 * CoursesBySemesterID map is unnecessary because each Semester object
 * has their own "courses" array that is ordered. There's no need to
 * maintain a separate map. This just duplicates the data.
 *
 * One thing you can do to fix this is wherever you try to access
 * CoursesBySemesterID, replace it with a Store API that uses
 * the semester ID and returns semesterMap[semesterID].courses.
 */

export type CourseID = string | UniqueIdentifier;
export type SemesterID = string | UniqueIdentifier;
export type CourseByID = Record<CourseID, Course>;
export type CoursesBySemesterID = Record<SemesterID, CourseID[]>;
export type SemestersByID = Record<SemesterID, Semester>;
export type SemesterOrder = SemesterID[];

export interface Semester {
  id: SemesterID;
  title: string;
}

export interface Course {
  id: CourseID; //01:198:112
  name: string;
  credits: number;
  cores: string[];
  grade: string | null;
  prereqNotes?: string;
}

export interface ScheduleState {
  semesterOrder: SemesterOrder;
  coursesBySemesterID: CoursesBySemesterID;
  semesterByID: SemestersByID;
  courses: CourseByID;
  globalCores: Set<string>;
  past: Array<Omit<ScheduleState, 'past' | 'future'>>;
  future: Array<Omit<ScheduleState, 'past' | 'future'>>;
}

/*

TODO:
Certainly, I think the Schedule store API can be improved greatly.
As I code to reach the MVP, I will set aside this task to a later point.

I think the overall engine API can be improved as well. However, the feature set
of the MVP is not so crazy that it'd be near impossible to refactor. I will have
some time at the end of the semester to clean this up, and make sure that the
foundation of this project is insured for the future
(so peeps don't replicate inefficiencies for the sake of consistency)

*/
export interface ScheduleActions {
  setSemesterOrder: (semOrder: SemesterOrder) => void;
  setCoursesBySemesterID: (
    semesters: CoursesBySemesterID,
    skipHistory?: boolean
  ) => void;
  setCourses: (courses: CourseByID) => void;
  addCourse: (
    name: string,
    credits: number,
    cores: string[],
    id: CourseID
  ) => CourseID;
  handleDragOperation: (
    semesters: CoursesBySemesterID,
    isNewContainerMove?: boolean
  ) => void;
  updateCourse: (id: CourseID, updates: Partial<Course>) => void;
  updateSemester: (id: SemesterID, updates: Partial<Semester>) => void;
  removeSemester: (id: SemesterID) => void;
  removeCourse: (courseId: CourseID, containerId: UniqueIdentifier) => void;
  validateCourseEdit: (
    oldCourse: Course | null,
    updates: Partial<Course>
  ) => {
    success: boolean;
    errors: string[];
  };
  undo: () => void;
  redo: () => void;
  ___TEMP___populate: () => void;
  ______reset______(): void;
  setSearchResults: (courses: Course[]) => void;
}

export interface CoreRequirement {
  id: string;
  name: string;
  requiredCredits: number;
}

export interface CoreCategory {
  id: string;
  name: string;
  cores: CoreRequirement[]; // The number of cores in this array determines the required cores
}

export interface CoreRequirementsState {
  categories: Record<string, CoreCategory>;
}

export interface CoreRequirementsActions {
  addCategory: (name: string) => void;
  removeCategory: (id: string) => void;
  addCoreToCategory: (
    categoryId: string,
    coreName: string,
    requiredCredits: number
  ) => void;
  removeCoreFromCategory: (categoryId: string, coreId: string) => void;
  updateCategory: (categoryId: string, updates: Partial<CoreCategory>) => void;
  updateCoreRequirement: (
    categoryId: string,
    coreId: string,
    updates: Partial<CoreRequirement>
  ) => void;
}

export interface ProgramOfStudy {
  id: string;
  name: string;
  categoryIds: string[];
}

export interface ProgramFulfillmentState {
  categories: Record<string, CoreCategory>;
  programs: Record<string, ProgramOfStudy>;
}

export interface ProgramFulfillmentActions {
  // Category actions
  addCategory: (name: string) => string;
  removeCategory: (id: string) => void;
  addCoreToCategory: (
    categoryId: string,
    coreName: string,
    requiredCredits: number
  ) => void;
  removeCoreFromCategory: (categoryId: string, coreId: string) => void;
  updateCategory: (categoryId: string, updates: Partial<CoreCategory>) => void;
  updateCoreRequirement: (
    categoryId: string,
    coreId: string,
    updates: Partial<CoreRequirement>
  ) => void;

  // Program actions
  addProgram: (name: string) => void;
  removeProgram: (id: string) => void;
  updateProgram: (id: string, updates: Partial<ProgramOfStudy>) => void;
  addCategoryToProgram: (programId: string, categoryId: string) => void;
  removeCategoryFromProgram: (programId: string, categoryId: string) => void;
}
