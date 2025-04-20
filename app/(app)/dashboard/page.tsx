'use client';

import RightPanel from './features/rightPanel/RightPanel';
import LeftPanel from './features/leftPanel/LeftPanel';
import { MiddlePanel } from './features/middlePanel/MiddlePanel';
import { coordinateGetter } from './features/dnd-core/multipleContainersKeyboardCoordinates';
import { customCollisionDetectionStrategy } from './features/dnd-core/dnd-utils';
import useDragHandlers from './features/dnd-core/dnd-hooks/useDragHandlers';
import { CoursesBySemesterID } from '@/lib/types/models';
import {
  DndContext,
  KeyboardSensor,
  MeasuringStrategy,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { useState, useMemo } from 'react';
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
// import DashboardSkeleton from '@/app/(pages)/dashboard/components/DashboardSkeleton';
import Link from 'next/link';
import DashboardSkeleton from '@/app/(app)/dashboard/components/DashboardSkeleton';

const Page: React.FC = () => {
  useKeyboardShortcuts();
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
  const [clonedItems, setClonedItems] = useState<CoursesBySemesterID | null>(
    null
  );

  const {
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
    handleDragMove,
  } = useDragHandlers(clonedItems, setClonedItems);

  const sensorOptions = useMemo(
    () => ({
      activationConstraint: {
        distance: 5,
      },
    }),
    []
  );

  const sensors = useSensors(
    useSensor(MouseSensor, sensorOptions),
    useSensor(TouchSensor, sensorOptions),
    useSensor(KeyboardSensor, {
      coordinateGetter,
    })
  );

  const leftPanelStyle = useMemo(
    () => ({
      width: leftPanelWidth,
      minWidth: LEFT_PANEL_MIN_WIDTH,
    }),
    [leftPanelWidth]
  );

  const rightPanelStyle = useMemo(
    () => ({
      width: rightPanelWidth,
      minWidth: RIGHT_PANEL_MIN_WIDTH,
    }),
    [rightPanelWidth]
  );

  if (!isMounted) {
    return <DashboardSkeleton />;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={customCollisionDetectionStrategy}
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
      <div className='visible flex h-screen w-full flex-col items-center justify-center px-10 sm:hidden'>
        <div className='text-center text-2xl font-bold'>
          Scarlet Navigator is not available on mobile (for now).
          <br />
          <button className='btn my-4 bg-red-400 text-white'>
            <Link href='/'> Return to home page</Link>
          </button>
        </div>
      </div>
      <div className='relative hidden h-screen w-full flex-row sm:flex'>
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
