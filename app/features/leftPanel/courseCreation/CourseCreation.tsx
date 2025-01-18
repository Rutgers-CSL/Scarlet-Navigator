import { useScheduleStore } from '@/lib/hooks/stores/useScheduleStore';
import { useState } from 'react';
import CoreInput from '@/app/components/CoreInput';

export const COURSE_CREATION_CONTAINER_ID = 'COURSE_CREATION_CONTAINER_ID';
export const COURSE_CREATION_COURSE_ID = '!_new_c_!';

export default function CourseCreation() {
  const [courseName, setCourseName] = useState('');
  const [credits, setCredits] = useState<number>(3);
  const [error, setError] = useState<string>('');
  const [currentCore, setCurrentCore] = useState('');
  const [selectedCores, setSelectedCores] = useState<string[]>([]);

  const addCourse = useScheduleStore((state) => state.addCourse);
  const globalCores = useScheduleStore((state) => state.globalCores);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!courseName.trim()) {
      setError('Course name is required');
      return;
    }

    if (credits < 1 || credits > 6) {
      setError('Credits must be between 1 and 6');
      return;
    }

    addCourse(courseName, credits, selectedCores);
    setCourseName('');
    setCredits(3);
    setSelectedCores([]);
    setError('');
  };

  return (
    <div className='p-4'>
      <h1 className='mb-4 text-xl font-bold'>Course Creation</h1>
      <form onSubmit={handleSubmit} className='mb-6 space-y-4'>
        <div>
          <label className='mb-1 block text-sm font-medium'>
            Course Name:
            <input
              type='text'
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              className='mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500'
              placeholder='Enter course name'
            />
          </label>
        </div>

        <div>
          <label className='mb-1 block text-sm font-medium'>
            Credits:
            <input
              type='number'
              value={credits}
              onChange={(e) => setCredits(Number(e.target.value))}
              min={1}
              max={6}
              className='mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500'
            />
          </label>
        </div>

        <CoreInput
          currentCore={currentCore}
          setCurrentCore={setCurrentCore}
          selectedCores={selectedCores}
          setSelectedCores={setSelectedCores}
          globalCores={globalCores}
        />

        {error && <div className='text-sm text-red-500'>{error}</div>}

        <button
          type='submit'
          className='w-full rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
        >
          Create Course
        </button>
      </form>
    </div>
  );
}
