import { useScheduleStore } from '@/lib/hooks/stores/useScheduleStore';
import { useState } from 'react';
import CoreInput from '@/app/components/CoreInput';

export const COURSE_POOL_CONTAINER_ID = 'COURSE_POOL_CONTAINER_ID';
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

    if (credits < 0 || credits > 12) {
      setError('Credits must be between 1 and 12');
      return;
    }

    addCourse(courseName, credits, selectedCores);
    setCourseName('');
    setCredits(3);
    setSelectedCores([]);
    setError('');
  };

  return (
    <div className='bg-base-100 border-base-300 text-base-content rounded-box h-fit p-4'>
      <h1 className='mb-4 text-xl font-bold'>Course Creation</h1>
      <form onSubmit={handleSubmit} className='mb-6 space-y-4'>
        <div>
          <label className='input input-bordered flex items-center gap-2'>
            Course Name:
            <input
              type='text'
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              // className='mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-xs focus:border-indigo-500 focus:ring-indigo-500 focus:outline-hidden'
              className='grow'
              placeholder='Enter course name'
            />
          </label>
        </div>

        <div>
          <label className='input input-bordered flex items-center gap-2'>
            Credits:
            <input
              type='number'
              value={credits}
              onChange={(e) => setCredits(Number(e.target.value))}
              min={0}
              max={12}
              className='grow'
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
          className='w-full rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-hidden'
        >
          Create Course
        </button>
      </form>
    </div>
  );
}
