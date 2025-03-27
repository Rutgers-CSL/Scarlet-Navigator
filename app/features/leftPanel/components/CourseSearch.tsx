'use client';

import { useState, useEffect } from 'react';
import { searchCoursesAction } from '@/app/actions/searchCourses';
import {
  SEARCH_ITEM_DELIMITER,
  SEARCH_CONTAINER_ID,
  CAMPUSES,
} from '@/lib/constants';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableItem } from '@/app/features/dnd-core/dnd-core-components/SortableItem';
import { useScheduleStore } from '@/lib/hooks/stores/useScheduleStore';
import { useShallow } from 'zustand/react/shallow';
import useAuxiliaryStore from '@/lib/hooks/stores/useAuxiliaryStore';

interface LoadingSkeletonProps {
  itemCount?: number;
  opacityStep?: number;
}

function LoadingSkeleton({
  itemCount = 5,
  opacityStep = 0.25,
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
  const [selectedCampus, setSelectedCampus] = useState<string | null>(null);
  const { coursesBySemesterID, courses, setSearchResults } = useScheduleStore(
    useShallow((state) => {
      return {
        coursesBySemesterID: state.coursesBySemesterID,
        courses: state.courses,
        setSearchResults: state.setSearchResults,
      };
    })
  );
  const storeSearchQuery = useAuxiliaryStore((state) => state.searchQuery);
  const setStoreSearchQuery = useAuxiliaryStore(
    (state) => state.setSearchQuery
  );
  const searchItems = coursesBySemesterID[SEARCH_CONTAINER_ID] || [];

  // Clear search results on mount
  useEffect(() => {
    setSearchResults([]);
  }, [setSearchResults]);

  // Listen for search query changes from the store
  useEffect(() => {
    if (storeSearchQuery && storeSearchQuery !== searchQuery) {
      setSearchQuery(storeSearchQuery);
      setIsLoading(true);
      // Clear the store query after using it
      setStoreSearchQuery('');
    }
  }, [storeSearchQuery, searchQuery, setStoreSearchQuery]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setSearchResults([]);

    const shouldLoad = !!value.trim();
    setIsLoading(shouldLoad);
  };

  const handleCampusChange = (campus: string | null) => {
    if (campus == selectedCampus) return;
    setSelectedCampus(campus);
    if (searchQuery.trim()) {
      setIsLoading(true);
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
        const filter_by = selectedCampus ? `mainCampus:${selectedCampus}` : '';
        const results = await searchCoursesAction({
          q: searchQuery,
          filter_by,
        });
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
  }, [searchQuery, setSearchResults, isLoading, selectedCampus]);

  return (
    <div className='card'>
      <div className='card-body'>
        {/* <h2 className='card-title'>Find Rutgers Courses</h2> */}
        <div className='bg-base-100 sticky top-0 z-10 pb-2'>
          <label className='input input-bordered flex w-full items-center'>
            <input
              type='text'
              value={searchQuery}
              onChange={handleInputChange}
              placeholder='Find Rutgers Courses'
              className='validator grow'
            />
            {isLoading && (
              <span className='loading loading-spinner loading-sm'></span>
            )}
          </label>
          <div className='mt-2 flex w-full justify-center'>
            <div className='m-2 filter'>
              <input
                className='btn filter-reset btn-sm'
                type='radio'
                name='campuses'
                aria-label='All'
                onClick={() => {
                  handleCampusChange(null);
                }}
              />
              {Object.entries(CAMPUSES)
                .filter(([code]) => code !== '')
                .map(([code, name]) => (
                  <input
                    key={name}
                    className='btn btn-sm'
                    type='radio'
                    name='campuses'
                    aria-label={name}
                    onClick={() => handleCampusChange(code)}
                  />
                ))}
            </div>
          </div>
          {/* <DroppableContainer id={SEARCH_CONTAINER_ID} items={searchItems}> */}
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
                      course={courses[courseId]}
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
          {/* </DroppableContainer> */}
        </div>
      </div>
    </div>
  );
}
