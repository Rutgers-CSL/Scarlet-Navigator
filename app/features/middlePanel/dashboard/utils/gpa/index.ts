import { Course, CourseID } from '@/types/models';
import { GradePointMap } from '@/lib/hooks/stores/useSettingsStore';

/**
 * Calculate the GPA for a single course based on its grade and the grade point system
 * Returns null if the grade is Pass/Fail, indicating it shouldn't affect GPA
 */
export function calculateCourseGPA(
  course: Course,
  gradePoints: GradePointMap
): number | null {
  if (!course.grade) return 0;

  // Grade doesn't exist in the system
  if (!(course.grade in gradePoints)) return 0;

  // Pass/Fail grades return null to indicate they don't affect GPA
  return gradePoints[course.grade];
}

/**
 * Calculate the GPA for a semester based on its courses and the grade point system
 * Ignores Pass/Fail grades in the calculation
 */
export function calculateSemesterGPA(
  courseIds: CourseID[],
  courses: Record<CourseID, Course>,
  gradePoints: GradePointMap
): number {
  let totalPoints = 0;
  let totalCredits = 0;

  courseIds.forEach((courseId) => {
    const course = courses[courseId];
    if (course && course.grade) {
      const courseGPA = calculateCourseGPA(course, gradePoints);
      // Only include in GPA calculation if it's not Pass/Fail
      if (courseGPA == null) return;

      totalPoints += courseGPA * course.credits;
      totalCredits += course.credits;
    }
  });

  return totalCredits > 0 ? totalPoints / totalCredits : 0;
}

/**
 * Calculate the cumulative GPA across multiple semesters
 * Ignores Pass/Fail grades in the calculation
 */
export function calculateCumulativeGPA(
  allCourseIds: CourseID[],
  courses: Record<CourseID, Course>,
  gradePoints: GradePointMap
): number {
  let totalPoints = 0;
  let totalCredits = 0;

  allCourseIds.forEach((courseId) => {
    const course = courses[courseId];
    if (course && course.grade) {
      const courseGPA = calculateCourseGPA(course, gradePoints);
      // Only include in GPA calculation if it's not Pass/Fail
      if (courseGPA == null) return;

      totalPoints += courseGPA * course.credits;
      totalCredits += course.credits;
    }
  });

  return totalCredits > 0 ? totalPoints / totalCredits : 0;
}
