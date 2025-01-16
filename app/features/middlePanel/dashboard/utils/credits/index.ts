import {
  CourseID,
  SemesterID,
  Course,
  CoursesBySemesterID,
} from '@/types/models';

/**
 * TODO:
 * I believe that this should function should just take in the courses array.
 * Why does it need to take in an array of course IDs and then a courses map?
 *
 * This seems a bit inelegant.
 */
export function calculateSemesterCredits(
  courseIds: CourseID[],
  courses: Record<CourseID, Course>
): number {
  return courseIds.reduce((total: number, courseId) => {
    const course = courses[courseId];
    return total + (course ? course.credits : 0);
  }, 0);
}

/**
 * TODO:
 * The coursesBySemesterID variable needs to be deleted.
 * It is redundant and a duplicate data structure,
 * and I'm not sure why I've made it this way.
 */
export function calculateRunningCredits(
  semesterOrder: SemesterID[],
  coursesBySemesterID: CoursesBySemesterID,
  courses: Record<CourseID, Course>,
  currentSemesterId: SemesterID
): number {
  let total = 0;
  for (const semesterId of semesterOrder) {
    const credits = calculateSemesterCredits(
      coursesBySemesterID[semesterId] || [],
      courses
    );
    total += credits;
    if (semesterId === currentSemesterId) break;
  }
  return total;
}
