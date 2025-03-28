import { CourseID, CourseByID, CourseSet, Requirement } from '../types/models';

/** A CourseMap is a dictionary of CourseID -> Course object. */
type CourseMap = CourseByID;

/**
 * A Semester is a list of Course IDs (e.g. ["01:198:111", "01:640:151"]).
 * A ScheduleBoard is an array of Semesters, e.g.:
 *   [
 *     ["01:198:111", "01:640:151"],  // Fall
 *     ["01:198:112"]                 // Spring
 *   ]
 */
type Semester = CourseID[];
type ScheduleBoard = Semester[];

/*************************************
 * 2) EVALUATION LOGIC
 *************************************/

/**
 * Interface for the result of checking a single set within a requirement.
 * - ref: which set we evaluated
 * - name: the display name for this set (if available)
 * - coursesUsed: the IDs of courses that counted toward fulfilling this set
 * - satisfied: whether the set's conditions are met
 * - requiredCount: how many courses are required for this set (if specified)
 */
interface SetEvaluationResult {
  ref: string;
  name?: string;
  coursesUsed: CourseID[];
  satisfied: boolean;
  requiredCount?: number;
}

/**
 * Interface for the result of evaluating an entire Requirement.
 * - requirementName: name of the requirement
 * - satisfied: true if the requirement is fulfilled
 * - setsFulfilled: how many sets within the requirement got fulfilled
 * - setResults: detailed info about each set
 * - distinctCoursesUsed: all unique course IDs used across the sets that were fulfilled
 * - distinctCoursesRequired: number of distinct courses required (from distinct_num)
 */
export interface RequirementEvaluation {
  requirementName: string;
  satisfied: boolean;
  setsFulfilled: number;
  setResults: SetEvaluationResult[];
  distinctCoursesUsed: CourseID[];
  distinctCoursesRequired?: number;
}

/**
 * Evaluate a single Requirement against a schedule board.
 *
 * @param requirement - The requirement to check.
 * @param courseSets - The map of CourseSet definitions.
 * @param scheduleBoard - The user's entire schedule as an array of semesters.
 * @param courseMap - A map of all course IDs to their Course objects.
 * @returns A structured summary (RequirementEvaluation).
 */
export function evaluateRequirement(
  requirement: Requirement,
  courseSets: CourseSet,
  scheduleBoard: ScheduleBoard,
  courseMap: CourseMap
): RequirementEvaluation {
  // Flatten the schedule board to a single array of CourseIDs for easier checking
  const allCourseIDs = scheduleBoard.flat();

  // Evaluate each set in the requirement
  const setResults: SetEvaluationResult[] = requirement.sets.map((set) => {
    const setRef = set.ref;
    const config = courseSets[setRef];
    if (!config) {
      // If no course set is found for the ref, consider it not satisfied.
      return { ref: setRef, coursesUsed: [], satisfied: false };
    }

    // How many courses are needed from this set (if specified).
    // If num_req is omitted => special logic below.
    const requiredCount = set.num_req;

    // We'll track which courses from the schedule qualify.
    let matchingCourses: CourseID[] = [];

    if (config.type === 'courses') {
      // Evaluate "courses" type set

      const expectedCourses = config.courses || [];
      // If requiredCount is not defined, user needs ALL from the set
      // Otherwise, user needs requiredCount from that set.

      // Which of these expectedCourses are actually in the schedule?
      matchingCourses = expectedCourses.filter((cId) => {
        return allCourseIDs.includes(cId);
      });

      let isSatisfied = false;
      if (requiredCount === undefined) {
        // Must have all
        isSatisfied = matchingCourses.length === expectedCourses.length;
      } else {
        // Must have at least requiredCount
        isSatisfied = matchingCourses.length >= requiredCount;
      }

      return {
        ref: setRef,
        name: config.name,
        coursesUsed: matchingCourses,
        satisfied: isSatisfied,
        requiredCount:
          requiredCount !== undefined ? requiredCount : expectedCourses.length,
      };
    } else {
      // Evaluate "core" type set
      const coreNeeded = config.coreCode || '';
      // Find all courses in the schedule that have this core
      const matching = allCourseIDs.filter((cId) => {
        const course = courseMap[cId];
        return course && course.cores.includes(coreNeeded);
      });

      matchingCourses = matching;

      let isSatisfied = false;
      if (requiredCount === undefined) {
        // Just need 1 course with that core
        isSatisfied = matchingCourses.length >= 1;
      } else {
        // Need 'requiredCount' courses with that core
        isSatisfied = matchingCourses.length >= requiredCount;
      }
      return {
        ref: setRef,
        name: config.name,
        coursesUsed: isSatisfied ? matchingCourses : [],
        satisfied: isSatisfied,
        requiredCount: requiredCount !== undefined ? requiredCount : 1,
      };
    }
  });

  // Count how many sets were satisfied
  const fulfilledSets = setResults.filter((res) => res.satisfied);

  // Requirement is satisfied if:
  // (1) The number of fulfilled sets >= requirement.sets_num_req
  // (2) And if distinct_num is set, the total distinct courses used across the fulfilled sets >= distinct_num
  const setsFulfilled = fulfilledSets.length;

  // Gather distinct courses used from all fulfilled sets
  const distinctCoursesUsed = Array.from(
    new Set(fulfilledSets.flatMap((res) => res.coursesUsed))
  );
  const meetsDistinctReq =
    requirement.distinct_num === undefined ||
    distinctCoursesUsed.length >= requirement.distinct_num;

  const requirementSatisfied =
    setsFulfilled >= requirement.sets_num_req && meetsDistinctReq;

  // Return a structured summary
  return {
    requirementName: requirement.name,
    satisfied: requirementSatisfied,
    setsFulfilled,
    setResults,
    distinctCoursesUsed,
    distinctCoursesRequired: requirement.distinct_num,
  };
}

/**
 * Evaluate multiple Requirements at once.
 *
 * @param requirements - Array of Requirement objects.
 * @param courseSets - Map of CourseSet definitions.
 * @param scheduleBoard - The user's schedule.
 * @param courseMap - A map of all courses.
 * @returns Array of evaluation results, one per requirement.
 */
export function evaluateAllRequirements(
  requirements: Requirement[],
  courseSets: CourseSet,
  scheduleBoard: ScheduleBoard,
  courseMap: CourseMap
): RequirementEvaluation[] {
  return requirements.map((req) =>
    evaluateRequirement(req, courseSets, scheduleBoard, courseMap)
  );
}

/*************************************
 * 3) EXAMPLE USAGE
 *************************************/

// Example usage (hypothetical):
// const myRequirements: Requirement[] = [...];  // from YAML/JSON
// const myCourseSets: CourseSet = {...};
// const myScheduleBoard: ScheduleBoard = [
//   ["01:198:111", "01:640:151"],
//   ["01:198:112"]
// ];
// const myCourseMap: CourseMap = {
//   "01:198:111": { id: "01:198:111", name: "Intro to CS", credits: 4, cores: ["QR"], grade: "A" },
//   "01:640:151": { id: "01:640:151", name: "Calculus I", credits: 4, cores: ["QQ"], grade: "B" },
//   "01:198:112": { id: "01:198:112", name: "Data Structures", credits: 4, cores: ["QR"], grade: "A" },
//   // ...
// };

// const results = evaluateAllRequirements(myRequirements, myCourseSets, myScheduleBoard, myCourseMap);
// console.log(results);
