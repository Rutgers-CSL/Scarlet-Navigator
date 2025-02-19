'use client';

import { useState, useEffect } from 'react';
import { searchCoursesAction } from '@/app/actions/searchCourses';
import { SEARCH_ITEM_DELIMITER, SEARCH_CONTAINER_ID } from '@/lib/constants';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableItem } from '@/app/features/dnd-core/dnd-core-components/SortableItem';
import { DroppableContainer } from '@/app/features/dnd-core/dnd-core-components/DroppableContainer';
import { useScheduleStore } from '@/lib/hooks/stores/useScheduleStore';
import { useShallow } from 'zustand/react/shallow';

interface LoadingSkeletonProps {
  itemCount?: number;
  opacityStep?: number;
}

function LoadingSkeleton({
  itemCount = 4,
  opacityStep = 0.15,
}: LoadingSkeletonProps) {
  return (
    <div className='flex flex-col gap-2 p-4'>
      {[...Array(itemCount)].map((_, index) => (
        <div
          key={index}
          className='animate-pulse'
          style={{ opacity: 1 - index * opacityStep }}
        >
          <div className='bg-base-300 h-16 rounded-lg'></div>
        </div>
      ))}
    </div>
  );
}

export default function CourseSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { coursesBySemesterID, courses, setSearchResults } = useScheduleStore(
    useShallow((state) => {
      return {
        coursesBySemesterID: state.coursesBySemesterID,
        courses: state.courses,
        setSearchResults: state.setSearchResults,
      };
    })
  );
  const searchItems = coursesBySemesterID[SEARCH_CONTAINER_ID] || [];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setSearchResults([]);

    const shouldLoad = !!value.trim();
    setIsLoading(shouldLoad);
  };

  useEffect(() => {
    const handleSearch = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        setIsLoading(false);
        return;
      }

      setError(null);
      try {
        const results = await searchCoursesAction({ q: searchQuery });
        const limitedResults = results.slice(0, 10);

        setSearchResults(limitedResults);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError('Failed to search courses. Please try again.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimeout = setTimeout(handleSearch, 800);
    return () => clearTimeout(debounceTimeout);
  }, [searchQuery, setSearchResults, searchItems.length, isLoading]);

  return (
    <div className='flex h-full flex-col gap-2'>
      <label className='input input-bordered flex w-full shrink-0 items-center'>
        Search:
        <input
          type='text'
          value={searchQuery}
          onChange={handleInputChange}
          placeholder='Enter course name'
          className='validator grow'
        />
        {isLoading && (
          <span className='loading loading-spinner loading-sm'></span>
        )}
      </label>

      <div className='flex-grow'>
        <DroppableContainer id={SEARCH_CONTAINER_ID} items={searchItems}>
          <div className='h-full pb-4'>
            {error ? (
              <div className='flex min-h-[100px] items-center justify-center'>
                <div className='alert alert-error w-full max-w-xs'>
                  <span>{error}</span>
                </div>
              </div>
            ) : isLoading && searchItems.length === 0 ? (
              <LoadingSkeleton />
            ) : searchItems.length === 0 && searchQuery ? (
              <div className='flex min-h-[100px] items-center justify-center'>
                <div className='text-base-content'>No courses found</div>
              </div>
            ) : (
              <SortableContext
                items={searchItems}
                strategy={verticalListSortingStrategy}
              >
                {searchItems.map((courseId) => {
                  const potentialCourseId = courseId
                    .toString()
                    .replace(SEARCH_ITEM_DELIMITER, '');
                  const disabled = courses.hasOwnProperty(potentialCourseId);

                  return (
                    <SortableItem
                      key={courseId}
                      containerId={SEARCH_CONTAINER_ID}
                      id={courseId}
                      index={0}
                      handle={false}
                      style={() => ({})}
                      getIndex={() => 0}
                      wrapperStyle={() => ({})}
                      disabled={disabled}
                    />
                  );
                })}
              </SortableContext>
            )}
          </div>
        </DroppableContainer>
      </div>
    </div>
  );
}
