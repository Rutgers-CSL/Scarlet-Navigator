import CourseCreation from './courseCreation/CourseCreation';
import CoursePool from './courseCreation/components/CoursePool';
import Link from 'next/link';
export default function LeftPanel() {
  return (
    <div className='text-base-content h-full w-full overflow-x-hidden border-r'>
      <div className='mt-4 mr-4 ml-6 flex flex-col'>
        <div className='text-2xl font-bold'>Scarlet Navigator</div>
        <div className='text-sm'>
          Developed by{' '}
          <Link
            href='https://spec.cs.rutgers.edu/spaces/the-csl/'
            target='_blank'
            className='font-medium whitespace-nowrap italic hover:underline'
          >
            Scarlet Labs
          </Link>
        </div>
      </div>
      <div className='tabs tabs-border mt-3 flex justify-center' role='tablist'>
        <input
          type='radio'
          name='my_tabs_2'
          className='tab'
          aria-label='Create'
          defaultChecked
        />
        <div className='tab-content'>
          <CourseCreation />
        </div>

        <input
          type='radio'
          name='my_tabs_2'
          className='tab'
          aria-label='Search'
        />
        <div className='tab-content bg-base-100 p-10'>Search</div>
      </div>
      <div className='divider'>Misc.</div>
      <CoursePool />
    </div>
  );
}
