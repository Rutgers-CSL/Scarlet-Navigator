import CourseCreation from './courseCreation/CourseCreation';
import CoursePool from './courseCreation/components/CoursePool';

export default function LeftPanel() {
  return (
    <div className='text-base-content h-full w-full overflow-x-hidden border-r'>
      <CourseCreation />
      <CoursePool />
    </div>
  );
}
