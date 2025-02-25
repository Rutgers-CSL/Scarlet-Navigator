import { Course, CourseID } from '@/lib/types/models';
import { GradePointMap } from '@/lib/hooks/stores/useSettingsStore';

/**
 * Calculate the GPA for a single course based on its grade and the grade point system
 * Returns null if the grade is Pass/Fail, indicating it shouldn't affect GPA
 */
export function calculateCourseGPA(
  course: Course,
  gradePoints: GradePointMap
): number | null {
  // If no grade is assigned, return null (shouldn't affect GPA)
  if (!course.grade) return null;

  // Grade doesn't exist in the system
  if (!(course.grade in gradePoints)) return null;

  // Check if it's a Pass/Fail grade (implementation depends on how Pass/Fail is represented)
  // For example, if Pass/Fail grades have a value of -1 in the gradePoints map
  if (gradePoints[course.grade] === -1) return null;

  // Return the grade point value
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
    if (course) {
      const courseGPA = calculateCourseGPA(course, gradePoints);
      // Only include in GPA calculation if it's not null (not Pass/Fail or ungraded)
      if (courseGPA !== null) {
        totalPoints += courseGPA * course.credits;
        totalCredits += course.credits;
      }
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
    if (course) {
      const courseGPA = calculateCourseGPA(course, gradePoints);
      // Only include in GPA calculation if it's not null (not Pass/Fail or ungraded)
      if (courseGPA !== null) {
        totalPoints += courseGPA * course.credits;
        totalCredits += course.credits;
      }
    }
  });

  return totalCredits > 0 ? totalPoints / totalCredits : 0;
}
