import { parse } from 'yaml';
import { StudyProgram, CourseSet } from '@/lib/types/models';

/**
 * Dynamically fetch a specific program's requirements (YAML file) + the shared course sets.
 *
 * @param programFilePath - Path to the program's requirements YAML (e.g., "/programs/cs.yaml")
 * @returns An object containing:
 *  - program: StudyProgram
 *  - courseSets: CourseSet
 */
export async function fetchProgramRequirementsAndCourseSets(
  programFilePath: string
): Promise<{
  program: StudyProgram;
  courseSets: CourseSet;
}> {
  // Fetch the program requirements file
  const programRes = await fetch(programFilePath);
  if (!programRes.ok) {
    throw new Error(
      `Failed to fetch ${programFilePath}: ${programRes.statusText}`
    );
  }
  const programText = await programRes.text();

  // Fetch shared course sets
  const courseSetsRes = await fetch('/courseSets.yaml');
  if (!courseSetsRes.ok) {
    throw new Error(
      `Failed to fetch /courseSets.yaml: ${courseSetsRes.statusText}`
    );
  }
  const courseSetsText = await courseSetsRes.text();

  let program: StudyProgram;
  let courseSets: CourseSet;

  try {
    program = parse(programText) as StudyProgram;
    courseSets = parse(courseSetsText) as CourseSet;
  } catch (err) {
    throw new Error('Error parsing YAML files: ' + (err as Error).message);
  }

  return { program, courseSets };
}
