import { ValidTerm } from '@/lib/hooks/stores/useSettingsStore';

// Two possible cycles:
const TERMS_FOUR: ValidTerm[] = ['Fall', 'Winter', 'Spring', 'Summer'];
// Offsets saying: Fall = baseYear, Winter/Spring/Summer = nextYear
const OFFSETS_FOUR = [0, 1, 1, 1];

const TERMS_TWO: ValidTerm[] = ['Fall', 'Spring'];
// Offsets saying: Fall = baseYear, Spring = nextYear
const OFFSETS_TWO = [0, 1];

/**
 * Calculates a single semester title (Term + Year) for the given zero-based
 * 'semesterIndex' relative to a user-defined startingTerm and startingYear.
 */
export function calculateSemesterTitle(
  startingTerm: ValidTerm,
  startingYear: number,
  semesterIndex: number,
  includeWinterAndSummerTerms: boolean
): string {
  const terms = includeWinterAndSummerTerms ? TERMS_FOUR : TERMS_TWO;
  const offsets = includeWinterAndSummerTerms ? OFFSETS_FOUR : OFFSETS_TWO;

  const startingTermIndex = terms.indexOf(startingTerm);
  if (startingTermIndex === -1) {
    throw new Error(`Invalid starting term: ${startingTerm}`);
  }

  // "Base year" means the year you'd be in if you were on the "Fall" offset.
  // Subtract the offset for the startingTerm so that when we add it back,
  // we end up in the correct display year.
  const baseYear = startingYear - offsets[startingTermIndex];

  // totalTermIndex is how far (in number of semesters) we are from the beginning.
  const totalTermIndex = startingTermIndex + semesterIndex;
  const cycleLength = terms.length;

  // cycleIndex = which term in the cycle (0..length-1)
  const cycleIndex =
    ((totalTermIndex % cycleLength) + cycleLength) % cycleLength;
  // cycleCount = how many *full cycles* have passed
  const cycleCount = Math.floor(totalTermIndex / cycleLength);

  // The real display year is baseYear + cycleCount + offset for this term
  const year = baseYear + cycleCount + offsets[cycleIndex];
  const term = terms[cycleIndex];

  return `${term} ${year}`;
}
