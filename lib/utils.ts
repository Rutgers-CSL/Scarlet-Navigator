import {
  COURSE_POOL_CONTAINER_ID,
  COURSE_CREATION_COURSE_ID,
} from '@/app/features/leftPanel/courseCreation/CourseCreation';
import {
  Course,
  Semester,
  ScheduleState,
  CourseByID,
  CoursesBySemesterID,
} from '@/lib/types/models';

export function formatLabel(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .replace(/Inside.*$/, '');
}

export const createDummySchedule = (): Omit<
  ScheduleState,
  'past' | 'future'
> => {
  const NUM_SEMESTERS = 3;

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

  const allCourses: Course[][] = Array.from({ length: NUM_SEMESTERS }, (_, i) =>
    createCourseArray()
  );
  const semesterArray: Semester[] = Array.from(
    { length: NUM_SEMESTERS },
    (_, i) => ({
      id: `semester${i}`,
      title: `Semester ${i + 1}`,
    })
  );

  const semesterOrder = semesterArray.map((semester) => semester.id);
  const courses: CourseByID = {};

  allCourses.forEach((semester) => {
    semester.forEach((course) => {
      courses[course.id] = course;
    });
  });

  const coursesBySemesterID: CoursesBySemesterID = {};
  const semesterByID: Record<string, Semester> = {};

  semesterArray.forEach((semester, index) => {
    coursesBySemesterID[semester.id] = allCourses[index].map(
      (course) => course.id
    );
    semesterByID[semester.id] = semester;
  });

  coursesBySemesterID[COURSE_POOL_CONTAINER_ID] = [COURSE_CREATION_COURSE_ID];

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
