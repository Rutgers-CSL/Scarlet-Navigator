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

export default function CourseSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { coursesBySemesterID, courses, setSearchResults } =
    useScheduleStore.getState();
  const searchItems = coursesBySemesterID[SEARCH_CONTAINER_ID] || [];

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    try {
      const results = await searchCoursesAction({ q: searchQuery });
      const limitedResults = results.slice(0, 10);

      setSearchResults(limitedResults);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='p-4' id='search-results-container'>
      <form onSubmit={handleSearch} className='mb-4'>
        <div className='flex gap-2'>
          <input
            type='text'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder='Search for courses...'
            className='input input-bordered flex-1'
          />
          <button
            type='submit'
            className={`btn btn-primary ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            Search
          </button>
        </div>
      </form>

      <div className='space-y-2'>
        {searchItems.length === 0 && searchQuery && !isLoading && (
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
