import { CoursesBySemesterID } from '@/lib/types/models';

/**
 * Removes duplicate courses across semesters to ensure a course appears only once in the schedule.
 * Earlier semesters (those that come first in the semester keys) have priority.
 *
 * @param semesters The current coursesBySemesterID structure to clean
 * @returns A new coursesBySemesterID structure with duplicates removed
 */
export function removeDuplicateCoursesAcrossSemesters(
  semesters: CoursesBySemesterID
): CoursesBySemesterID {
  const cleanedSemesters: CoursesBySemesterID = {};
  const seenCourses = new Set<string>();

  // Process semesters in order (assuming keys are ordered as desired)
  // This ensures earlier semesters have priority
  Object.keys(semesters).forEach((semesterId) => {
    const courses = semesters[semesterId] || [];
    const uniqueCourses = courses.filter((courseId) => {
      // Convert courseId to string regardless if it's string or UniqueIdentifier
      const courseIdStr = String(courseId);

      // If we've seen this course in another semester, filter it out
      if (seenCourses.has(courseIdStr)) {
        return false;
      }

      // Mark this course as seen and keep it
      seenCourses.add(courseIdStr);
      return true;
    });

    // Store the filtered courses for this semester
    cleanedSemesters[semesterId] = uniqueCourses;
  });

  return cleanedSemesters;
}

/**
 * Removes duplicate courseIDs within each semester.
 *
 * @param semesters The current coursesBySemesterID structure to clean
 * @returns A new coursesBySemesterID structure with in-semester duplicates removed
 */
export function removeDuplicateCoursesWithinSemesters(
  semesters: CoursesBySemesterID
): CoursesBySemesterID {
  const cleanedSemesters: CoursesBySemesterID = {};

  Object.keys(semesters).forEach((semesterId) => {
    const courses = semesters[semesterId] || [];
    const seenCoursesInSemester = new Set<string>();
    const uniqueCourses = courses.filter((courseId) => {
      const courseIdStr = String(courseId);

      if (seenCoursesInSemester.has(courseIdStr)) {
        return false;
      }

      seenCoursesInSemester.add(courseIdStr);
      return true;
    });

    cleanedSemesters[semesterId] = uniqueCourses;
  });

  return cleanedSemesters;
}

/**
 * Comprehensive schedule fixer that removes all duplicate courses
 * both within semesters and across semesters.
 *
 * @param semesters The current coursesBySemesterID structure to clean
 * @returns A new coursesBySemesterID structure with all duplicates removed
 */
export function fixScheduleDuplicates(
  semesters: CoursesBySemesterID
): CoursesBySemesterID {
  // First remove duplicates within each semester
  const withoutIntraSemesterDuplicates =
    removeDuplicateCoursesWithinSemesters(semesters);

  // Then remove duplicates across semesters
  return removeDuplicateCoursesAcrossSemesters(withoutIntraSemesterDuplicates);
}
