'use client';

import { useState, useEffect } from 'react';
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

interface PaginationControlsProps {
  currentPage: number;
  totalResults: number;
  onPageChange: (page: number) => void;
  isLoading: boolean;
}

function PaginationControls({
  currentPage,
  totalResults,
  onPageChange,
  isLoading,
}: PaginationControlsProps) {
  const RESULTS_PER_PAGE = 10; // Fixed at 10
  const totalPages = Math.ceil(totalResults / RESULTS_PER_PAGE);

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if there are few
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always include first page, current page, and last page
      pages.push(1);

      // Show ... if there's a gap between first page and current page area
      if (currentPage > 3) {
        pages.push(null); // null represents an ellipsis
      }

      // Pages around current page
      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      // Show ... if there's a gap between current page area and last page
      if (currentPage < totalPages - 2) {
        pages.push(null); // null represents an ellipsis
      }

      pages.push(totalPages);
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className='join mt-4 flex justify-center'>
      <button
        className='join-item btn btn-sm'
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1 || isLoading}
      >
        «
      </button>

      {getPageNumbers().map((page, index) =>
        page === null ? (
          <button
            key={`ellipsis-${index}`}
            className='join-item btn btn-sm btn-disabled'
          >
            …
          </button>
        ) : (
          <button
            key={`page-${page}`}
            className={`join-item btn btn-sm ${currentPage === page ? 'btn-active' : ''}`}
            onClick={() => onPageChange(page as number)}
            disabled={isLoading}
          >
            {page}
          </button>
        )
      )}

      <button
        className='join-item btn btn-sm'
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages || isLoading}
      >
        »
      </button>
    </div>
  );
}

export default function CourseSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPaginationLoading, setIsPaginationLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalResults, setTotalResults] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const RESULTS_PER_PAGE = 10; // Fixed at 10

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
  const selectedCampus = useAuxiliaryStore((state) => state.selectedCampus);
  const setSelectedCampus = useAuxiliaryStore(
    (state) => state.setSelectedCampus
  );
  const searchMode = useAuxiliaryStore((state) => state.searchMode);
  const setSearchMode = useAuxiliaryStore((state) => state.setSearchMode);
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

  const handleCampusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const campus = e.target.value;
    setSelectedCampus(campus);
    if (searchQuery.trim()) {
      setIsLoading(true);
    }
  };

  const handleSearchModeChange = (mode: 'Name' | 'Core') => {
    setSearchMode(mode);
    if (searchQuery.trim()) {
      setIsLoading(true);
    }
  };

  const handlePageChange = (page: number) => {
    if (page < 1) return;
    const totalPages = Math.ceil(totalResults / RESULTS_PER_PAGE);
    if (page > totalPages) return;

    setCurrentPage(page);
    setIsPaginationLoading(true);
    // Clear current results to show skeleton
    setSearchResults([]);
  };

  useEffect(() => {
    const handleSearch = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        setIsLoading(false);
        setIsPaginationLoading(false);
        setTotalResults(0);
        setCurrentPage(1);
        return;
      }

      setError(null);
      try {
        const filter_by = selectedCampus ? `mainCampus:${selectedCampus}` : '';

        // Replace server action with API call
        const response = await fetch('/api/courses/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            q: searchQuery,
            filter_by,
            searchMode,
            page: currentPage,
            per_page: RESULTS_PER_PAGE,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to search courses');
        }

        const data = await response.json();
        setTotalResults(data.totalResults);
        setSearchResults(data.courses);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError('Failed to search courses. Please try again.');
        }
        setTotalResults(0);
      } finally {
        setIsLoading(false);
        setIsPaginationLoading(false);
      }
    };

    const debounceTimeout = setTimeout(handleSearch, 800);
    return () => clearTimeout(debounceTimeout);
  }, [
    searchQuery,
    setSearchResults,
    isLoading,
    selectedCampus,
    searchMode,
    currentPage,
  ]);

  return (
    <div className='card'>
      <div className='card-body'>
        {/* <h2 className='card-title'>Find Rutgers Courses</h2> */}
        <div className='bg-base-100 sticky top-0 z-10 pb-2'>
          <label className='input input-bordered flex w-full items-center gap-2'>
            <input
              type='text'
              value={searchQuery}
              onChange={handleInputChange}
              placeholder={
                searchMode === 'Core'
                  ? 'Search by course core code'
                  : 'Find Rutgers Courses'
              }
              className='validator grow'
            />

            <span
              className={`loading loading-spinner loading-sm ${isLoading ? 'visible' : 'invisible'}`}
            ></span>

            <div className='border-base-content/20 -mr-2 w-40 border-l pl-2'>
              <select
                onChange={(e) =>
                  handleSearchModeChange(e.target.value as 'Name' | 'Core')
                }
                value={searchMode}
                className='select select-sm select-ghost'
              >
                <option value='Name'>Name</option>
                <option value='Core'>Core</option>
              </select>
            </div>
          </label>

          <div className='mt-2'>
            <select
              className='select w-full'
              value={selectedCampus}
              onChange={handleCampusChange}
            >
              {Object.entries(CAMPUSES)
                .filter(([code]) => code !== '')
                .map(([code, name]) => (
                  <option key={code} value={code}>
                    {name}
                  </option>
                ))}
            </select>
          </div>

          {searchQuery.trim() && !isLoading && !error && (
            <div className='mt-2 text-right text-sm opacity-70'>
              {totalResults} {totalResults === 1 ? 'result' : 'results'} found
            </div>
          )}

          <div className='h-full pb-4'>
            {error ? (
              <div className='flex min-h-[100px] items-center justify-center'>
                <div className='alert alert-error w-full max-w-xs'>
                  <span>{error}</span>
                </div>
              </div>
            ) : (isLoading || isPaginationLoading) &&
              searchItems.length === 0 ? (
              <LoadingSkeleton />
            ) : searchItems.length === 0 && searchQuery ? (
              <div className='flex min-h-[100px] items-center justify-center'>
                <div className='text-base-content'>No courses found</div>
              </div>
            ) : (
              <>
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

                <PaginationControls
                  currentPage={currentPage}
                  totalResults={totalResults}
                  onPageChange={handlePageChange}
                  isLoading={isPaginationLoading}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
