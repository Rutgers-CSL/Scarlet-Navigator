import { useScheduleStore } from '@/lib/hooks/stores/useScheduleStore';
import { useState } from 'react';
import CoreInput from '@/app/components/CoreInput';
import CoursePool from './CoursePool';
import {
  LEFT_PANEL_SECONDARY_MIN_HEIGHT,
  LEFT_PANEL_SECONDARY_KEY,
  LEFT_PANEL_SECONDARY_DEFAULT_HEIGHT,
} from '@/lib/constants';
import { useDraggable } from '@/lib/hooks/useDraggable';

export const COURSE_POOL_CONTAINER_ID = 'COURSE_POOL_CONTAINER_ID';
export const COURSE_CREATION_COURSE_ID = '!_new_c_!';

export default function CourseCreation() {
  const { DragHandle, dimensionValue: panelHeight } = useDraggable({
    dimensionValueModifier: (delta: number) => {
      const desiredHeight = Math.min(
        window.innerHeight - LEFT_PANEL_SECONDARY_MIN_HEIGHT,
        panelHeight + delta
      );

      return Math.max(LEFT_PANEL_SECONDARY_MIN_HEIGHT, desiredHeight);
    },
    direction: 'vertical',
    key: LEFT_PANEL_SECONDARY_KEY,
    defaultValue: LEFT_PANEL_SECONDARY_DEFAULT_HEIGHT,
  });

  const upperPanelStyle = {
    height: panelHeight,
  };

  const [courseName, setCourseName] = useState('');
  const [credits, setCredits] = useState<number>(3);
  const [currentCore, setCurrentCore] = useState('');
  const [selectedCores, setSelectedCores] = useState<string[]>([]);

  const addCourse = useScheduleStore((state) => state.addCourse);
  const globalCores = useScheduleStore((state) => state.globalCores);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addCourse(courseName, credits, selectedCores);
    setCourseName('');
    setCredits(3);
    setSelectedCores([]);
  };

  return (
    <div className='card bg-base-100 text-base-content rounded-box'>
      <div className='card-body' style={{ height: panelHeight }}>
        <h2 className='card-title'>Create Course</h2>
        <form onSubmit={handleSubmit} className='mb-6 space-y-4'>
          <div>
            <label className='input input-bordered flex items-center gap-2'>
              Course Name:
              <input
                type='text'
                value={courseName}
                onChange={(e) => setCourseName(e.target.value.toUpperCase())}
                className='validator grow'
                placeholder='Enter course name'
                required
              />
            </label>
          </div>

          <div>
            <label className='input input-bordered flex items-center gap-2'>
              Credits:
              <input
                type='number'
                required
                value={credits}
                onChange={(e) => setCredits(Number(e.target.value))}
                min={0}
                max={12}
                className='validator grow'
                title='Must be between 1 and 12'
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

          <button type='submit' className='btn max-w-xs'>
            Create Course
          </button>
        </form>
      </div>
      <div className='border-neutral relative h-20 border-t-1 bg-red-500 transition-[overflow] duration-300'>
        <DragHandle className='absolute -top-1 z-10 w-full' />
        <CoursePool />
      </div>
    </div>
  );
}
