'use client';

import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  CancelDrop,
  DragOverlay,
  Modifiers,
  UniqueIdentifier,
  KeyboardCoordinateGetter,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  SortingStrategy,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { coordinateGetter as multipleContainersCoordinateGetter } from '../../dnd-core/multipleContainersKeyboardCoordinates';
import SortableItem from '../../dnd-core/dnd-core-components/SortableItem/SortableItem';
import useOverlayComponents from '../../dnd-core/dnd-hooks/useOverlayComponents';
import DroppableContainer from '../../dnd-core/dnd-core-components/DroppableContainer/DroppableContainer';
import { useScheduleStore } from '@/lib/hooks/stores/useScheduleStore';
import useAuxiliaryStore from '@/lib/hooks/stores/useAuxiliaryStore';
import useHistoryStore from '@/lib/hooks/stores/useHistoryStore';
import useScheduleHandlers from '../../dnd-core/dnd-hooks/useScheduleHandlers';
import { EMPTY, PLACEHOLDER_ID } from '@/lib/constants';
import { CoursesBySemesterID } from '@/lib/types/models';
import { Button } from '../../dnd-core';
import {
  calculateSemesterCredits,
  calculateRunningCredits,
  getStudentStatus,
} from './utils/credits';
import { getColor, dropAnimation } from '../../dnd-core/dnd-utils';
import NotesBox from './components/NotesBox';
import { useSettingsStore } from '@/lib/hooks/stores/useSettingsStore';
import { calculateSemesterGPA } from './utils/gpa';

function UndoRedoControls() {
  const { undo, redo, past, future } = useHistoryStore();

  return (
    <div className='mb-4 flex justify-center gap-2'>
      <Button onClick={undo} disabled={past.length === 0}>
        ↩ Undo
      </Button>
      <Button onClick={redo} disabled={future.length === 0}>
        ↪ Redo
      </Button>
    </div>
  );
}

interface Props {
  adjustScale?: boolean;
  cancelDrop?: CancelDrop;
  columns?: number;
  containerStyle?: React.CSSProperties;
  coordinateGetter?: KeyboardCoordinateGetter;
  getItemStyles?(args: {
    value: UniqueIdentifier;
    index: number;
    overIndex: number;
    isDragging: boolean;
    containerId: UniqueIdentifier;
    isSorting: boolean;
    isDragOverlay: boolean;
  }): React.CSSProperties;
  wrapperStyle?(args: { index: number }): React.CSSProperties;
  itemCount?: number;
  items?: CoursesBySemesterID;
  handle?: boolean;
  renderItem?: any;
  strategy?: SortingStrategy;
  modifiers?: Modifiers;
  minimal?: boolean;
  trashable?: boolean;
  scrollable?: boolean;
  vertical?: boolean;
}

export function ScheduleBoard({
  adjustScale = false,
  itemCount = 3,
  cancelDrop,
  columns,
  handle = false,
  items: initialItems,
  containerStyle,
  coordinateGetter = multipleContainersCoordinateGetter,
  getItemStyles = () => ({}),
  wrapperStyle = () => ({}),
  minimal = false,
  modifiers,
  renderItem,
  strategy = verticalListSortingStrategy,
  trashable = false,
  vertical = false,
  scrollable,
}: Props) {
  const semesterOrder = useScheduleStore((state) => state.semesterOrder);
  const coursesBySemesterID = useScheduleStore(
    (state) => state.coursesBySemesterID
  );
  const courses = useScheduleStore((state) => state.courses);
  const semesterByID = useScheduleStore((state) => state.semesterByID);

  const {
    showGPAsInSemesterTitles,
    goalCreditsForGraduation,
    showQuarterlyStudentTitlesOnSemesterTitles,
    showCoreLabelsInCoursesInsideScheduleBoard: showCoreLabels,
  } = useSettingsStore((state) => state.visuals);

  const gradePoints = useSettingsStore((state) => state.gradePoints);

  const { recentlyMovedToNewContainer, activeID } =
    useAuxiliaryStore.getState();
  const setRecentlyMovedToNewContainer = useAuxiliaryStore(
    (state) => state.setRecentlyMovedToNewContainer
  );
  const moveRef = useRef(false);
  const resetRef = useRef(false);

  useEffect(() => {
    if (recentlyMovedToNewContainer?.current) {
      requestAnimationFrame(() => {
        resetRef.current = false;
        setRecentlyMovedToNewContainer(resetRef);
      });
    }
  }, [recentlyMovedToNewContainer, setRecentlyMovedToNewContainer]);

  useEffect(() => {
    requestAnimationFrame(() => {
      moveRef.current = false;
    });
  }, [coursesBySemesterID]);

  const isSortingContainer = activeID
    ? semesterOrder.includes(activeID)
    : false;
  const { renderContainerDragOverlay, renderSortableItemDragOverlay } =
    useOverlayComponents(
      coursesBySemesterID,
      handle,
      renderItem,
      getColor,
      getItemStyles,
      wrapperStyle
    );

  const { handleAddColumn, handleEditSemester, handlePopulateSchedule } =
    useScheduleHandlers();

  const getContainerTitle = (containerId: UniqueIdentifier) => {
    const title = semesterByID[containerId as string]?.title || 'Untitled';

    if (containerId === PLACEHOLDER_ID) return title;

    const hasUngraded = (coursesBySemesterID[containerId] || []).some(
      (courseId) => courses[courseId]?.grade === null
    );

    const gpaVal = hasUngraded
      ? 'N/A'
      : calculateSemesterGPA(
          coursesBySemesterID[containerId] || [],
          courses,
          gradePoints
        );

    const gpaInfo = showGPAsInSemesterTitles ? ` (GPA: ${gpaVal})` : '';

    const credits = calculateSemesterCredits(
      coursesBySemesterID[containerId] || [],
      courses
    );

    const totalCredits = calculateRunningCredits(
      semesterOrder,
      coursesBySemesterID,
      courses,
      containerId
    );

    const studentStatus = showQuarterlyStudentTitlesOnSemesterTitles
      ? ` - ${getStudentStatus(totalCredits)}`
      : '';

    return `${title}${studentStatus}
            ${gpaInfo}
            (${credits} credits,
            Total: ${totalCredits} / ${goalCreditsForGraduation})`;
  };

  return (
    <>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
          padding: 20,
          width: '100%',
          height: '100%',
          overflow: 'auto',
        }}
      >
        <SortableContext
          items={[...semesterOrder, PLACEHOLDER_ID]}
          strategy={rectSortingStrategy}
        >
          <div className='flex h-full w-full flex-col'>
            <UndoRedoControls />
            <div className='grid w-full grid-cols-[repeat(auto-fit,minmax(330px,1fr))] gap-x-8 gap-y-4 px-4'>
              {semesterOrder.map((containerId) => (
                <React.Fragment key={containerId}>
                  <DroppableContainer
                    key={containerId}
                    id={containerId}
                    label={getContainerTitle(containerId)}
                    columns={columns}
                    items={coursesBySemesterID[containerId]}
                    scrollable={scrollable}
                    style={containerStyle}
                    unstyled={minimal}
                    onRemove={() => handleEditSemester(containerId)}
                  >
                    <SortableContext
                      items={coursesBySemesterID[containerId]}
                      strategy={strategy}
                    >
                      {coursesBySemesterID[containerId].map((value, index) => {
                        return (
                          <SortableItem
                            disabled={isSortingContainer}
                            key={value}
                            id={value}
                            index={index}
                            handle={handle}
                            style={getItemStyles}
                            wrapperStyle={wrapperStyle}
                            renderItem={renderItem}
                            containerId={containerId}
                            showCores={showCoreLabels}
                            getIndex={(id) => {
                              return 0;
                            }}
                          />
                        );
                      })}
                    </SortableContext>
                  </DroppableContainer>
                  <NotesBox
                    semesterID={containerId}
                    key={containerId + '-notes'}
                  />
                </React.Fragment>
              ))}
              {minimal ? undefined : (
                <>
                  <DroppableContainer
                    id={PLACEHOLDER_ID}
                    disabled={isSortingContainer}
                    items={EMPTY}
                    onClick={handleAddColumn}
                    placeholder
                    as='button'
                  >
                    + Add column
                  </DroppableContainer>
                  <DroppableContainer
                    id='populate-placeholder'
                    disabled={isSortingContainer}
                    items={EMPTY}
                    onClick={handlePopulateSchedule}
                    placeholder
                    as='button'
                  >
                    Populate with dummy data
                  </DroppableContainer>
                </>
              )}
            </div>
          </div>
        </SortableContext>
      </div>
      {createPortal(
        <DragOverlay adjustScale={adjustScale} dropAnimation={dropAnimation}>
          {activeID
            ? semesterOrder.includes(activeID)
              ? renderContainerDragOverlay(activeID)
              : renderSortableItemDragOverlay(activeID)
            : null}
        </DragOverlay>,
        document.body
      )}
    </>
  );
}
