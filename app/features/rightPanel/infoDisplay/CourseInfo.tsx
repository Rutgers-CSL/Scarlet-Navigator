import { useState, useEffect, useRef, useMemo } from 'react';
import { useScheduleStore } from '@/lib/hooks/stores/useScheduleStore';
import CoreInput from '@/app/components/CoreInput';
import { useSettingsStore } from '@/lib/hooks/stores/useSettingsStore';
import NotesEditor from '@/app/components/NotesEditor';
import CoreList from '@/app/components/CoreList';

interface CourseInfoProps {
  id: string;
}

export default function CourseInfo({ id }: CourseInfoProps) {
  const currentCourse = useScheduleStore((state) => state.courses[id]);
  const globalCores = useScheduleStore((state) => state.globalCores);
  const updateCourse = useScheduleStore((state) => state.updateCourse);
  const gradePoints = useSettingsStore((state) => state.gradePoints);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    credits: 0,
    cores: [] as string[],
    grade: null as string | null,
  });
  const [currentCore, setCurrentCore] = useState('');
  const prevCourseIdRef = useRef(id);

  // Safe destructuring with fallbacks using a single useMemo
  const courseData = useMemo(
    () => ({
      name: currentCourse?.name || '',
      credits: currentCourse?.credits || 0,
      cores: currentCourse?.cores || [],
      grade: currentCourse?.grade || null,
      courseID: currentCourse?.id || '',
    }),
    [currentCourse]
  );

  const { name, credits, cores, grade, courseID } = courseData;

  const handleEditToggle = () => {
    if (!isEditing) {
      setEditForm({
        name,
        credits,
        cores: cores || [],
        grade,
      });
    }
    setIsEditing((prevIsEditing) => !prevIsEditing);
  };

  useEffect(() => {
    // Only exit edit mode if the course ID has changed
    if (id !== prevCourseIdRef.current && isEditing) {
      setIsEditing(false);
    }
    prevCourseIdRef.current = id;
  }, [id, isEditing]);

  const handleSubmit = () => {
    updateCourse(courseID, {
      name: editForm.name,
      credits: editForm.credits,
      cores: editForm.cores,
      grade: editForm.grade,
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
    <div className='space-y-4 p-4'>
      <div>
        {isEditing ? (
          <input
            type='text'
            value={editForm.name}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            className='mb-3 w-40 rounded-sm border px-2 py-1 text-2xl font-bold'
            maxLength={10}
          />
        ) : (
          <h1 className='mb-3 text-2xl font-bold'>{name}</h1>
        )}
        <div className='space-y-2'>
          <p>
            <span className='font-medium'>Course ID:</span> {courseID}
          </p>
          <p>
            <span className='font-medium'>Credits:</span>{' '}
            {isEditing ? (
              <input
                type='number'
                value={editForm.credits}
                onChange={(e) =>
                  setEditForm({ ...editForm, credits: Number(e.target.value) })
                }
                className='w-20 rounded-sm border px-2 py-1'
                min={1}
                max={6}
              />
            ) : (
              credits
            )}
          </p>
          <p>
            <span className='font-medium'>Grade:</span>{' '}
            {isEditing ? (
              <select
                value={editForm.grade || ''}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    grade: e.target.value || null,
                  })
                }
                className='select select-bordered select-sm'
              >
                <option value=''>None</option>
                {Object.keys(gradePoints).map((grade) => (
                  <option key={grade} value={grade}>
                    {grade}
                  </option>
                ))}
              </select>
            ) : (
              grade || 'N/A'
            )}
          </p>
        </div>
      </div>

      <div className='flex'>
        <button
          onClick={isEditing ? handleSubmit : handleEditToggle}
          className='btn'
        >
          {isEditing ? 'Save Changes' : 'Edit Course'}
        </button>
      </div>

      <div>
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

      <div className='border-t pt-4'>
        <NotesEditor id={id} title='Course Notes' />
      </div>
    </div>
  );
}
