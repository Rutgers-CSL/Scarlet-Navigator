import { useScheduleStore } from '@/lib/hooks/stores/useScheduleStore';
import { useState, useRef } from 'react';
import NotesArea from './components/NotesArea';
import useAuxiliaryStore from '@/lib/hooks/stores/useAuxiliaryStore';
import {
  calculateSemesterCredits,
  calculateRunningCredits,
} from '@/app/features/middlePanel/dashboard/utils/credits';
import CoreList from '@/app/components/CoreList';

interface SemesterInfoProps {
  id: string;
}

export default function SemesterInfo({ id }: SemesterInfoProps) {
  const currentSemester = useScheduleStore((state) => state.semesterByID[id]);
  const updateSemester = useScheduleStore((state) => state.updateSemester);
  const removeSemester = useScheduleStore((state) => state.removeSemester);
  const setCurrentInfo = useAuxiliaryStore((state) => state.setCurrentInfo);
  const courses = useScheduleStore((state) => state.courses);
  const coursesBySemesterID = useScheduleStore(
    (state) => state.coursesBySemesterID
  );
  const semesterOrder = useScheduleStore((state) => state.semesterOrder);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
  });
  const modalRef = useRef<HTMLDialogElement>(null);

  if (!currentSemester) {
    return <div className='p-4 text-gray-500'>Loading semester... {id}</div>;
  }

  const { title } = currentSemester;
  const semesterCredits = calculateSemesterCredits(
    coursesBySemesterID[id] || [],
    courses
  );
  const totalCredits = calculateRunningCredits(
    semesterOrder,
    coursesBySemesterID,
    courses,
    id
  );

  // Get all cores fulfilled in this semester
  const semesterCores = new Set<string>();
  (coursesBySemesterID[id] || []).forEach((courseId) => {
    const course = courses[courseId];
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
            className='mb-3 w-40 rounded border px-2 py-1 text-2xl font-bold'
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
        {semesterCores.size > 0 && (
          <div>
            <span className='mb-1 block font-medium'>Cores Fulfilled:</span>
            <CoreList color='blue' cores={Array.from(semesterCores)} />
          </div>
        )}
      </div>

      <div className='flex justify-center gap-2'>
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
      </div>
      <NotesArea id={id} />
    </div>
  );
}
