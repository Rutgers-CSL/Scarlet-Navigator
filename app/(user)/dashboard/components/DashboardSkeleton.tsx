import {
  LEFT_PANEL_DEFAULT_WIDTH,
  RIGHT_PANEL_DEFAULT_WIDTH,
} from '@/lib/constants';

export default function DashboardSkeleton() {
  return (
    <div className='relative flex h-screen w-full flex-row'>
      {/* Left Panel Skeleton */}
      <div
        style={{ width: LEFT_PANEL_DEFAULT_WIDTH }}
        className='h-full shrink-0 animate-pulse border-r'
      >
        {/* Header */}
        <div className='mt-4 ml-6 flex flex-col gap-2'>
          <div className='bg-base-300 h-8 w-48 rounded-md' />
          <div className='bg-base-300 h-4 w-32 rounded-md' />
        </div>

        {/* Upper Section */}
        <div className='mt-6 px-4'>
          <div className='bg-base-300 h-64 rounded-md' />
        </div>

        {/* Divider */}
        <div className='bg-base-300 my-2 h-2 w-full' />

        {/* Lower Section */}
        <div className='px-4'>
          <div className='bg-base-300 h-48 rounded-md' />
        </div>
      </div>

      {/* Middle Panel Skeleton */}
      <div className='h-full grow px-4 py-6'>
        <div className='grid h-full grid-cols-3 gap-4'>
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className='bg-base-300 h-64 animate-pulse rounded-md'
            />
          ))}
        </div>
      </div>

      {/* Right Panel Skeleton */}
      <div
        style={{ width: RIGHT_PANEL_DEFAULT_WIDTH }}
        className='h-full shrink-0 animate-pulse border-l'
      >
        <div className='flex h-full flex-col gap-4 p-4'>
          <div className='bg-base-300 h-8 w-32 rounded-md' />
          <div className='bg-base-300 h-48 rounded-md' />
          <div className='bg-base-300 h-48 rounded-md' />
        </div>
      </div>
    </div>
  );
}
