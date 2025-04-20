import CourseCreation from './tabs/CourseCreation';
import CourseSearch from './tabs/CourseSearch';
import Link from 'next/link';
import useAuxiliaryStore from '@/lib/hooks/stores/useAuxiliaryStore';

export default function LeftPanel() {
  const { leftPanelTab, setLeftPanelTab } = useAuxiliaryStore();

  return (
    <div
      id='leftPanelContainer'
      className='text-base-content relative flex h-full w-full flex-col border-r'
    >
      <div className='mt-4 ml-6 flex shrink-0 flex-col pb-3'>
        <div className='text-xl font-bold text-red-400 transition-colors duration-500 hover:text-red-500'>
          <Link href='/'>Scarlet Navigator</Link>
        </div>
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
            checked={leftPanelTab === 'search'}
            onChange={() => setLeftPanelTab('search')}
          />
          <div className='tab-content'>
            <CourseSearch />
          </div>
          <input
            type='radio'
            name='my_tabs_2'
            className='tab'
            aria-label='Misc.'
            checked={leftPanelTab === 'other'}
            onChange={() => setLeftPanelTab('other')}
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
