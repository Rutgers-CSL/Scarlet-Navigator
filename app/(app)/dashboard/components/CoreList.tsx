//accepts a color and list of cores and displays them

import clsx from 'clsx';
import { useMemo } from 'react';

interface CoreListProps {
  cores: string[];
  handleRemoveCore?: (core: string) => void;
  handleOnClick?: (core: string) => void;
}

function CoreList(props: CoreListProps) {
  const { cores, handleRemoveCore, handleOnClick } = props;

  const memoizedCores = useMemo(
    () =>
      cores.map((core) => (
        <div
          key={core}
          onClick={() => {
            if (handleOnClick) {
              handleOnClick(core);
            }
          }}
          className={clsx(
            'badge badge-neutral text-sm font-normal',
            handleOnClick ? 'cursor-pointer' : 'cursor-default'
          )}
        >
          {core}
          {handleRemoveCore && !handleOnClick && (
            <button
              type='button'
              onClick={() => handleRemoveCore(core)}
              className='ml-1 hover:cursor-pointer'
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 16 16'
                fill='currentColor'
                className='size-3'
              >
                <path d='M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z' />
              </svg>
            </button>
          )}
        </div>
      )),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cores]
  );

  if (!cores || cores.length === 0) {
    return (
      <div className='text-base-content text-sm'>
        No cores assigned to this course
      </div>
    );
  }

  return <div className='flex flex-wrap gap-2'>{memoizedCores}</div>;
}

export default CoreList;
