import { useScheduleStore } from '@/lib/hooks/stores/useScheduleStore';
import { useState, useRef } from 'react';
import NotesEditor from '@/app/components/NotesEditor';
import useAuxiliaryStore from '@/lib/hooks/stores/useAuxiliaryStore';
import {
  calculateSemesterCredits,
  calculateRunningCredits,
} from '@/app/features/middlePanel/dashboard/utils/credits';
import {
  calculateSemesterGPA,
  calculateCumulativeGPA,
} from '@/app/features/middlePanel/dashboard/utils/gpa';
import CoreList from '@/app/components/CoreList';
import { useSettingsStore } from '@/lib/hooks/stores/useSettingsStore';
import { CourseID } from '@/lib/types/models';

interface SemesterInfoProps {
  id: string;
}

export default function SemesterInfo({ id }: SemesterInfoProps) {
  /**
   * TODO:
   * Some of these variables need to be renamed as they confuse me...
   *
   * What is semesterOrder again? I feel like it should be
   * orderedArrayOfSemesters or orderArrayOfSemesterIDs
   */
  const coursesBySemesterID = useScheduleStore(
    (state) => state.coursesBySemesterID
  );
  const globalCoursesMap = useScheduleStore((state) => state.courses);

  const currentSemester = useScheduleStore((state) => state.semesterByID[id]);
  const updateSemester = useScheduleStore((state) => state.updateSemester);
  const removeSemester = useScheduleStore((state) => state.removeSemester);
  const setCurrentInfo = useAuxiliaryStore((state) => state.setCurrentInfo);

  const semesterOrder = useScheduleStore((state) => state.semesterOrder);
  const gradePoints = useSettingsStore((state) => state.gradePoints);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
  });
  const modalRef = useRef<HTMLDialogElement>(null);

  if (!currentSemester) {
    return <div className='p-4 text-gray-500'>Loading semester... {id}</div>;
  }

  /**
   * TODO: THIS NEEDS TO BE REFACTORED
   *
   * When coursesIdsOfCurrentSemester gets rewritten properly to
   * coursesOfCurrentSemester = semester.courses,
   *
   * it will show something erroneous. That is because semester.courses
   * IS NEVER UPDATED when we update the board. The only thing updated
   * is the coursesBySemesterID.
   *
   * This is why data shouldn't be duplicated so much.
   */
  const courseIDsOfCurrentSemester = coursesBySemesterID[id];
  const { title } = currentSemester;
  const semesterCredits = calculateSemesterCredits(
    courseIDsOfCurrentSemester,
    globalCoursesMap
  );

  const totalCredits = calculateRunningCredits(
    semesterOrder,
    // TODO: this is gross. rewrite this in a refactor.
    { [id]: courseIDsOfCurrentSemester },
    globalCoursesMap,
    id
  );

  const semesterGPA = calculateSemesterGPA(
    courseIDsOfCurrentSemester,
    globalCoursesMap,
    gradePoints
  );

  // Get all course IDs up to and including current semester
  const currentSemesterIndex = semesterOrder.indexOf(id);
  const coursesUpToCurrent = semesterOrder
    .slice(0, currentSemesterIndex + 1)
    .flatMap((semId) => coursesBySemesterID[semId]);

  // Check if any course up to current semester has N/A grade
  const hasUngradedCumulative = coursesUpToCurrent.some(
    (courseId: CourseID) => globalCoursesMap[courseId]?.grade === null
  );

  const cumulativeGPA = calculateCumulativeGPA(
    coursesUpToCurrent,
    globalCoursesMap,
    gradePoints
  );

  // Check if any course in the semester has N/A grade
  const hasUngraded = courseIDsOfCurrentSemester.some(
    (courseId: CourseID) => globalCoursesMap[courseId]?.grade === null
  );

  // Get all cores fulfilled in this semester
  const semesterCores = new Set<string>();
  courseIDsOfCurrentSemester.forEach((courseId: CourseID) => {
    const course = globalCoursesMap[courseId];
    if (course?.cores) {
      course.cores.forEach((core) => semesterCores.add(core));
    }
  });

  const handleEditToggle = () => {
    if (!isEditing) {
      setEditForm({
        title: title || '',
      });
    }
    setIsEditing(!isEditing);
  };

  const handleSubmit = () => {
    updateSemester(id, {
      title: editForm.title,
    });
    setIsEditing(false);
  };

  const handleRemove = () => {
    removeSemester(id);
    setCurrentInfo('', 'course');
  };

  return (
    <div className='space-y-4 p-4'>
      <dialog ref={modalRef} className='modal' id='delete_semester_modal'>
        <div className='modal-box'>
          <h3 className='text-lg font-bold'>Remove Semester</h3>
          <p className='py-4'>
            Are you sure you want to remove this semester? All courses in this
            semester will also be deleted.
          </p>
          <div className='modal-action'>
            <form method='dialog'>
              <button className='btn btn-ghost mr-2'>Cancel</button>
              <button className='btn btn-error' onClick={handleRemove}>
                Remove
              </button>
            </form>
          </div>
        </div>
        <form method='dialog' className='modal-backdrop'>
          <button>close</button>
        </form>
      </dialog>

      <div>
        {isEditing ? (
          <input
            type='text'
            value={editForm.title}
            onChange={(e) =>
              setEditForm({ ...editForm, title: e.target.value })
            }
            className='mb-3 w-40 rounded-sm border px-2 py-1 text-2xl font-bold'
            maxLength={20}
            placeholder='Enter semester title'
          />
        ) : (
          <h1 className='mb-3 text-2xl font-bold'>
            {title || 'Untitled Semester'}
          </h1>
        )}
      </div>

      <div className='space-y-2'>
        <div>
          <span className='font-medium'>Semester Credits:</span>{' '}
          {semesterCredits}
        </div>
        <div>
          <span className='font-medium'>Total Credits:</span> {totalCredits}
        </div>
        <div>
          <span className='font-medium'>Semester GPA:</span>{' '}
          {hasUngraded ? (
            <strong>missing grades</strong>
          ) : (
            semesterGPA.toFixed(2)
          )}
        </div>
        <div>
          <span className='font-medium'>Cumulative GPA:</span>{' '}
          {hasUngradedCumulative ? (
            <strong>N/A</strong>
          ) : (
            cumulativeGPA.toFixed(2)
          )}
        </div>
        {semesterCores.size > 0 && (
          <div>
            <span className='mb-1 block font-medium'>Cores Fulfilled:</span>
            <CoreList cores={Array.from(semesterCores)} />
          </div>
        )}
      </div>

      {/* <div className='flex justify-center gap-2'>
        <button
          onClick={isEditing ? handleSubmit : handleEditToggle}
          className='max-w-[200px] rounded-lg bg-gray-200 px-4 py-2 transition-colors hover:bg-gray-300'
        >
          {isEditing ? 'Save Changes' : 'Edit Semester'}
        </button>
        <button
          className='btn btn-outline btn-error'
          onClick={() => modalRef.current?.showModal()}
        >
          Remove Semester
        </button>
      </div> */}
      <NotesEditor id={id} showDisplayOption={true} />
    </div>
  );
}
