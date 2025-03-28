'use client';

import { useState } from 'react';
import { RequirementEvaluation } from '@/lib/utils/programValidation';
import useAuxiliaryStore from '@/lib/hooks/stores/useAuxiliaryStore';
import { useScheduleStore } from '@/lib/hooks/stores/useScheduleStore';
import { useShallow } from 'zustand/react/shallow';

// Constants moved from FulfillmentTracker
export const programDisplayNames: Record<string, string> = {
  computerScience: 'Computer Science BS',
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
  ],
  'Business School': ['businessAdmin'],
  'School of Communication': ['communications', 'itiBusiness', 'itiDesign'],
};

// Map of set refs to their required course counts
const setRequirements: Record<string, number> = {
  cs_electives: 7, // Based on the requirement in the example
};

// Helper to get the number of required courses for a set
const getRequiredCoursesCount = (setRef: string) => {
  return setRequirements[setRef] || 1; // Default to 1 if not specified
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
    <div className='flex items-center justify-between'>
      <div
        className='flex w-full cursor-pointer items-center'
        onClick={toggleExpansion}
      >
        <div>
          <h3 className='card-title text-lg'>
            {programDisplayNames[programName] || programName}
          </h3>
          {Object.entries(programCategories).map(
            ([category, programs]) =>
              programs.includes(programName) && (
                <span key={category} className='badge badge-sm badge-ghost'>
                  {category}
                </span>
              )
          )}
        </div>
        <svg
          className={`ml-2 h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
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
        className='progress progress-primary mr-2 w-full'
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
}

function CourseProgress({
  setRef,
  coursesUsed,
  satisfied,
}: CourseProgressProps) {
  if (setRef !== 'cs_electives') return null;

  const requiredCount = getRequiredCoursesCount(setRef);
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
}

function ContributingCourses({ courses, setRef }: ContributingCoursesProps) {
  const requiredCount = getRequiredCoursesCount(setRef);
  const coursesByID = useScheduleStore(
    useShallow((state) => {
      console.log('test');
      return state.courses;
    })
  );

  if (courses.length === 0) {
    return <div className='text-warning'>No courses contributing yet</div>;
  }

  const toolTip = coursesByID[courses[0]]?.name.slice(0, 12) || courses[0];

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
            data-tip={toolTip}
          >
            <div className='badge badge-neutral cursor-pointer text-sm font-normal'>
              {course}
            </div>
          </div>
        ))}
      </div>

      {setRef === 'cs_electives' && courses.length < requiredCount && (
        <div className='text-warning mt-2 font-medium'>
          Need {requiredCount - courses.length} more CS elective(s)
        </div>
      )}
    </div>
  );
}

// ===============================
// Set Item Component
// ===============================
interface SetItemProps {
  setResult: any;
  idx: number;
}

function SetItem({ setResult, idx }: SetItemProps) {
  return (
    <div key={idx} className='rounded border'>
      {/* Set header */}
      <div
        className={`flex items-center justify-between p-2 ${setResult.satisfied ? 'bg-success/10' : 'bg-warning/10'}`}
      >
        <span className='font-medium'>{setResult.ref}</span>
        <span className='font-medium'>
          {setResult.satisfied ? '✓ Satisfied' : '✗ Not Satisfied'}
        </span>
      </div>

      {/* Set details */}
      <div className='p-2'>
        <CourseProgress
          setRef={setResult.ref}
          coursesUsed={setResult.coursesUsed}
          satisfied={setResult.satisfied}
        />
        <ContributingCourses
          courses={setResult.coursesUsed}
          setRef={setResult.ref}
        />
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

  console.log(evaluation);

  return (
    <div className='bg-base-100 border-t p-3'>
      <UsedCoursesSummary courses={evaluation.distinctCoursesUsed} />

      <div className='space-y-3'>
        <div className='text-sm font-medium'>Set Details:</div>
        {evaluation.setResults.map((setResult, idx) => (
          <SetItem key={idx} setResult={setResult} idx={idx} />
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
  return (
    <div className='overflow-hidden rounded-lg border'>
      {/* Requirement header */}
      <div
        className={`flex cursor-pointer items-center justify-between p-3 ${
          evaluation.satisfied ? 'bg-success/10' : 'bg-warning/10'
        }`}
        onClick={() => onToggle(evaluation.requirementName)}
      >
        <div className='flex items-center'>
          <div
            className={`badge ${evaluation.satisfied ? 'badge-success' : 'badge-warning'} mr-2`}
          >
            {evaluation.satisfied ? '✓' : '!'}
          </div>
          <span className='font-semibold'>{evaluation.requirementName}</span>
        </div>
        <div className='flex items-center'>
          <span className='mr-2 text-sm font-medium'>
            {evaluation.setsFulfilled}/{getRequiredSetsCount(evaluation)} sets
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
  onToggleSelection,
}: ProgramCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedRequirements, setExpandedRequirements] = useState<Set<string>>(
    new Set()
  );

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
