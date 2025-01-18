import CourseCreation from './courseCreation/CourseCreation';
import CoursePool from './courseCreation/components/CoursePool';

export default function LeftPanel() {
  return (
    <div className='h-full w-full border-r border-gray-200 bg-white'>
      {/* <span className="font-black text-red-600 text-2xl">Scarlet Navigator</span> */}
      <CourseCreation />
      <CoursePool />
    </div>
  );
}
