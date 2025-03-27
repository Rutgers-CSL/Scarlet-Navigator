export type CourseID = string;

export interface Course {
  id: CourseID;
  prereqNotes: string;
  overridePrereqValidation?: boolean;
}

// Add a type to handle the special case of "Any Course EQUAL or GREATER Than" pattern
export interface SpecialPrereq {
  type: 'greater_than';
  courseId: CourseID;
}

export type CourseMap = Record<CourseID, Course>;
export type Semester = CourseID[];
export type ScheduleBoard = Semester[];

/**
 *
 * This function will return an array of strings that is shown as:
 *
 * [
 *  "(01:198:112 or 14:332:351) and (01:198:206)",
 *  "(01:198:112 or 14:332:351) and (01:640:477)"
 *  "(01:198:112 or 14:332:351) and (14:332:321)",
 *  "(01:198:112 or 14:332:351" and (14:332:226)""
 * ]
 *
 * This is all one line in courses.json:
    "preReqNotes": "((01:198:112 DATA STRUCTURES  or 14:332:351 PROGRM METHODOLOGYII ) and (01:198:206 INTRODUCTION TO DISCRETE STRUCTURES II ))
    <em> OR </em> ((01:198:112 DATA STRUCTURES  or 14:332:351 PROGRM METHODOLOGYII ) and (01:640:477 MATHEMATICAL THEORY OF PROBABILITY ))
    <em> OR </em> ((01:198:112 DATA STRUCTURES  or 14:332:351 PROGRM METHODOLOGYII ) and (14:332:321 PROBABLTY&RANDOM PRC ))
    <em> OR </em> ((01:198:112 DATA STRUCTURES  or 14:332:351 PROGRM METHODOLOGYII ) and (14:332:226 PROBABILITY & RANDOM PROCESSES ))",
 */
export function parsePreReqNotes(
  prereqNotes: string,
  visited: Set<CourseID>
): string[] | SpecialPrereq {
  // Handle undefined, null, or empty prereqNotes
  if (!prereqNotes || prereqNotes === '') {
    return [''];
  }

  // Check for the special case: "Any Course EQUAL or GREATER Than: (01:XXX:XXX ...)"
  if (prereqNotes.includes('Any Course EQUAL or GREATER Than:')) {
    // Extract the course ID from the pattern
    const match = prereqNotes.match(/\((\d+:\d+:\d+)/);
    if (match && match[1]) {
      return {
        type: 'greater_than',
        courseId: match[1],
      };
    }
  }

  prereqNotes = prereqNotes.replace(/\s+/g, '');
  let parsedStringArray: string[] = [];
  while (prereqNotes.length != 0) {
    let stop_index: number = prereqNotes.indexOf('<em>');
    let parseString: string = '';
    if (stop_index == -1) {
      parseString = prereqNotes;
      // update prereqNotes here
      prereqNotes = prereqNotes.substring(prereqNotes.length); //gets to the next parentheses
    } else {
      parseString = prereqNotes.substring(0, stop_index);
      // update prereqNotes here
      prereqNotes = prereqNotes.substring(stop_index + 11); //gets to the next parentheses
    }
    parseString = parseString.substring(1, parseString.length - 1); // removing outer parentheses

    /* traverse string, remove any character that is not in the following ascii ranges
            - [0-9] --> numbers 0-9
            - [40-41] --> parentheses "(" and ")"
            - [58] --> colon ":"
            - [97-122] --> any lower cases character. we only care about "a","n","d","o","r", but
            there shouldn't be any other characters besides those. for simplicty any lower case
            character accepted.
        */
    let index_ptr: number = 0;

    while (index_ptr != parseString.length) {
      const charASCII: number = parseString.charCodeAt(index_ptr);

      const acceptance_criteria: boolean =
        (charASCII >= 48 && charASCII <= 57) ||
        charASCII == 40 ||
        charASCII == 41 ||
        charASCII == 58 ||
        (charASCII >= 97 && charASCII <= 122);

      //   console.log(
      //     parseString[index_ptr] +
      //       " " +
      //       index_ptr +
      //       " " +
      //       charASCII +
      //       " " +
      //       acceptance_criteria
      //   );

      if (!acceptance_criteria) {
        // index remains the same. next index now becomes current
        parseString =
          parseString.substring(0, index_ptr) +
          parseString.substring(index_ptr + 1);
      } else {
        index_ptr++;
      }
    }

    parsedStringArray.push(parseString);
  }

  return parsedStringArray;
}

/**
 *
 *
 * This function will take a string like "(01:198:112 or 14:332:351) and (01:198:206)", -> yes but without the whitespace
 * checks the visited map, and validates the propositional expression.
 *
 * Return true if expression is true based on the visited map, otherwise false.
 *
 * Ideally, this string comes from the function parsePreReqNotes.
 *
 * @param prereq an expression
 * @param visited seen course IDs
 * @returns boolean
 */
function validatePrereq(prereq: string, visited: Set<CourseID>): boolean {
  /**
   * prereq Constraints:
   * - prereq always 0 layers of parentheses or 1 layer of parentheses
   * - the outer operator is the opposite of the inner operator --> shouldn't matter
   */
  if (prereq === '') {
    return true;
  }

  let temp_str: string = prereq;
  let parentheses_count: number = 0;

  while (temp_str.indexOf('(') != -1) {
    parentheses_count += 1;
    const index: number = temp_str.indexOf('(');
    temp_str = temp_str.substring(index + 1);
  }

  let bit: number = 1;
  if (parentheses_count > 0) {
    bit = 0;
  }

  if (bit) {
    let index_ptr: number = 0; // ptr traversing through prereq. At the start of the loop it will always point at a course
    while (index_ptr < prereq.length) {
      const id: CourseID = prereq.substring(index_ptr, index_ptr + 10);
      const operator: string = prereq.substring(
        index_ptr + 10,
        index_ptr + 10 + 1
      );

      if (visited.has(id)) {
        prereq =
          prereq.substring(0, index_ptr) +
          'T' +
          prereq.substring(index_ptr + 1);
      } else {
        prereq =
          prereq.substring(0, index_ptr) +
          'F' +
          prereq.substring(index_ptr + 1);
      }

      if (operator === 'a') {
        index_ptr += 4;
      } else if (operator === 'o') {
        index_ptr += 3;
      } else {
        index_ptr += 1;
      }
    }
  } else {
    //for loop stuff
    for (let i: number = 0; i < parentheses_count; i++) {
      let start: number = prereq.indexOf('('); // ptr traversing through prereq. At the start of the loop it will always point at a course
      let stop: number = prereq.indexOf(')');

      let temp_prereq: string = prereq.substring(start + 1, stop);
      let index_ptr: number = 0; // ptr traversing through prereq. At the start of the loop it will always point at a course

      while (index_ptr < temp_prereq.length) {
        const id: CourseID = temp_prereq.substring(index_ptr, index_ptr + 10);
        const operator: string = temp_prereq.substring(
          index_ptr + 10,
          index_ptr + 10 + 1
        );

        if (visited.has(id)) {
          temp_prereq =
            temp_prereq.substring(0, index_ptr) +
            'T' +
            temp_prereq.substring(index_ptr + 10);
        } else {
          temp_prereq =
            temp_prereq.substring(0, index_ptr) +
            'F' +
            temp_prereq.substring(index_ptr + 10);
        }

        if (operator === 'a') {
          index_ptr += 4;
        } else if (operator === 'o') {
          index_ptr += 3;
        } else {
          index_ptr += 1;
        }
      }

      //evaluate
      let bool: boolean;
      if (temp_prereq[0] == 'T') {
        bool = true;
      } else {
        bool = false;
      }

      temp_prereq = temp_prereq.substring(1);

      while (temp_prereq.length != 0) {
        if (temp_prereq[0] === 'a') {
          if (temp_prereq[3] === 'T') {
            bool = bool && true;
          } else {
            bool = bool && false;
          }
          temp_prereq = temp_prereq.substring(4);
        } else {
          if (temp_prereq[2] === 'T') {
            bool = bool || true;
          } else {
            bool = bool || false;
          }
          temp_prereq = temp_prereq.substring(3);
        }
      }

      if (bool) {
        prereq = prereq.substring(0, start) + 'T' + prereq.substring(stop + 1);
      } else {
        prereq = prereq.substring(0, start) + 'F' + prereq.substring(stop + 1);
      }
    }
  }

  //evaluate
  let bool: boolean;
  if (prereq[0] == 'T') {
    bool = true;
  } else {
    bool = false;
  }

  prereq = prereq.substring(1);

  while (prereq.length != 0) {
    if (prereq[0] === 'a') {
      if (prereq[3] === 'T') {
        bool = bool && true;
      } else {
        bool = bool && false;
      }
      prereq = prereq.substring(4);
    } else {
      if (prereq[2] === 'T') {
        bool = bool || true;
      } else {
        bool = bool || false;
      }
      prereq = prereq.substring(3);
    }
  }

  return bool;
}

/**
 * Validates if a course with "greater than" prerequisite is satisfied
 * @param specialPrereq The special prerequisite with greater than constraint
 * @param visited Set of completed courses
 * @returns boolean indicating if the constraint is satisfied
 */
function validateGreaterThanPrereq(
  specialPrereq: SpecialPrereq,
  visited: Set<CourseID>
): boolean {
  const baseId = specialPrereq.courseId;

  // First check if the exact course is completed
  if (visited.has(baseId)) {
    return true;
  }

  // Extract components of the course ID
  const [dept, subject, number] = baseId.split(':');

  // Check if any course with the same dept and subject but higher number is completed
  // Use Array.from to convert Set to array to fix the iteration issue
  for (const courseId of Array.from(visited)) {
    if (courseId.startsWith(`${dept}:${subject}:`)) {
      const currentNumber = parseInt(courseId.split(':')[2], 10);
      const baseNumber = parseInt(number, 10);

      if (currentNumber >= baseNumber) {
        return true;
      }
    }
  }

  return false;
}

function validatePrereqSatisfaction(
  course: Course,
  visited: Set<CourseID>
): boolean {
  // If the overridePrereqValidation flag is set, consider prerequisites satisfied
  if (course.overridePrereqValidation) {
    return true;
  }

  // If the course has no prerequisites, consider it satisfied
  if (!course.prereqNotes || course.prereqNotes === '') {
    return true;
  }

  const parsedPrereqs = parsePreReqNotes(course.prereqNotes, visited);

  // Handle special case for "Any Course EQUAL or GREATER Than"
  if (!Array.isArray(parsedPrereqs) && parsedPrereqs.type === 'greater_than') {
    return validateGreaterThanPrereq(parsedPrereqs, visited);
  }

  // Handle normal prerequisites
  for (const prereq of parsedPrereqs as string[]) {
    console.log(prereq + ' ' + validatePrereq(prereq, visited));
    if (validatePrereq(prereq, visited)) {
      return true;
    }
  }

  return false;
}

/**
 *
 * 1. Letting the user know that there is an invalidly placed course
 *  a. validateScheduleBord can the courseID and we can highlight the
 *      course as red on the dashboard
 *
 *      only ONE course is highlighted (first one)
 *
 *      highlights every course that is not good (April. done by Sibi)
 *
 * 2. Fixing up validateScheduleBoard a bit so that it matches the current types
 */

export function validateScheduleBoard(
  board: ScheduleBoard,
  courseMap: CourseMap
): Set<CourseID> {
  const visited = new Set<CourseID>(); // Courses from previous semesters only
  const invalidCourses = new Set<CourseID>(); // Courses with unsatisfied prerequisites

  for (const semester of board) {
    // Create a set to track courses that are valid for this semester
    const semesterValid = new Set<CourseID>();

    for (const courseID of semester) {
      const course = courseMap[courseID];

      // Check if course is not already taken and prerequisites are satisfied
      if (!visited.has(course.id)) {
        if (validatePrereqSatisfaction(course, visited)) {
          semesterValid.add(course.id);
        } else {
          invalidCourses.add(course.id);
        }
      }
    }

    // After validating all courses in the semester, add them to visited
    Array.from(semesterValid).forEach((validCourseID) => {
      visited.add(validCourseID);
    });
  }

  return invalidCourses;
}
