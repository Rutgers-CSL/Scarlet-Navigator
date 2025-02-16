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
import { useDraggable } from '@/lib/hooks/useDraggable';
import {
  LEFT_PANEL_KEY,
  LEFT_PANEL_MIN_WIDTH,
  LEFT_PANEL_DEFAULT_WIDTH,
  RIGHT_PANEL_KEY,
  RIGHT_PANEL_MIN_WIDTH,
  RIGHT_PANEL_DEFAULT_WIDTH,
} from '@/lib/constants';
import useMountStatus from '@/lib/hooks/useMountStatus';
import DashboardSkeleton from '@/app/components/DashboardSkeleton';

const Page: React.FC = () => {
  useKeyboardShortcuts();

  const scheduleState = useScheduleStore();
  const {
    setRecentlyMovedToNewContainer,
    recentlyMovedToNewContainer,
    activeID,
  } = useAuxiliaryStore.getState();

  const recentlyMovedToNewContainerInstance = useRef(false);

  const { DragHandle: LeftDragHandle, dimensionValue: leftPanelWidth } =
    useDraggable({
      dimensionValueModifier: (delta) =>
        Math.max(LEFT_PANEL_MIN_WIDTH, leftPanelWidth + delta),
      direction: 'horizontal',
      key: LEFT_PANEL_KEY,
      defaultValue: LEFT_PANEL_DEFAULT_WIDTH,
    });

  const { DragHandle: RightDragHandle, dimensionValue: rightPanelWidth } =
    useDraggable({
      dimensionValueModifier: (delta) =>
        Math.max(RIGHT_PANEL_MIN_WIDTH, rightPanelWidth - delta),
      direction: 'horizontal',
      key: RIGHT_PANEL_KEY,
      defaultValue: RIGHT_PANEL_DEFAULT_WIDTH,
    });

  const isMounted = useMountStatus();

  const lastOverId = useRef<UniqueIdentifier | null>(null);
  const [clonedItems, setClonedItems] = useState<CoursesBySemesterID | null>(
    null
  );

  const { coursesBySemesterID } = scheduleState;

  const {
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
    handleDragMove,
  } = useDragHandlers(clonedItems, setClonedItems);

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

  useEffect(() => {
    setRecentlyMovedToNewContainer(recentlyMovedToNewContainerInstance);
  }, [setRecentlyMovedToNewContainer]);

  const leftPanelStyle = {
    width: leftPanelWidth,
    minWidth: LEFT_PANEL_MIN_WIDTH,
  };

  const rightPanelStyle = {
    width: rightPanelWidth,
    minWidth: RIGHT_PANEL_MIN_WIDTH,
  };

  if (!isMounted) {
    return <DashboardSkeleton />;
  }

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
      onDragMove={handleDragMove}
    >
      <div className='relative flex h-screen w-full flex-row'>
        {/* Left Panel */}
        <div
          style={leftPanelStyle}
          className='relative h-full shrink-0 transition-[overflow] duration-300'
        >
          <LeftPanel />
          <LeftDragHandle className='absolute top-0 -right-1' />
        </div>

        {/* Left Resize Handle */}

        {/* Middle Panel */}
        <div className='h-full grow overflow-y-scroll transition-[overflow] duration-300'>
          <MiddlePanel />
        </div>

        {/* Right Panel */}
        <div
          style={rightPanelStyle}
          className='relative h-full shrink-0 transition-[overflow] duration-300'
        >
          {/* Right Resize Handle */}
          <RightDragHandle className='absolute -left-1' />
          <RightPanel />
        </div>
      </div>
    </DndContext>
  );
};

export default Page;
