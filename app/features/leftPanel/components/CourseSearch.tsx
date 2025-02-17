'use client';

import { useState } from 'react';
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

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsLoading(true);
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

  return (
    <div className='p-4' id='search-results-container'>
      <form onSubmit={handleSearch} className='mb-4'>
        <div className='space-y-4'>
          <label className='input input-bordered flex items-center gap-2'>
            Search:
            <input
              type='text'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder='Enter course name'
              className='validator grow'
              required
            />
          </label>
          <button
            type='submit'
            className={`btn max-w-xs ${isLoading ? 'btn-disabled' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className='loading loading-spinner loading-sm'></span>
            ) : (
              'Search'
            )}
          </button>
        </div>
      </form>

      {error && (
        <div className='alert alert-error mb-4'>
          <span>{error}</span>
        </div>
      )}

      <div className='space-y-2'>
        {searchItems.length === 0 && searchQuery && !isLoading && !error && (
          <div className='text-base-content text-center'>No courses found</div>
        )}
        <DroppableContainer id={SEARCH_CONTAINER_ID} items={searchItems}>
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
        </DroppableContainer>
      </div>
    </div>
  );
}
