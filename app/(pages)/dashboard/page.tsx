'use client';

import RightPanel from '@/app/features/rightPanel/RightPanel';
import LeftPanel from '@/app/features/leftPanel/LeftPanel';
import { MiddlePanel } from '@/app/features/middlePanel/MiddlePanel';
import { coordinateGetter } from '@/app/features/dnd-core/multipleContainersKeyboardCoordinates';
import { collisionDetectionStrategy as detectionStrategy } from '@/app/features/dnd-core/dnd-utils';
import useDragHandlers from '@/app/features/dnd-core/dnd-hooks/useDragHandlers';
import useAuxiliaryStore from '@/lib/hooks/stores/useAuxiliaryStore';
import { useScheduleStore } from '@/lib/hooks/stores/useScheduleStore';
import { CoursesBySemesterID } from '@/lib/types/models';
import {
  CollisionDetection,
  DndContext,
  KeyboardSensor,
  MeasuringStrategy,
  MouseSensor,
  TouchSensor,
  UniqueIdentifier,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useKeyboardShortcuts } from '@/lib/hooks/useKeyboardShortcuts';

const Page: React.FC = () => {
  useKeyboardShortcuts();

  const scheduleState = useScheduleStore();
  const {
    setRecentlyMovedToNewContainer,
    recentlyMovedToNewContainer,
    activeID,
  } = useAuxiliaryStore.getState();

  const recentlyMovedToNewContainerInstance = useRef(false);
  const [leftWidth, setLeftWidth] = useState(250); // minimum width for left panel
  const [rightWidth, setRightWidth] = useState(300); // minimum width for right panel
  const [isDraggingLeft, setIsDraggingLeft] = useState(false);
  const [isDraggingRight, setIsDraggingRight] = useState(false);

  useEffect(() => {
    setRecentlyMovedToNewContainer(recentlyMovedToNewContainerInstance);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const lastOverId = useRef<UniqueIdentifier | null>(null);
  const [clonedItems, setClonedItems] = useState<CoursesBySemesterID | null>(
    null
  );

  const { coursesBySemesterID } = scheduleState;

  const { handleDragStart, handleDragOver, handleDragEnd, handleDragCancel } =
    useDragHandlers(clonedItems, setClonedItems);

  const sensorOptions = {
    activationConstraint: {
      distance: 5,
    },
  };

  const sensors = useSensors(
    useSensor(MouseSensor, sensorOptions),
    useSensor(TouchSensor, sensorOptions),
    useSensor(KeyboardSensor, {
      coordinateGetter,
    })
  );

  const collisionDetectionStrategy: CollisionDetection = useCallback(
    (args) =>
      detectionStrategy(
        args,
        activeID,
        lastOverId,
        coursesBySemesterID,
        recentlyMovedToNewContainer
      ),
    [activeID, coursesBySemesterID, recentlyMovedToNewContainer]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDraggingLeft) {
        const newWidth = Math.max(200, e.clientX);
        setLeftWidth(newWidth);
      }
      if (isDraggingRight) {
        const newWidth = Math.max(250, window.innerWidth - e.clientX);
        setRightWidth(newWidth);
      }
    },
    [isDraggingLeft, isDraggingRight]
  );

  const handleMouseUp = useCallback(() => {
    setIsDraggingLeft(false);
    setIsDraggingRight(false);
  }, []);

  useEffect(() => {
    if (isDraggingLeft || isDraggingRight) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingLeft, isDraggingRight, handleMouseMove, handleMouseUp]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetectionStrategy}
      measuring={{
        droppable: {
          strategy: MeasuringStrategy.Always,
        },
      }}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className='relative flex h-screen w-full flex-row'>
        {/* Left Panel */}
        <div
          style={{ width: leftWidth, minWidth: 200 }}
          className='h-full flex-shrink-0 overflow-y-scroll transition-[overflow] duration-300'
        >
          <LeftPanel />
        </div>

        {/* Left Resize Handle */}
        <div
          className='group relative w-1 cursor-col-resize hover:bg-blue-400'
          onMouseDown={() => setIsDraggingLeft(true)}
        />

        {/* Middle Panel */}
        <div className='h-full flex-grow overflow-y-scroll transition-[overflow] duration-300'>
          <MiddlePanel />
        </div>

        {/* Right Resize Handle */}
        <div
          className='group relative w-1 cursor-col-resize hover:bg-blue-400'
          onMouseDown={() => setIsDraggingRight(true)}
        />

        {/* Right Panel */}
        <div
          style={{ width: rightWidth, minWidth: 250 }}
          className='h-full flex-shrink-0 overflow-y-scroll transition-[overflow] duration-300'
        >
          <RightPanel />
        </div>
      </div>
    </DndContext>
  );
};

export default Page;
