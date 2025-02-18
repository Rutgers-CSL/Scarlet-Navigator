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
    if (value.trim()) {
      setIsLoading(true);
    } else {
      setIsLoading(false);
      setSearchResults([]);
    }
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
        console.error('Search failed:', error);
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
  }, [searchQuery, setSearchResults]);

  return (
    <div className='flex flex-col gap-2'>
      <label className='input input-bordered flex w-full items-center'>
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
      <DroppableContainer id={SEARCH_CONTAINER_ID} items={searchItems}>
        {error ? (
          <div className='flex min-h-[100px] items-center justify-center'>
            <div className='alert alert-error w-full max-w-xs'>
              <span>{error}</span>
            </div>
          </div>
        ) : searchItems.length === 0 && searchQuery && !isLoading ? (
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
      </DroppableContainer>
    </div>
  );
}
