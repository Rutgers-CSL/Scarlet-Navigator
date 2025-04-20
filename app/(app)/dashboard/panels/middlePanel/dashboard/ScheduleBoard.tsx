'use client';

import React, { useEffect, useRef, useState } from 'react';
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
import SortableItem from '../../../dnd-core/dnd-core-components/SortableItem/SortableItem';
import useOverlayComponents from '../../../dnd-core/dnd-hooks/useOverlayComponents';
import DroppableContainer from '../../../dnd-core/dnd-core-components/DroppableContainer/DroppableContainer';
import { useScheduleStore } from '@/lib/hooks/stores/useScheduleStore';
import useAuxiliaryStore from '@/lib/hooks/stores/useAuxiliaryStore';
import useScheduleHandlers from '../../../dnd-core/dnd-hooks/useScheduleHandlers';
import { EMPTY, PLACEHOLDER_ID } from '@/lib/constants';
import { CoursesBySemesterID, CourseID } from '@/lib/types/models';
import {
  calculateRunningCredits,
  getStudentStatus,
} from '../../../../../../lib/utils/calculations/credits';
import { getColor, dropAnimation } from '../../../dnd-core/dnd-utils';
import NotesBox from './components/NotesBox';
import { useSettingsStore } from '@/lib/hooks/stores/useSettingsStore';
import MenuContainer from './components/MenuContainer';
import { Info } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import {
  validateScheduleBoard,
  CourseMap,
  ScheduleBoard as ValidationScheduleBoard,
} from '@/lib/utils/validation/prereqValidation';

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
  const [invalidCourses, setInvalidCourses] = useState<Set<CourseID>>(
    new Set()
  );
  const [errorVisible, setErrorVisible] = useState(false);
  const { validatePrerequisites } = useSettingsStore((state) => state.general);

  const validateScheduleAsync = async () => {
    if (!validatePrerequisites) {
      return new Set<CourseID>();
    }

    // Convert the data structure to match what validateScheduleBoard expects
    const board = semesterOrder.map(
      (semesterId) => coursesBySemesterID[semesterId]
    ) as ValidationScheduleBoard;

    // Run validation in the next event loop tick
    return new Promise<Set<CourseID>>((resolve) => {
      setTimeout(() => {
        const invalidCourses = validateScheduleBoard(
          board,
          courses as CourseMap
        );
        resolve(invalidCourses);
      }, 0);
    });
  };

  // Trigger validation when schedule changes
  useEffect(() => {
    const runValidation = async () => {
      const invalidCourseIds = await validateScheduleAsync();
      setInvalidCourses(invalidCourseIds);
      const isValid = invalidCourseIds.size === 0;

      // Set error visibility with a slight delay for animation purposes
      if (!isValid && validatePrerequisites) {
        setTimeout(() => {
          setErrorVisible(true);
        }, 100);
      } else {
        setErrorVisible(false);
      }
    };

    runValidation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [semesterOrder, coursesBySemesterID, courses, validatePrerequisites]);

  const { showQuarterlyStudentTitlesOnSemesterTitles } = useSettingsStore(
    (state) => state.visuals
  );

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

  const { handleAddColumn, handleEditSemester, handleRemoveCourse } =
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

    const status = getStudentStatus(runningCredits);

    const studentStatus = showQuarterlyStudentTitlesOnSemesterTitles
      ? ` - ${status}`
      : '';

    // Handle info button click
    const handleInfoClick = (e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent event from bubbling up
      setCurrentInfo(containerId as string, 'semester');
    };

    // Use currentInfoID from the component scope instead of calling the hook here
    const isCurrentSemester = containerId === currentInfoID;

    const indicatorColor = (() => {
      if (status === 'Senior' || status === 'Junior') return 'bg-white';
      return 'bg-neutral';
    })();

    return (
      <div className='relative flex w-full items-center justify-between p-2'>
        {/* Indicator line for current semester */}
        <div className='absolute bottom-0 left-0 flex w-full justify-center'>
          <div
            className={`${indicatorColor} h-1 transition-all duration-500 ${isCurrentSemester ? 'w-12' : 'w-0'}`}
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
            <div
              className={`mx-4 mb-4 overflow-hidden transition-all duration-500 ${
                errorVisible && validatePrerequisites
                  ? 'max-h-20 opacity-100'
                  : 'max-h-0 opacity-0'
              }`}
            >
              <div className='rounded bg-red-400 p-2 text-center font-bold text-white'>
                Error: Your schedule contains courses with unsatisfied or
                out-of-order prerequisites.
              </div>
            </div>
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
                    style={{}}
                    unstyled={minimal}
                    onRemove={() => handleEditSemester(containerId)}
                  >
                    <SortableContext
                      items={coursesBySemesterID[containerId]}
                      strategy={strategy}
                    >
                      {coursesBySemesterID[containerId].map((value, index) => {
                        const isInvalid = invalidCourses.has(value);
                        return (
                          <SortableItem
                            key={value}
                            onRemove={() =>
                              handleRemoveCourse(value, containerId)
                            }
                            disabled={isSortingContainer}
                            course={courses[value]}
                            id={value}
                            index={index}
                            handle={handle}
                            style={getItemStyles}
                            wrapperStyle={wrapperStyle}
                            containerId={containerId}
                            showCores
                            error={isInvalid}
                            getIndex={() => {
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
                  {/* <DroppableContainer
                    id='populate-placeholder'
                    disabled={isSortingContainer}
                    items={EMPTY}
                    onClick={handlePopulateSchedule}
                    placeholder
                    as='button'
                  >
                    Populate with dummy data
                  </DroppableContainer> */}
                </>
              )}
            </div>
          </div>
        </SortableContext>
      </div>
      {createPortal(
        <DragOverlay adjustScale={adjustScale} dropAnimation={dropAnimation}>
          {/* Determine what to render in the drag overlay based on what's being dragged */}
          {activeID && (
            <>
              {semesterOrder.includes(activeID)
                ? // When dragging a semester container
                  RenderContainerDragOverlay(activeID)
                : // When dragging a course item
                  renderSortableItemDragOverlay(activeID)}
            </>
          )}
        </DragOverlay>,
        document.body
      )}
    </>
  );
}
