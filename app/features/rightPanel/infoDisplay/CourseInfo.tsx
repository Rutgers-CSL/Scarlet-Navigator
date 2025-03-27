import { useState, useEffect, useRef, useMemo } from 'react';
import { useScheduleStore } from '@/lib/hooks/stores/useScheduleStore';
import CoreInput from '@/app/components/CoreInput';
import { useSettingsStore } from '@/lib/hooks/stores/useSettingsStore';
import NotesEditor from '@/app/components/NotesEditor';
import CoreList from '@/app/components/CoreList';
import { parsePreReqNotes } from '@/lib/utils/prereqValidation';
import { SEARCH_ITEM_DELIMITER } from '@/lib/constants';
import useAuxiliaryStore from '@/lib/hooks/stores/useAuxiliaryStore';

interface CourseInfoProps {
  id: string;
}

export default function CourseInfo({ id }: CourseInfoProps) {
  const currentCourse = useScheduleStore((state) => state.courses[id]);
  const globalCores = useScheduleStore((state) => state.globalCores);
  const updateCourse = useScheduleStore((state) => state.updateCourse);
  const validateCourseEdit = useScheduleStore(
    (state) => state.validateCourseEdit
  );
  const gradePoints = useSettingsStore((state) => state.gradePoints);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    credits: 0,
    cores: [] as string[],
    grade: null as string | null,
    id: '',
    overridePrereqValidation: false,
  });
  const [currentCore, setCurrentCore] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const prevCourseIdRef = useRef(id);

  const isSearchItem = useMemo(() => id.endsWith(SEARCH_ITEM_DELIMITER), [id]);
  const displayId = useMemo(() => id.replace(SEARCH_ITEM_DELIMITER, ''), [id]);

  const courseData = useMemo(
    () => ({
      name: currentCourse?.name || '',
      credits: currentCourse?.credits || 0,
      cores: currentCourse?.cores || [],
      grade: currentCourse?.grade || null,
      courseID: currentCourse?.id || '',
      prereqNotes: currentCourse?.prereqNotes || '',
      overridePrereqValidation:
        currentCourse?.overridePrereqValidation || false,
    }),
    [currentCourse]
  );

  const {
    name,
    credits,
    cores,
    grade,
    courseID,
    prereqNotes,
    overridePrereqValidation,
  } = courseData;

  const parsedPrereqs = useMemo(() => {
    if (!prereqNotes) return [];
    const visited = new Set<string>();
    return parsePreReqNotes(prereqNotes, visited);
  }, [prereqNotes]);

  const handleEditToggle = () => {
    if (!isEditing) {
      setEditForm({
        name,
        credits,
        cores: cores || [],
        grade,
        id: displayId,
        overridePrereqValidation: overridePrereqValidation || false,
      });
      setValidationErrors([]);
    }
    setIsEditing((prevIsEditing) => !prevIsEditing);
  };

  useEffect(() => {
    if (id !== prevCourseIdRef.current && isEditing) {
      setIsEditing(false);
    }
    prevCourseIdRef.current = id;

    setValidationErrors([]);
  }, [id, isEditing]);

  const handleSubmit = () => {
    // Use validateCourseEdit from the store for comprehensive validation
    const validation = validateCourseEdit(currentCourse, {
      ...editForm,
      // Make sure cores is an array
      cores: editForm.cores || [],
    });

    if (!validation.success) {
      // Display validation errors
      setValidationErrors(validation.errors);
      return;
    }

    // Clear any existing validation errors
    setValidationErrors([]);

    // Proceed with the update if validation is successful
    updateCourse(courseID, {
      name: editForm.name,
      credits: editForm.credits,
      cores: editForm.cores,
      grade: editForm.grade,
      overridePrereqValidation: editForm.overridePrereqValidation,
    });
    setIsEditing(false);
  };

  if (!currentCourse) {
    return (
      <div className='p-4 text-gray-500'>
        Please select a course to view its details
      </div>
    );
  }

  return (
    <div className='space-y-4 p-8'>
      <div>
        {/* Course Name */}
        <div className='relative mb-3'>
          <h1 className={`text-2xl font-bold ${isEditing ? 'opacity-0' : ''}`}>
            {name}
          </h1>
          {isEditing && (
            <input
              type='text'
              value={editForm.name}
              onChange={(e) =>
                setEditForm({ ...editForm, name: e.target.value })
              }
              className='absolute inset-0 top-0 w-full rounded-sm border px-2 py-0 text-2xl font-bold'
              maxLength={10}
              style={{ left: '-9px', height: 'calc(100% + 2px)' }}
            />
          )}
        </div>

        {/* Course Details */}
        <div className='space-y-4'>
          <div className='relative flex h-8 items-center'>
            <span className='inline-block w-24 font-medium'>Course #:</span>
            <span>{displayId}</span>
          </div>

          <div className='relative flex h-8 items-center'>
            <span className='inline-block w-24 font-medium'>Level:</span>
            <span>{currentCourse?.level || 'N/A'}</span>
          </div>

          <div className='relative flex h-8 items-center'>
            <span className='inline-block w-24 font-medium'>School:</span>
            <span>{currentCourse?.school || 'N/A'}</span>
          </div>

          <div className='relative flex h-8 items-center'>
            <span className='inline-block w-24 font-medium'>Campus:</span>
            <span>{currentCourse?.mainCampus || 'N/A'}</span>
          </div>

          <div className='relative flex h-8 items-center'>
            <span className='inline-block w-24 font-medium'>Last Offered:</span>
            <span>{currentCourse?.lastOffered || 'N/A'}</span>
          </div>

          <div className='relative flex h-8 items-center'>
            <span className='inline-block w-24 font-medium'>Credits:</span>
            <span className={isEditing ? 'opacity-0' : ''}>{credits}</span>
            {isEditing && !isSearchItem && (
              <input
                type='number'
                value={editForm.credits}
                onChange={(e) =>
                  setEditForm({ ...editForm, credits: Number(e.target.value) })
                }
                className='absolute top-0 left-22 w-16 rounded-sm border px-2 py-1'
                min={1}
                max={6}
              />
            )}
          </div>

          <div className='relative flex h-8 items-center'>
            <span className='inline-block w-24 font-medium'>Grade:</span>
            <span className={isEditing ? 'opacity-0' : ''}>
              {grade || 'None'}
            </span>
            {isEditing && !isSearchItem && (
              <select
                value={editForm.grade || ''}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    grade: e.target.value || null,
                  })
                }
                className='select select-bordered select-sm absolute top-0 left-24 w-24'
              >
                <option value=''>None</option>
                {Object.keys(gradePoints).map((grade) => (
                  <option key={grade} value={grade}>
                    {grade}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Validation Errors Display */}
          {validationErrors.length > 0 && (
            <div className='bg-error/10 text-error mt-2 rounded-md p-3'>
              <p className='font-medium'>Please fix the following errors:</p>
              <ul className='mt-1 ml-4 list-disc'>
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}
          {!isSearchItem && (
            <div className='h-10'>
              {isEditing && !isSearchItem ? (
                <button
                  onClick={handleSubmit}
                  className='btn'
                  disabled={!!(validationErrors.length > 0)}
                >
                  Save Changes
                </button>
              ) : !isSearchItem ? (
                <button onClick={handleEditToggle} className='btn'>
                  Edit Course
                </button>
              ) : null}
            </div>
          )}
        </div>
      </div>

      {/* Cores Section */}
      <div className='mt-6'>
        <h3 className='mb-2 text-sm font-medium'>Cores:</h3>
        {isEditing ? (
          <CoreInput
            currentCore={currentCore}
            setCurrentCore={setCurrentCore}
            selectedCores={editForm.cores}
            setSelectedCores={(cores) => setEditForm({ ...editForm, cores })}
            globalCores={globalCores}
            label=''
          />
        ) : (
          <CoreList cores={cores} />
        )}
      </div>

      {/* Prerequisites Section */}

      <div className='mt-6 border-t'>
        <div className='my-2 flex items-center justify-between'>
          <span className='text-lg font-bold'>Prerequisites</span>
          {!isSearchItem && (
            <div className='flex items-center gap-2'>
              <div
                className='tooltip tooltip-left'
                data-tip={
                  overridePrereqValidation
                    ? 'Disable prerequisite override?'
                    : 'Enable prerequisite override?'
                }
              >
                <button
                  className={`btn btn-xs ${overridePrereqValidation ? 'btn-success' : 'btn-outline'} transition-all`}
                  onClick={() => {
                    if (!isEditing) {
                      updateCourse(courseID, {
                        overridePrereqValidation: !overridePrereqValidation,
                      });
                    }
                  }}
                  disabled={isEditing}
                >
                  {overridePrereqValidation
                    ? 'Prerequisites Overridden'
                    : 'Override Prerequisites'}
                </button>
              </div>
            </div>
          )}
        </div>
        <p className='text-base-content mb-2 text-xs'>
          The following are possible ways to satisfy this course&apos;s
          prerequisites:
        </p>
        {/* Handle the special GreaterThan prerequisite case */}
        {parsedPrereqs &&
        !Array.isArray(parsedPrereqs) &&
        parsedPrereqs.type === 'greater_than' ? (
          <div className='space-y-1'>
            <div className='bg-base-200 rounded-md p-2'>
              <div
                className={`text-sm ${overridePrereqValidation ? 'line-through' : ''}`}
              >
                Any course equal to or greater than{' '}
                <button
                  className={`text-primary cursor-pointer font-semibold ${overridePrereqValidation ? 'line-through' : 'hover:underline'}`}
                  onClick={() =>
                    useAuxiliaryStore
                      .getState()
                      .setSearchQuery(parsedPrereqs.courseId)
                  }
                >
                  {parsedPrereqs.courseId}
                </button>
              </div>
            </div>
          </div>
        ) : Array.isArray(parsedPrereqs) && parsedPrereqs.length > 0 ? (
          <div className='space-y-1'>
            {parsedPrereqs.map((prereq: string, index: number) => (
              <div key={index} className='space-y-1'>
                {index > 0 && (
                  <div className='flex flex-col'>
                    <div className='divider'>OR</div>
                  </div>
                )}
                <div className='bg-base-200 rounded-md p-2'>
                  <div
                    className={`text-sm ${overridePrereqValidation ? 'line-through' : ''}`}
                  >
                    {formatPrereq(prereq, overridePrereqValidation)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className='text-base-content text-sm'>
            No prerequisites listed.
          </div>
        )}
      </div>

      {/* Notes Section */}
      <div className='mt-4 border-t pt-4'>
        <NotesEditor id={id} title='Course Notes' />
      </div>
    </div>
  );
}

// Helper function to format prerequisite strings
function formatPrereq(
  prereq: string,
  prereqOverride: boolean
): React.ReactNode {
  if (!prereq) return null;

  const setSearchQuery = useAuxiliaryStore.getState().setSearchQuery;

  // Function to handle course ID click
  const handleCourseClick = (courseId: string) => {
    setSearchQuery(courseId);
  };

  // Replace 'and' and 'or' with styled versions
  const parts = prereq.split(/(\(|\))/g).filter(Boolean);

  return parts.map((part, i) => {
    if (part === '(')
      return (
        <span key={i} className='text-base-content'>
          (
        </span>
      );
    if (part === ')')
      return (
        <span key={i} className='text-base-content'>
          )
        </span>
      );

    // Parse text to identify course IDs (assuming format like "01:123:456")
    // This regex matches patterns like "01:123:456" or "01:123:456L"
    const courseIdRegex = /\d{2}:\d{3}:\d{3}[A-Z]?/g;
    let lastIndex = 0;
    const fragments = [];
    let match;

    // Clone the part string to avoid modifying the original
    let textPart = part;

    // First replace and/or keywords
    textPart = textPart
      .replace(/\band\b/g, ' <span class="font-semibold">AND</span> ')
      .replace(/\bor\b/g, ' <span class="font-semibold">OR</span> ');

    // Then find and process course IDs
    while ((match = courseIdRegex.exec(part)) !== null) {
      const courseId = match[0];
      const index = match.index;

      // Add text before the match
      if (index > lastIndex) {
        fragments.push(
          <span
            key={`${i}-${lastIndex}`}
            dangerouslySetInnerHTML={{
              __html: textPart.substring(lastIndex, index),
            }}
          />
        );
      }

      // Add the clickable course ID
      fragments.push(
        <button
          key={`${i}-${index}`}
          className={`text-primary cursor-pointer font-semibold ${prereqOverride ? 'line-through' : 'hover:underline'}`}
          onClick={() => handleCourseClick(courseId)}
        >
          {courseId}
        </button>
      );

      lastIndex = index + courseId.length;
    }

    // Add any remaining text
    if (lastIndex < textPart.length) {
      fragments.push(
        <span
          key={`${i}-${lastIndex}`}
          dangerouslySetInnerHTML={{
            __html: textPart.substring(lastIndex),
          }}
        />
      );
    }

    return fragments.length > 0 ? (
      <span key={i}>{fragments}</span>
    ) : (
      <span key={i} dangerouslySetInnerHTML={{ __html: textPart }} />
    );
  });
}
