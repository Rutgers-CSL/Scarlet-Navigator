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
import SortableItem from '../../dnd-core/dnd-core-components/SortableItem/SortableItem';
import useOverlayComponents from '../../dnd-core/dnd-hooks/useOverlayComponents';
import DroppableContainer from '../../dnd-core/dnd-core-components/DroppableContainer/DroppableContainer';
import { useScheduleStore } from '@/lib/hooks/stores/useScheduleStore';
import useAuxiliaryStore from '@/lib/hooks/stores/useAuxiliaryStore';
import useScheduleHandlers from '../../dnd-core/dnd-hooks/useScheduleHandlers';
import { EMPTY, PLACEHOLDER_ID } from '@/lib/constants';
import { CoursesBySemesterID, CourseID } from '@/lib/types/models';
import { calculateRunningCredits, getStudentStatus } from './utils/credits';
import { getColor, dropAnimation } from '../../dnd-core/dnd-utils';
import NotesBox from './components/NotesBox';
import { useSettingsStore } from '@/lib/hooks/stores/useSettingsStore';
import MenuContainer from './components/MenuContainer';
import { Info } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';

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
  columns,
  handle = false,
  items: initialItems,
  containerStyle,
  getItemStyles = () => ({}),
  wrapperStyle = () => ({}),
  minimal = false,
  renderItem,
  strategy = verticalListSortingStrategy,
  scrollable,
}: Props) {
  const semesterOrder = useScheduleStore((state) => state.semesterOrder);
  const coursesBySemesterID = useScheduleStore(
    (state) => state.coursesBySemesterID
  );
  const courses = useScheduleStore((state) => state.courses);
  const semesterByID = useScheduleStore((state) => state.semesterByID);

  const {
    showQuarterlyStudentTitlesOnSemesterTitles,
    showCoreLabelsInCoursesInsideScheduleBoard: showCoreLabels,
  } = useSettingsStore((state) => state.visuals);

  const { recentlyMovedToNewContainer, activeID } = useAuxiliaryStore(
    useShallow((state) => ({
      recentlyMovedToNewContainer: state.recentlyMovedToNewContainer,
      activeID: state.activeID,
    }))
  );
  const setRecentlyMovedToNewContainer = useAuxiliaryStore(
    useShallow((state) => state.setRecentlyMovedToNewContainer)
  );
  const setCurrentInfo = useAuxiliaryStore((state) => state.setCurrentInfo);
  const resetRef = useRef(false);

  const currentInfoID = useAuxiliaryStore((state) => state.currentInfoID);

  useEffect(() => {
    if (recentlyMovedToNewContainer?.current) {
      requestAnimationFrame(() => {
        resetRef.current = false;
        setRecentlyMovedToNewContainer(resetRef);
      });
    }
  }, [recentlyMovedToNewContainer, setRecentlyMovedToNewContainer]);

  const isSortingContainer = activeID
    ? semesterOrder.includes(activeID)
    : false;
  const { RenderContainerDragOverlay, renderSortableItemDragOverlay } =
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

  const getContainerTitle = (
    containerId: UniqueIdentifier,
    isHovered: boolean = false
  ) => {
    const title = semesterByID[containerId as string]?.title || 'Untitled';

    if (containerId === PLACEHOLDER_ID) return title;

    // Calculate cumulative GPA up to this semester
    let allCoursesUpToThisSemester: CourseID[] = [];
    for (const semesterId of semesterOrder) {
      allCoursesUpToThisSemester = [
        ...allCoursesUpToThisSemester,
        ...(coursesBySemesterID[semesterId] || []),
      ];
      if (semesterId === containerId) break;
    }

    const runningCredits = calculateRunningCredits(
      semesterOrder,
      coursesBySemesterID,
      courses,
      containerId
    );

    const studentStatus = showQuarterlyStudentTitlesOnSemesterTitles
      ? ` - ${getStudentStatus(runningCredits)}`
      : '';

    // Handle info button click
    const handleInfoClick = (e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent event from bubbling up
      setCurrentInfo(containerId as string, 'semester');
    };

    // Use currentInfoID from the component scope instead of calling the hook here
    const isCurrentSemester = containerId === currentInfoID;

    return (
      <div className='relative flex w-full items-center justify-between p-2'>
        {/* Indicator line for current semester */}
        <div className='absolute bottom-0 left-0 flex w-full justify-center'>
          <div
            className={`bg-neutral h-1 transition-all duration-500 ${isCurrentSemester ? 'w-12' : 'w-0'}`}
          />
        </div>

        <div className='flex-grow text-center font-bold'>
          {title}
          {studentStatus}
        </div>
        <div className='flex h-5 w-5 items-center justify-center'>
          {isHovered && (
            <button
              onClick={handleInfoClick}
              className='cursor-pointer'
              title='View semester details'
            >
              <Info size={20} />
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className='box-border flex h-full w-full flex-col overflow-auto p-5 pt-[10px] select-none'>
        <SortableContext
          items={[...semesterOrder, PLACEHOLDER_ID]}
          strategy={rectSortingStrategy}
        >
          <div className='flex h-full w-full flex-col'>
            <MenuContainer />
            <div className='grid w-full grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-x-4 gap-y-4 px-4'>
              {semesterOrder.map((containerId) => (
                <React.Fragment key={containerId}>
                  <DroppableContainer
                    key={containerId}
                    id={containerId}
                    label={({ isHovered }) =>
                      getContainerTitle(containerId, isHovered)
                    }
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
                            containerId={containerId}
                            showCores={showCoreLabels}
                            currentInfoID={
                              currentInfoID === value ? value : null
                            }
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
              ? RenderContainerDragOverlay(activeID)
              : renderSortableItemDragOverlay(activeID)
            : null}
        </DragOverlay>,
        document.body
      )}
    </>
  );
}
