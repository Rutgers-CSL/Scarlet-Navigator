'use client';

import { useMemo, useState } from 'react';
import { Course } from '@/lib/types/models';
import { searchCoursesAction } from '@/app/actions/searchCourses';
import useAuxiliaryStore from '@/lib/hooks/stores/useAuxiliaryStore';
import { SEARCH_ITEM_DELIMITER, SEARCH_CONTAINER_ID } from '@/lib/constants';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableItem } from '@/app/features/dnd-core/dnd-core-components/SortableItem';

export default function CourseSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const { searchResultMap, setSearchResultMap } = useAuxiliaryStore();
  const [isLoading, setIsLoading] = useState(false);

  const searchResultOrder = useMemo(() => {
    return Object.keys(searchResultMap);
  }, [searchResultMap]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    try {
      const results = await searchCoursesAction({ q: searchQuery });
      const limitedResults = results.slice(0, 10);

      const resultMap: Record<string, Course> = {};

      for (const course of limitedResults) {
        const courseID = `${course.id}${SEARCH_ITEM_DELIMITER}`;
        resultMap[courseID] = course;
      }

      setSearchResultMap(resultMap); // in the auxiliary store
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
        {searchResultOrder.length === 0 && searchQuery && !isLoading && (
          <div className='text-base-content text-center'>No courses found</div>
        )}
        <SortableContext
          items={searchResultOrder}
          strategy={verticalListSortingStrategy}
        >
          {searchResultOrder.map((courseID) => (
            <SortableItem
              key={courseID}
              containerId={SEARCH_CONTAINER_ID}
              id={courseID}
              index={0}
              handle={false}
              style={() => ({})}
              getIndex={() => 0}
              wrapperStyle={() => ({})}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
