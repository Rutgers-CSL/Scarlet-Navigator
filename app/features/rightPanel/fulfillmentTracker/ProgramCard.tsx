'use client';

import { useState, useEffect } from 'react';
import { RequirementEvaluation } from '@/lib/utils/programValidation';
import useAuxiliaryStore from '@/lib/hooks/stores/useAuxiliaryStore';
import { useScheduleStore } from '@/lib/hooks/stores/useScheduleStore';
import { useShallow } from 'zustand/react/shallow';
import { useProgramsStore } from '@/lib/hooks/stores/useProgramsStore';
import { CourseSet } from '@/lib/types/models';

// Extend the RequirementEvaluation interface to add distinct courses info
interface ExtendedRequirementEvaluation extends RequirementEvaluation {
  distinctReq?: number; // Only for backward compatibility
}

// Extend the SetEvaluationResult interface for additional properties
interface ExtendedSetResult {
  ref: string;
  name?: string;
  coursesUsed: string[];
  satisfied: boolean;
  requiredCount?: number; // To store the required number of courses
}

// Constants moved from FulfillmentTracker
export const programDisplayNames: Record<string, string> = {
  computerScience: 'Computer Science B.S.',
  sasCore: 'SAS Core',
  mathematics: 'Mathematics BA',
  physics: 'Physics BS',
  psychology: 'Psychology BA',
  biology: 'Biology BS',
  businessAdmin: 'Business Administration BBA',
  communications: 'Communications & Media Studies BA',
  itiBusiness: 'ITI - Business Concentration',
  itiDesign: 'ITI - Design Concentration',
  economics: 'Economics BA',
};

export const programCategories: Record<string, string[]> = {
  'School of Arts & Sciences': [
    'computerScience',
    'mathematics',
    'physics',
    'psychology',
    'biology',
    'economics',
    'sasCore',
  ],
  'Business School': ['businessAdmin'],
  'School of Communication': ['communications', 'itiBusiness', 'itiDesign'],
};

// Global cache for set requirements (populated dynamically)
const setRequirementsCache: Record<string, number> = {};

// Helper to get the number of required courses for a set
const getRequiredCoursesCount = (
  setRef: string,
  evaluations?: RequirementEvaluation[]
) => {
  // First check the cache
  if (setRequirementsCache[setRef]) {
    return setRequirementsCache[setRef];
  }

  // If evaluations are available, try to find the set directly from the evaluation results
  if (evaluations) {
    for (const evaluation of evaluations) {
      const setResult = evaluation.setResults.find((set) => set.ref === setRef);
      if (setResult && setResult.requiredCount !== undefined) {
        return setResult.requiredCount;
      }
    }
  }

  // Default to 1 if not found
  return 1;
};

// Dynamically load set requirements
const loadSetRequirements = async (programNames: string[]) => {
  try {
    for (const programName of programNames) {
      const response = await fetch(`/study-programs/${programName}.yaml`);
      if (!response.ok) continue;

      const text = await response.text();
      const { parse } = await import('yaml');
      const programData = parse(text);

      if (programData?.requirements) {
        programData.requirements.forEach((req: any) => {
          if (req.sets) {
            req.sets.forEach((set: any) => {
              if (set.ref && set.num_req !== undefined) {
                setRequirementsCache[set.ref] = set.num_req;
              }
            });
          }
        });
      }
    }
  } catch (error) {
    console.error('Error loading set requirements:', error);
  }
};

// Helper to calculate program progress percentage
const calculateProgramProgress = (evaluations: RequirementEvaluation[]) => {
  if (!evaluations || evaluations.length === 0) return 0;

  const satisfiedRequirements = evaluations.filter((e) => e.satisfied).length;
  return Math.round((satisfiedRequirements / evaluations.length) * 100);
};

// Helper to get the number of required sets for a requirement
const getRequiredSetsCount = (evaluation: RequirementEvaluation) => {
  return evaluation.setResults.length;
};

// ===============================
// Program Header Component
// ===============================
interface ProgramHeaderProps {
  programName: string;
  isExpanded: boolean;
  toggleExpansion: () => void;
}

function ProgramHeader({
  programName,
  isExpanded,
  toggleExpansion,
}: ProgramHeaderProps) {
  return (
    <div className='flex w-full items-center justify-between'>
      <div
        className='flex flex-grow cursor-pointer items-center'
        onClick={toggleExpansion}
      >
        <div>
          <h3 className='card-title text-lg'>
            {programDisplayNames[programName] || programName}
          </h3>
          {Object.entries(programCategories).map(
            ([category, programs]) =>
              programs.includes(programName) && (
                <span key={category}>{category}</span>
              )
          )}
        </div>
      </div>
      <svg
        className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
        fill='none'
        stroke='currentColor'
        viewBox='0 0 24 24'
        onClick={toggleExpansion}
      >
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth='2'
          d='M19 9l-7 7-7-7'
        ></path>
      </svg>
    </div>
  );
}

// ===============================
// Program Progress Component
// ===============================
interface ProgramProgressProps {
  evaluations: RequirementEvaluation[];
}

function ProgramProgress({ evaluations }: ProgramProgressProps) {
  const progressPercentage = calculateProgramProgress(evaluations);

  return (
    <div className='mb-4 flex items-center'>
      <progress
        className='progress progress-neutral mr-2 w-full'
        value={progressPercentage}
        max='100'
      ></progress>
      <span className='text-sm font-medium'>{progressPercentage}%</span>
    </div>
  );
}

// ===============================
// Course Badge Component
// ===============================
interface CourseBadgeProps {
  courseId: string;
  outline?: boolean;
}

function CourseBadge({ courseId, outline = false }: CourseBadgeProps) {
  return (
    <div className={`badge badge-sm ${outline ? 'badge-outline' : ''}`}>
      {courseId}
    </div>
  );
}

// ===============================
// Used Courses Summary Component
// ===============================
interface UsedCoursesSummaryProps {
  courses: string[] | any[];
}

function UsedCoursesSummary({ courses }: UsedCoursesSummaryProps) {
  if (courses.length === 0) return null;

  return (
    <div className='bg-base-200 mb-3 rounded p-2'>
      <div className='mb-1 font-medium'>
        All Courses Used ({courses.length}):
      </div>
      <div className='flex flex-wrap gap-1'>
        {courses.map((courseId) => (
          <CourseBadge
            key={courseId}
            courseId={String(courseId)}
            outline={true}
          />
        ))}
      </div>
    </div>
  );
}

// ===============================
// Course Progress Component
// ===============================
interface CourseProgressProps {
  setRef: string;
  coursesUsed: string[];
  satisfied: boolean;
  requiredCount: number;
}

function CourseProgress({
  setRef,
  coursesUsed,
  satisfied,
  requiredCount,
}: CourseProgressProps) {
  const currentCount = coursesUsed.length;

  return (
    <div className='mb-2'>
      <div className='mb-1 flex justify-between'>
        <span>Progress:</span>
        <span className='font-medium'>
          {currentCount} / {requiredCount} courses
        </span>
      </div>
      <progress
        className={`progress w-full ${satisfied ? 'progress-success' : 'progress-warning'}`}
        value={currentCount}
        max={requiredCount}
      ></progress>
    </div>
  );
}

// ===============================
// Contributing Courses Component
// ===============================
interface ContributingCoursesProps {
  courses: string[];
  setRef: string;
  requiredCount: number;
}

function ContributingCourses({
  courses,
  setRef,
  requiredCount,
}: ContributingCoursesProps) {
  const coursesByID = useScheduleStore(
    useShallow((state) => {
      return state.courses;
    })
  );

  if (courses.length === 0) {
    return <div className='text-base-content'>No courses contributing yet</div>;
  }

  return (
    <div>
      <div className='mt-1 mb-1 font-medium'>Contributing Courses:</div>
      <div className='flex flex-wrap gap-1'>
        {courses.map((course, i) => (
          <div
            key={i}
            onClick={() => {
              useAuxiliaryStore
                .getState()
                .setCurrentInfo(course, 'course', true);
            }}
            className='tooltip tooltip-top z-[1000]'
            data-tip={coursesByID[courses[i]]?.name.slice(0, 12) || 'N/A'}
          >
            <div className='badge badge-neutral cursor-pointer text-sm font-normal'>
              {course}
            </div>
          </div>
        ))}
      </div>

      {courses.length < requiredCount && (
        <div className='text-warning mt-2 font-medium'>
          Need {requiredCount - courses.length} more course
          {requiredCount - courses.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}

// ===============================
// Possible Courses Component
// ===============================
interface PossibleCoursesProps {
  setRef: string;
  coursesUsed: string[];
}

function PossibleCourses({ setRef, coursesUsed }: PossibleCoursesProps) {
  const [possibleCourses, setPossibleCourses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch possible courses for this set
  useEffect(() => {
    async function fetchCourseSets() {
      try {
        const res = await fetch('/courseSets.yaml');
        if (!res.ok) {
          console.error('Failed to fetch course sets');
          return;
        }

        const text = await res.text();
        const { parse } = await import('yaml');
        const courseSets = parse(text) as CourseSet;

        // Get courses for this set
        if (courseSets[setRef] && courseSets[setRef].courses) {
          setPossibleCourses(courseSets[setRef].courses || []);
        }
      } catch (error) {
        console.error('Error fetching course sets:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchCourseSets();
  }, [setRef]);

  if (loading) {
    return (
      <div className='mt-2 animate-pulse'>Loading possible courses...</div>
    );
  }

  if (!possibleCourses || possibleCourses.length === 0) {
    return null;
  }

  // Filter out courses that are already being used
  const remainingCourses = possibleCourses.filter(
    (course) => !coursesUsed.includes(course)
  );

  if (remainingCourses.length === 0) {
    return null;
  }

  return (
    <div className='mt-3'>
      <div className='mb-1 font-medium'>Possible Courses:</div>
      <div className='flex flex-wrap gap-1'>
        {remainingCourses.map((course, i) => (
          <div
            key={i}
            onClick={() => {
              useAuxiliaryStore.getState().setSearchQuery(course);
            }}
            className='tooltip tooltip-top z-[1000]'
            data-tip='Click to search'
          >
            <div className='badge cursor-pointer bg-gray-400 text-sm font-normal text-white'>
              {course}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===============================
// Set Item Component
// ===============================
interface SetItemProps {
  setResult: any;
  idx: number;
  evaluations?: RequirementEvaluation[];
}

function SetItem({ setResult, idx, evaluations }: SetItemProps) {
  const [showPossibleCourses, setShowPossibleCourses] = useState(false);
  const requiredCount = getRequiredCoursesCount(setResult.ref, evaluations);

  return (
    <div key={idx} className='rounded border'>
      {/* Set header */}
      <div
        className={`flex items-center justify-between p-2 ${setResult.satisfied ? 'bg-success/10' : 'bg-warning/10'}`}
      >
        <div>
          <span className='font-medium'>{setResult.name || setResult.ref}</span>
          <button
            className='btn btn-xs btn-ghost mx-2 pb-0.5'
            onClick={() => setShowPossibleCourses(!showPossibleCourses)}
          >
            {showPossibleCourses ? 'Hide Options' : 'Show Options'}
          </button>
        </div>
        <div className='flex flex-col items-end'>
          <span className='text-sm font-medium'>
            {setResult.satisfied ? '✓ Satisfied' : '✗ Not Satisfied'}
          </span>
          <span className='text-base-content/70 text-xs'>
            Need {requiredCount} course{requiredCount !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Set details */}
      <div className='p-2'>
        <CourseProgress
          setRef={setResult.ref}
          coursesUsed={setResult.coursesUsed}
          satisfied={setResult.satisfied}
          requiredCount={requiredCount}
        />
        <ContributingCourses
          courses={setResult.coursesUsed}
          setRef={setResult.ref}
          requiredCount={requiredCount}
        />
        {showPossibleCourses && (
          <PossibleCourses
            setRef={setResult.ref}
            coursesUsed={setResult.coursesUsed}
          />
        )}
      </div>
    </div>
  );
}

// ===============================
// Requirement Details Component
// ===============================
interface RequirementDetailsProps {
  evaluation: RequirementEvaluation;
  isExpanded: boolean;
}

function RequirementDetails({
  evaluation,
  isExpanded,
}: RequirementDetailsProps) {
  if (!isExpanded) return null;

  return (
    <div className='bg-base-100 border-t p-3'>
      <UsedCoursesSummary courses={evaluation.distinctCoursesUsed} />

      <div className='space-y-3'>
        <div className='text-sm font-medium'>Set Details:</div>
        {evaluation.setResults.map((setResult, idx) => (
          <SetItem
            key={idx}
            setResult={setResult}
            idx={idx}
            evaluations={[evaluation]}
          />
        ))}
      </div>
    </div>
  );
}

// ===============================
// Requirement Item Component
// ===============================
interface RequirementItemProps {
  evaluation: RequirementEvaluation;
  isExpanded: boolean;
  onToggle: (name: string) => void;
}

function RequirementItem({
  evaluation,
  isExpanded,
  onToggle,
}: RequirementItemProps) {
  // Use the distinctCoursesRequired directly from the evaluation
  const distinctCoursesCount = evaluation.distinctCoursesUsed?.length || 0;
  const hasDistinctRequirement =
    evaluation.distinctCoursesRequired !== undefined &&
    evaluation.distinctCoursesRequired > 0;

  return (
    <div className='overflow-hidden rounded-lg border'>
      {/* Requirement header */}
      <div
        className={`flex cursor-pointer items-center justify-between p-3 ${
          evaluation.satisfied ? 'bg-success/10' : 'bg-warning/10'
        }`}
        onClick={() => onToggle(evaluation.requirementName)}
      >
        <div className='flex max-w-1/2 items-center'>
          <span className='font-semibold'>{evaluation.requirementName}</span>
        </div>
        <div className='flex items-center'>
          <span className='mr-2 text-sm font-medium'>
            {evaluation.setsFulfilled}/{getRequiredSetsCount(evaluation)} sets
            {hasDistinctRequirement && (
              <span className='text-base-content/70 ml-1 text-xs'>
                ({distinctCoursesCount}/{evaluation.distinctCoursesRequired}{' '}
                distinct)
              </span>
            )}
          </span>
          <svg
            className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              d='M19 9l-7 7-7-7'
            ></path>
          </svg>
        </div>
      </div>

      <RequirementDetails evaluation={evaluation} isExpanded={isExpanded} />
    </div>
  );
}

// ===============================
// Program Content Component
// ===============================
interface ProgramContentProps {
  programName: string;
  programEvaluations: Record<string, RequirementEvaluation[]>;
  expandedRequirements: Set<string>;
  toggleRequirement: (name: string) => void;
}

function ProgramContent({
  programName,
  programEvaluations,
  expandedRequirements,
  toggleRequirement,
}: ProgramContentProps) {
  const evaluations = programEvaluations[programName];

  // Since we now have distinctCoursesRequired directly in the RequirementEvaluation,
  // we don't need to enhance them separately

  if (!evaluations) {
    return (
      <div className='alert alert-info mt-2'>
        <span>Evaluating program requirements...</span>
      </div>
    );
  }

  return (
    <div className='mt-2'>
      <ProgramProgress evaluations={evaluations} />

      <div className='space-y-4'>
        {evaluations.map((evaluation) => (
          <RequirementItem
            key={evaluation.requirementName}
            evaluation={evaluation}
            isExpanded={expandedRequirements.has(evaluation.requirementName)}
            onToggle={toggleRequirement}
          />
        ))}
      </div>

      <div className='text-base-content/70 mt-3 text-xs'>
        Note: This evaluation is based on your current schedule. Please consult
        with an academic advisor for official degree verification.
      </div>
    </div>
  );
}

// ===============================
// Main ProgramCard Component
// ===============================
interface ProgramCardProps {
  programName: string;
  isSelected: boolean;
  programEvaluations: Record<string, RequirementEvaluation[]>;
  onToggleSelection: (programName: string) => void;
}

export default function ProgramCard({
  programName,
  isSelected,
  programEvaluations,
}: ProgramCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedRequirements, setExpandedRequirements] = useState<Set<string>>(
    new Set()
  );
  const { selectedPrograms } = useProgramsStore();

  // Load set requirements when the component mounts
  useEffect(() => {
    loadSetRequirements(selectedPrograms);
  }, [selectedPrograms]);

  const toggleRequirement = (requirementName: string) => {
    setExpandedRequirements((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(requirementName)) {
        newSet.delete(requirementName);
      } else {
        newSet.add(requirementName);
      }
      return newSet;
    });
  };

  const toggleExpansion = () => setIsExpanded(!isExpanded);

  return (
    <div className='card bg-base-200 shadow-md'>
      <div className='card-body p-4'>
        <ProgramHeader
          programName={programName}
          isExpanded={isExpanded}
          toggleExpansion={toggleExpansion}
        />

        {isSelected && (
          <div className={`mt-2 ${isExpanded ? 'block' : 'hidden'}`}>
            <ProgramContent
              programName={programName}
              programEvaluations={programEvaluations}
              expandedRequirements={expandedRequirements}
              toggleRequirement={toggleRequirement}
            />
          </div>
        )}
      </div>
    </div>
  );
}
