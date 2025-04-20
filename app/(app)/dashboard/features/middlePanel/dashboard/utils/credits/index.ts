import {
  CourseID,
  SemesterID,
  Course,
  CoursesBySemesterID,
} from '@/lib/types/models';

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

/**
 * Determine student status (freshman, sophomore, junior, senior) based on total credits
 */
export function getStudentStatus(totalCredits: number): string {
  if (totalCredits < 30) return 'Freshman';
  if (totalCredits < 60) return 'Sophomore';
  if (totalCredits < 90) return 'Junior';
  return 'Senior';
}

export function getHeaderColorClass(credits: number): string {
  if (credits >= 90) {
    // Senior
    return 'bg-red-800 text-white';
  } else if (credits >= 60) {
    // Junior
    return 'bg-red-600 text-white';
  } else if (credits >= 30) {
    // Sophomore
    return 'bg-red-400 text-gray-900';
  } else {
    // Freshman
    return 'bg-red-200 text-gray-900';
  }
}
