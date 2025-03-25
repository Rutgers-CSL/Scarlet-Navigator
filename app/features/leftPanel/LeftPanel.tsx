import CourseCreation from './components/CourseCreation';
import CourseSearch from './components/CourseSearch';
import Link from 'next/link';

export default function LeftPanel() {
  return (
    <div
      id='leftPanelContainer'
      className='text-base-content relative flex h-full w-full flex-col border-r'
    >
      <div className='mt-4 ml-6 flex shrink-0 flex-col pb-3'>
        <div className='text-2xl font-bold'>Scarlet Navigator</div>
        <div className='text-xs font-bold'>Unofficial Beta Release</div>
        <div className='text-sm'>
          Developed by{' '}
          <Link
            href='https://spec.cs.rutgers.edu/spaces/the-csl/'
            target='_blank'
            className='font-medium italic hover:underline'
          >
            Scarlet Labs
          </Link>
        </div>
      </div>
      <div className='flex-grow overflow-y-scroll'>
        <div
          className='tabs tabs-border mt-3 flex justify-center'
          role='tablist'
        >
          <input
            type='radio'
            name='my_tabs_2'
            className='tab'
            aria-label='Search'
            defaultChecked
          />
          <div className='tab-content'>
            <CourseSearch />
          </div>
          <input
            type='radio'
            name='my_tabs_2'
            className='tab'
            aria-label='Create'
          />
          <div className='tab-content'>
            <CourseCreation />
          </div>
        </div>
      </div>

      {/* <div className='border-neutral relative h-full border-t-1 transition-[overflow] duration-300'>
        <DragHandle className='absolute -top-1 z-10 w-full' />
        <CoursePool />
      </div> */}
    </div>
  );
}
