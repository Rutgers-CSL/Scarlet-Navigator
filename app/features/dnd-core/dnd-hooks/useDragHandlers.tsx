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
    setCoursesBySemesterID,
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

  // const setRecentlyMovedToNewContainer = useAuxiliaryStore(
  //   (state) => state.setRecentlyMovedToNewContainer
  // );
  const activeId = useAuxiliaryStore((state) => state.activeID);
  const setActiveId = useAuxiliaryStore((state) => state.setActiveID);

  const items = coursesBySemesterID;
  const containers = semesterOrder;

  const setItemsWrapper = (
    items: CoursesBySemesterID,
    isDragEnd: boolean = false
  ) => {
    console.log('hello world', moveRef);

    if (isDragEnd) {
      // Check if any non-search container has a search item and fix it

      Object.keys(items).forEach((containerId) => {
        if (containerId === SEARCH_CONTAINER_ID) return;

        const courseIds = items[containerId];
        const fixedCourseIds = courseIds.map((id) =>
          id.toString().endsWith(SEARCH_ITEM_DELIMITER)
            ? id.toString().replace(SEARCH_ITEM_DELIMITER, '')
            : id
        );

        items[containerId] = fixedCourseIds;
      });
    }

    handleDragOperation(items);
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
    console.log('I AM HANDLING DRAGGING OVER !!!!', event);
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

    // If we're dragging a search item between regular containers, don't update state
    // This prevents the infinite update loop
    // if (draggingCourseIsSearchItem &&
    //   activeContainer !== SEARCH_CONTAINER_ID &&
    //   overContainer !== SEARCH_CONTAINER_ID) {
    //   return;
    // }

    //print the active and over containers and overids and activeids
    console.log('--------------------------------');
    console.log('activeContainer', activeContainer);
    console.log('overContainer', overContainer);
    console.log('overId', overId);
    console.log('activeId', active.id);
    console.log('--------------------------------');

    if (overContainer === SEARCH_CONTAINER_ID) {
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

    setItemsWrapper({
      ...items,
      [activeContainer]: items[activeContainer].filter(
        (item) => item !== active.id
      ),
      [overContainer]: [
        ...items[overContainer].slice(0, newIndex),
        items[activeContainer][activeIndex],
        ...items[overContainer].slice(newIndex, items[overContainer].length),
      ],
    });
  };

  const handleDragEnd = (event: DragOverEvent) => {
    console.log('handleDragEnd', event);
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

    if (
      newItemState[overContainer][overIndex]
        .toString()
        .endsWith(SEARCH_ITEM_DELIMITER)
    ) {
      console.error(
        'Search item did not properly dispose of search id delimiter'
      );
      return;
    }

    if (activeContainer === overContainer && moveRef.current) {
      moveRef.current = true;
    }
    setItemsWrapper(newItemState, true);

    setActiveId('');
  };

  const handleDragStart = (event: DragOverEvent) => {
    // console.log('handleDragStart', event);
    const { active } = event;

    setActiveId(active.id);

    // setClonedItems(items);
  };

  const handleDragMove = (event: DragOverEvent) => {
    // console/.log('handleDragMove', event);
    return;
  };

  const handleDragCancel = () => {
    // console.log('handleDragCancel');
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
