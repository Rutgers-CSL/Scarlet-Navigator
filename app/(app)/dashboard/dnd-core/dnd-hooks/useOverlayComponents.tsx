import { UniqueIdentifier } from '@dnd-kit/core';
import React from 'react';
import { Container, Item } from '..';
import { findContainer, getIndex } from '../dnd-utils';
import { CoursesBySemesterID } from '@/lib/types/models';
import { useScheduleStore } from '@/lib/hooks/stores/useScheduleStore';
import {
  calculateSemesterCredits,
  calculateRunningCredits,
} from '@/lib/utils/calculations/credits';
import { COURSE_POOL_CONTAINER_ID } from '@/app/(app)/dashboard/panels/leftPanel/tabs/CourseCreation';

export const COLUMNS_DEPRECATED_DO_NOT_USE = 5;

export default function useOverlayComponents(
  items: CoursesBySemesterID,
  handle: boolean,
  renderItem: () => React.ReactElement<any>,
  getColor: (id: UniqueIdentifier) => string | undefined,
  getItemStyles: (args: any) => React.CSSProperties,
  wrapperStyle: (args: any) => React.CSSProperties
) {
  const courses = useScheduleStore((state) => state.courses);
  const semesterOrder = useScheduleStore((state) => state.semesterOrder);

  function renderSortableItemDragOverlay(id: UniqueIdentifier) {
    const courseName = courses[id]?.name ?? 'Loading...';
    const sourceContainer = findContainer(items, id) as string;
    const isFromCoursePool = sourceContainer === COURSE_POOL_CONTAINER_ID;

    return (
      <Item
        id={id}
        value={courseName}
        course={courses[id]}
        handle={handle}
        style={getItemStyles({
          containerId: sourceContainer,
          overIndex: -1,
          index: getIndex(items, id),
          value: id,
          isSorting: true,
          isDragging: true,
          isDragOverlay: true,
        })}
        color={getColor(id)}
        wrapperStyle={wrapperStyle({ index: 0 })}
        renderItem={renderItem}
        dragOverlay
        showCores
      />
    );
  }

  function RenderContainerDragOverlay(containerId: UniqueIdentifier) {
    return null;

    const semesterCredits = calculateSemesterCredits(
      items[containerId] || [],
      courses
    );
    const totalCredits = calculateRunningCredits(
      semesterOrder,
      items,
      courses,
      containerId
    );
    const semesterTitle =
      useScheduleStore((state) => state.semesterByID[containerId]?.title) ||
      containerId;

    return (
      <Container
        label={`${semesterTitle} (${semesterCredits} credits, Total: ${totalCredits})`}
        columns={1}
        style={{
          height: '100%',
        }}
        shadow
        unstyled={false}
      >
        {items[containerId].map((id) => {
          const courseName = courses[id]?.name ?? 'Loading...';
          return (
            <Item
              course={courses[id]}
              id={id}
              key={id}
              value={courseName}
              handle={handle}
              style={getItemStyles({
                containerId,
                overIndex: -1,
                index: getIndex(items, id),
                value: id,
                isDragging: false,
                isSorting: false,
                isDragOverlay: false,
              })}
              color={getColor(id)}
              wrapperStyle={wrapperStyle({ index: 1 })}
              renderItem={renderItem}
            />
          );
        })}
      </Container>
    );
  }

  return {
    renderSortableItemDragOverlay,
    RenderContainerDragOverlay,
  };
}
