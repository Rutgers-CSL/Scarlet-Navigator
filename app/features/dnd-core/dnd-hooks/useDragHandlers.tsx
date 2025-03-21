import { DragOverEvent } from '@dnd-kit/core';
import React, { useRef, useCallback, useMemo } from 'react';
import { findContainer } from '../dnd-utils';
import { arrayMove } from '@dnd-kit/sortable';
import { CoursesBySemesterID, SemesterOrder } from '@/lib/types/models';
import { useScheduleStore } from '@/lib/hooks/stores/useScheduleStore';
import useAuxiliaryStore from '@/lib/hooks/stores/useAuxiliaryStore';
import {
  SEARCH_CONTAINER_ID,
  SEARCH_ITEM_DELIMITER,
  TRASH_ID,
} from '@/lib/constants';
import { COURSE_POOL_CONTAINER_ID } from '@/app/features/leftPanel/components/CourseCreation';
import { useShallow } from 'zustand/react/shallow';

/**
 * Prevents dragOver from being called too frequently.
 * This is necessary because the dragOver event is called
 * a lot of times during a drag operation.
 *
 * Throttle: https://www.geeksforgeeks.org/javascript-throttling/
 *
 *
 * There are two reasons for the re-rendering madness:
 *
 * 1. The many calls of handleDragOver
 * 2. The changing of state when in handleDragOver
 *
 *
 * I chose to address the many calls of handleDragOver.
 */
function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => ReturnType<T> | undefined {
  let lastFunc: number;
  let lastRan: number;
  return function (
    this: any,
    ...args: Parameters<T>
  ): ReturnType<T> | undefined {
    if (!lastRan) {
      const result = func.apply(this, args);
      lastRan = Date.now();
      return result;
    } else {
      clearTimeout(lastFunc);
      lastFunc = window.setTimeout(
        () => {
          if (Date.now() - lastRan >= limit) {
            func.apply(this, args);
            lastRan = Date.now();
          }
        },
        limit - (Date.now() - lastRan)
      );
      return undefined;
    }
  };
}

export default function useDragHandlers(
  clonedItems: CoursesBySemesterID | null,
  setClonedItems: React.Dispatch<
    React.SetStateAction<CoursesBySemesterID | null>
  >
) {
  // whether or not a drag operation was recently performed
  // and the list of items needs to be updated
  const moveRef = useRef(false);
  const {
    semesterOrder,
    setSemesterOrder,
    coursesBySemesterID,
    handleDragOperation,
    courses,
    setCourses,
  } = useScheduleStore(
    useShallow((state) => {
      return {
        semesterOrder: state.semesterOrder,
        setSemesterOrder: state.setSemesterOrder,
        coursesBySemesterID: state.coursesBySemesterID,
        setCoursesBySemesterID: state.setCoursesBySemesterID,
        handleDragOperation: state.handleDragOperation,
        courses: state.courses,
        setCourses: state.setCourses,
      };
    })
  );

  const setActiveId = useAuxiliaryStore((state) => state.setActiveID);

  const items = coursesBySemesterID;
  const containers = semesterOrder;

  const setItemsWrapper = useCallback(
    (items: CoursesBySemesterID, isDragEnd: boolean = false) => {
      // Remove search items from all containers except search container
      const cleanedItems = { ...items };
      if (isDragEnd) {
        for (const containerId in cleanedItems) {
          if (containerId !== SEARCH_CONTAINER_ID) {
            cleanedItems[containerId] = cleanedItems[containerId].filter(
              (courseId) => !courseId.toString().endsWith(SEARCH_ITEM_DELIMITER)
            );
          }
        }
      }

      // Only update if items have actually changed
      // This prevents unnecessary state updates during drag operations
      const hasChanged = Object.keys(cleanedItems).some(
        (containerId) =>
          !coursesBySemesterID[containerId] ||
          cleanedItems[containerId].length !==
            coursesBySemesterID[containerId].length ||
          cleanedItems[containerId].some(
            (id, index) => id !== coursesBySemesterID[containerId][index]
          )
      );

      if (hasChanged) {
        handleDragOperation(cleanedItems);
      }
    },
    [coursesBySemesterID, handleDragOperation]
  );

  const setSemesterOrderWrapper = useCallback((containers: SemesterOrder) => {
    setSemesterOrder(containers);

    // blank dependency array to prevent performance issues
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Create a throttled version of the drag over handler
  const throttledDragOver = useMemo(
    () =>
      throttle((event: DragOverEvent) => {
        const { active, over } = event;
        const overId = over?.id;

        if (overId == null || overId === TRASH_ID || active.id in items) {
          return;
        }

        const overContainer = findContainer(items, overId);
        const activeContainer = findContainer(items, active.id);

        const invalidContainers = !overContainer || !activeContainer;

        if (invalidContainers) {
          return;
        }

        const draggingCourseIsSearchItem = active.id
          .toString()
          .endsWith(SEARCH_ITEM_DELIMITER);

        if (
          overContainer === SEARCH_CONTAINER_ID &&
          draggingCourseIsSearchItem
        ) {
          return;
        }

        if (overContainer === SEARCH_CONTAINER_ID) {
          return;
        }

        /**
         * DISABLE DRAGGING SEARCH ITEMS INTO THE COURSE POOL. IT IS VERY VERY BUGGY!!!!
         *
         * Fix later. It's blocking progress for now.
         */
        if (
          draggingCourseIsSearchItem &&
          overContainer === COURSE_POOL_CONTAINER_ID
        ) {
          return;
        }

        /**
         * HandleDragOver is meant to deal with moving one course
         * from one container to another.
         */
        if (activeContainer === overContainer) {
          return;
        }

        const activeItems = items[activeContainer];
        const overItems = items[overContainer];
        const overIndex = overItems.indexOf(overId);
        const activeIndex = activeItems.indexOf(active.id);

        let newIndex: number;

        if (overId in items) {
          newIndex = overItems.length + 1;
        } else {
          const isBelowOverItem =
            over &&
            active.rect.current.translated &&
            active.rect.current.translated.top >
              over.rect.top + over.rect.height;

          const modifier = isBelowOverItem ? 1 : 0;

          newIndex =
            overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
        }

        // Check if moveRef is correctly initialized before using it
        if (moveRef.current === null) {
          console.error('moveRef is null! Was it set correctly with useRef?');
          return;
        }

        moveRef.current = true;

        const newItems = {
          ...items,
          [activeContainer]: activeItems.filter((item) => item !== active.id),
          [overContainer]: [
            ...overItems.slice(0, newIndex),
            activeItems[activeIndex],
            ...overItems.slice(newIndex, overItems.length),
          ],
        };

        setItemsWrapper(newItems);
      }, 100),
    [items, setItemsWrapper, moveRef]
  );

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      throttledDragOver(event);
    },
    [throttledDragOver]
  );

  const handleDragEnd = (event: DragOverEvent) => {
    const { active, over } = event;
    const activeId = active.id;

    if (activeId in items && over?.id) {
      const activeIndex = containers.indexOf(activeId);
      const overIndex = containers.indexOf(over.id);

      setSemesterOrderWrapper(arrayMove(containers, activeIndex, overIndex));
    }

    const activeContainer = findContainer(items, activeId);
    const overContainer = findContainer(items, over?.id ?? '');

    if (!overContainer || !activeContainer) {
      return;
    }

    const draggingCourseIsSearchItem = active.id
      .toString()
      .endsWith(SEARCH_ITEM_DELIMITER);

    // If the user is dragging a search item within the search container,
    // we want to prevent the search container items from re-arranging.
    if (overContainer === SEARCH_CONTAINER_ID && draggingCourseIsSearchItem) {
      return;
    }
    const overId = over?.id;

    if (overId == null) {
      setActiveId('');
      return;
    }

    const activeIndex = items[activeContainer].indexOf(active.id);
    const overIndex = items[overContainer].indexOf(overId);
    const newItemState = {
      ...items,
      [overContainer]: arrayMove(items[overContainer], activeIndex, overIndex),
    };

    if (!newItemState[overContainer][overIndex]) {
      return;
    }

    if (draggingCourseIsSearchItem) {
      const newCourseId = activeId
        .toString()
        .replace(SEARCH_ITEM_DELIMITER, '');
      setCourses({
        ...courses,
        [newCourseId]: {
          ...courses[activeId],
          id: newCourseId,
        },
      });

      newItemState[overContainer][overIndex] = newCourseId;
    }

    if (activeContainer === overContainer && moveRef.current) {
      moveRef.current = true;
    }

    setItemsWrapper(newItemState, true);
    setActiveId('');
    document.body.style.cursor = '';
  };

  // intentional blank dependency array to prevent performance issues
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleDragStart = useCallback((event: DragOverEvent) => {
    const { active } = event;
    setActiveId(active.id);

    document.body.style.cursor = 'grabbing';
    // intentional blank dependency array to prevent performance issues
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // intentional blank dependency array to prevent performance issues
  // intentional blank dependency array to prevent performance issues
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleDragMove = useCallback((event: DragOverEvent) => {
    return;
  }, []);
  // intentional blank dependency array to prevent performance issues
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleDragCancel = useCallback(() => {
    if (clonedItems) {
      setItemsWrapper(clonedItems);
    }
    document.body.style.cursor = '';
    setActiveId('');
    // intentional blank dependency array to prevent performance issues
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clonedItems]);

  return {
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
    handleDragMove,
  };
}
