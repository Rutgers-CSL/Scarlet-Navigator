import CourseCreation from './courseCreation/CourseCreation';
import CoursePool from './courseCreation/components/CoursePool';

export default function LeftPanel() {
  return (
    <div className='bg-base-200 text-base-content h-full w-full overflow-x-hidden border-r'>
      <CourseCreation />
      <CoursePool />
    </div>
  );
}
