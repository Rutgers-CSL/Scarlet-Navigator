import { DragOverEvent } from '@dnd-kit/core';
import React, { useRef } from 'react';
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

  const activeId = useAuxiliaryStore((state) => state.activeID);
  const setActiveId = useAuxiliaryStore((state) => state.setActiveID);

  const items = coursesBySemesterID;
  const containers = semesterOrder;

  const setItemsWrapper = (
    items: CoursesBySemesterID,
    isDragEnd: boolean = false
  ) => {
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

    handleDragOperation(cleanedItems);
    // if (moveRef.current) {
    //   handleDragOperation(items, true);
    //   moveRef.current = false;
    // } else {
    //   handleDragOperation(items, false);
    // }
  };

  const setSemesterOrderWrapper = (containers: SemesterOrder) => {
    setSemesterOrder(containers);
  };

  const handleDragOver = (event: DragOverEvent) => {
    console.log('handleDragOver');
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

    if (overContainer === SEARCH_CONTAINER_ID && draggingCourseIsSearchItem) {
      return;
    }

    if (overContainer === SEARCH_CONTAINER_ID) {
      return;
    }

    /**
     * Disable dragging search items into the course pool. It is buggy.
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
        active.rect.current.translated.top > over.rect.top + over.rect.height;

      const modifier = isBelowOverItem ? 1 : 0;

      newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
    }

    if (moveRef.current === null) {
      console.error('moveRef is null! Was it set correctly with useRef?');
      return;
    }

    moveRef.current = true;

    let modifiedActiveContainer = items[activeContainer];
    /**
     * When we are dragging from the search container, we don't
     * want the course to disappear from the list of courses.
     */
    // if (!draggingCourseIsSearchItem) {
    //   modifiedActiveContainer = modifiedActiveContainer.filter(
    //     (item) => item !== active.id
    //   );
    // }

    const newItems = {
      ...items,
      [activeContainer]: modifiedActiveContainer.filter(
        (item) => item !== active.id
      ),
      [overContainer]: [
        ...items[overContainer].slice(0, newIndex),
        items[activeContainer][activeIndex],
        ...items[overContainer].slice(newIndex, items[overContainer].length),
      ],
    };

    // If this is a search item being moved between containers, clean up the previous container
    // if (draggingCourseIsSearchItem) {
    //   // Remove the search item from all other containers except the current one
    //   Object.keys(newItems).forEach(containerId => {
    //     if (containerId !== overContainer && containerId !== SEARCH_CONTAINER_ID) {
    //       newItems[containerId] = newItems[containerId].filter(
    //         item => !item.toString().endsWith(SEARCH_ITEM_DELIMITER)
    //       );
    //     }
    //   });
    // }

    setItemsWrapper(newItems);
  };

  const handleDragEnd = (event: DragOverEvent) => {
    console.log('handleDragEnd');

    const { active, over } = event;
    const activeId = active.id;

    if (activeId in items && over?.id) {
      const activeIndex = containers.indexOf(activeId);
      const overIndex = containers.indexOf(over.id);

      setSemesterOrderWrapper(arrayMove(containers, activeIndex, overIndex));
    }

    const activeContainer = findContainer(items, activeId);
    const overContainer = findContainer(items, over?.id ?? '');

    console.log('overContainer', overContainer);
    console.log('activeContainer', activeContainer);
    console.log('overID', over?.id);
    console.log('activeID', active.id);

    if (!overContainer || !activeContainer) {
      return;
    }

    const draggingCourseIsSearchItem = active.id
      .toString()
      .endsWith(SEARCH_ITEM_DELIMITER);

    console.log('draggingCourseIsSearchItem', draggingCourseIsSearchItem);
    console.log(
      'handleDragEndhandleDragEndhandleDragEndhandleDragEndhandleDragEnd'
    );

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
      console.log('removing SEARCH DELIMITER IN HANDLE DRAG END', activeId);
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
  };

  const handleDragStart = (event: DragOverEvent) => {
    const { active } = event;

    setActiveId(active.id);
  };

  const handleDragMove = (event: DragOverEvent) => {
    return;
  };

  const handleDragCancel = () => {
    if (clonedItems) {
      // Reset items to their original state in case items have been
      // Dragged across containers
      setItemsWrapper(clonedItems);
    }

    setActiveId('');
    setClonedItems(null);
  };
  return {
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
    handleDragStart,
    handleDragMove,
  };
}
