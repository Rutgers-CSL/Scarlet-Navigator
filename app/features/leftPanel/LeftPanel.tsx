import CourseCreation from './courseCreation/CourseCreation';
import CoursePool from './courseCreation/components/CoursePool';
import Link from 'next/link';
import { useDraggable } from '@/lib/hooks/useDraggable';
import {
  LEFT_PANEL_SECONDARY_DEFAULT_HEIGHT,
  LEFT_PANEL_SECONDARY_KEY,
  LEFT_PANEL_SECONDARY_MIN_HEIGHT,
} from '@/lib/constants';

export default function LeftPanel() {
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

  return (
    <div
      id='leftPanelContainer'
      className='text-base-content relative h-full w-full overflow-hidden border-r'
    >
      <div className='mt-4 ml-6 flex flex-col whitespace-nowrap'>
        <div className='text-2xl font-bold'>Scarlet Navigator</div>
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
      <div
        className='relative overflow-y-scroll transition-[overflow] duration-300'
        style={upperPanelStyle}
      >
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
          <div className='tab-content bg-base-100 p-10'>Search</div>
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

      <div className='border-neutral relative h-full border-t-1 transition-[overflow] duration-300'>
        <DragHandle className='absolute -top-1 z-10 w-full' />
        <CoursePool />
      </div>
    </div>
  );
}
