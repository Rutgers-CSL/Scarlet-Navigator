'use client';

import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  CancelDrop,
  DragOverlay,
  Modifiers,
  UniqueIdentifier,
  KeyboardCoordinateGetter,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  SortingStrategy,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { coordinateGetter as multipleContainersCoordinateGetter } from "./components/multipleContainersKeyboardCoordinates";
import SortableItem from "./components/SortableItem";
import useOverlayComponents from "./helpers/hooks/useOverlayComponents";
import DroppableContainer from "./components/DroppableContainer";
import { useScheduleStore } from "@/lib/hooks/stores/useScheduleStore";
import useAuxiliaryStore from "@/lib/hooks/stores/useAuxiliaryStore";
import useHistoryStore from "@/lib/hooks/stores/useHistoryStore";
import useScheduleHandlers from "./helpers/hooks/useScheduleHandlers";
import { EMPTY, PLACEHOLDER_ID } from "@/lib/constants";
import { CoursesBySemesterID } from "@/types/models";
import { Button } from "./components/ui";
import { calculateSemesterCredits, calculateRunningCredits } from "./utils/credits";
import { getColor, dropAnimation } from "./utils/dnd";

function UndoRedoControls() {
  const { undo, redo, past, future } = useHistoryStore();

  return (
    <div className="flex justify-center gap-2 mb-4">
      <Button
        onClick={undo}
        disabled={past.length === 0}
      >
        ↩ Undo
      </Button>
      <Button
        onClick={redo}
        disabled={future.length === 0}
      >
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
  const coursesBySemesterID = useScheduleStore((state) => state.coursesBySemesterID);
  const courses = useScheduleStore((state) => state.courses);

  const { recentlyMovedToNewContainer, activeID } = useAuxiliaryStore.getState();
  const setRecentlyMovedToNewContainer = useAuxiliaryStore((state) => state.setRecentlyMovedToNewContainer);
  const moveRef = useRef(false);

  useEffect(() => {
    if (!moveRef.current) {
      moveRef.current = true;
      setRecentlyMovedToNewContainer(moveRef);
    }
  }, [setRecentlyMovedToNewContainer]);

  useEffect(() => {
    requestAnimationFrame(() => {
      if (recentlyMovedToNewContainer == null) {
        console.error('recentlyMovedToNewContainer is null! Was it set correctly with useRef?');
        return;
      }

      moveRef.current = false;
    });
  }, [coursesBySemesterID]);

  const isSortingContainer = activeID ? semesterOrder.includes(activeID) : false;
  const {
    renderContainerDragOverlay,
    renderSortableItemDragOverlay
  } = useOverlayComponents(
    coursesBySemesterID,
    handle,
    renderItem,
    getColor,
    getItemStyles,
    wrapperStyle,
  );

  const {
    handleAddColumn,
    handleRemove,
    handlePopulateSchedule,
  } = useScheduleHandlers();

  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          boxSizing: "border-box",
          padding: 20,
          width: "100%",
          height: "100%",
          overflow: "auto"
        }}
      >
        <SortableContext
          items={[...semesterOrder, PLACEHOLDER_ID]}
          strategy={rectSortingStrategy}
        >
          <div className="flex flex-col w-full h-full">
            <UndoRedoControls />
            <div className="grid grid-cols-[repeat(auto-fit,minmax(330px,1fr))] gap-x-8 gap-y-4 w-full px-4">
              {semesterOrder.map((containerId) => (
                <DroppableContainer
                  key={containerId}
                  id={containerId}
                  label={minimal ? undefined : `${containerId} (${calculateSemesterCredits(coursesBySemesterID[containerId] || [], courses)} credits, Total: ${calculateRunningCredits(semesterOrder, coursesBySemesterID, courses, containerId)})`}
                  columns={columns}
                  items={coursesBySemesterID[containerId]}
                  scrollable={scrollable}
                  style={containerStyle}
                  unstyled={minimal}
                  onRemove={() => handleRemove(containerId)}
                >
                  <SortableContext items={coursesBySemesterID[containerId]} strategy={strategy}>
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
                          getIndex={(id) => {
                            return 0;
                          }}
                        />
                      );
                    })}
                  </SortableContext>
                </DroppableContainer>
              ))}
              {minimal ? undefined : (
                <>
                  <DroppableContainer
                    id={PLACEHOLDER_ID}
                    disabled={isSortingContainer}
                    items={EMPTY}
                    onClick={handleAddColumn}
                    placeholder
                  >
                    + Add column
                  </DroppableContainer>
                  <DroppableContainer
                    id="populate-placeholder"
                    disabled={isSortingContainer}
                    items={EMPTY}
                    onClick={handlePopulateSchedule}
                    placeholder
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