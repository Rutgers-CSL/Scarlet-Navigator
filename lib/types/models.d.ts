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
  level?: string;
  mainCampus?: string;
  school?: string;
  synopsisURL?: string;
  overridePrereqValidation?: boolean;
  lastOffered?: string;
}

export interface StudyProgram {
  name: string;
  requirements: Requirement[];
}

/**
 * A CourseSet can be of two types:
 *   - "courses": Holds an array of specific course IDs.
 *   - "core": Holds a single core code. We then check how many courses in the schedule have that core.
 */
export interface CourseSet {
  [ref: string]: {
    type: 'core' | 'courses';
    name?: string;
    coreCode?: string; // used if type = "core"
    courses?: string[]; // used if type = "courses"
  };
}

/**
 * A Requirement is composed of one or more "sets" (each referencing a key in CourseSet).
 *
 * - `sets` is an array of objects with:
 *      ref:      a key in the CourseSet map
 *      num_req?: how many courses are needed from that set (optional)
 *        => If omitted for a "courses" type, we need ALL from that set.
 *        => If omitted for a "core" type, we just need 1 course that has the core.
 *
 * - `distinct_num?`: how many distinct courses overall must be used to fulfill the requirement
 * - `sets_num_req`: how many of the sets (among `sets`) must be satisfied to fulfill the requirement
 */
export interface Requirement {
  name: string;
  sets: {
    ref: string;
    num_req?: number;
  }[];
  distinct_num?: number;
  sets_num_req: number;
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
  handleDragOperation: (semesters: CoursesBySemesterID) => void;
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
  ______reset______(): void;
  setSearchResults: (courses: Course[]) => void;
}
