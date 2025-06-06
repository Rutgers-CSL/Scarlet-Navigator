import { UniqueIdentifier } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { animateLayoutChanges } from '../../dnd-utils';
import { ContainerProps, Container } from '../..';
import { CSS } from '@dnd-kit/utilities';
import { useScheduleStore } from '@/lib/hooks/stores/useScheduleStore';
import {
  calculateRunningCredits,
  getHeaderColorClass,
} from '@/lib/utils/calculations/credits';
import { COURSE_POOL_CONTAINER_ID } from '@/app/(app)/dashboard/panels/leftPanel/tabs/CourseCreation';
import { useState } from 'react';

export default function DroppableContainer({
  children,
  columns = 1,
  disabled,
  id,
  items,
  style,
  ...props
}: ContainerProps & {
  disabled?: boolean;
  id: UniqueIdentifier;
  items: UniqueIdentifier[];
  style?: React.CSSProperties;
}) {
  const [isHovered, setIsHovered] = useState(false);

  const {
    active,
    attributes,
    isDragging,
    listeners,
    over,
    setNodeRef,
    transition,
    transform,
  } = useSortable({
    id,
    data: {
      type: 'container',
      children: items,
    },
    animateLayoutChanges,
  });

  const isOverContainer = over
    ? (id === over.id && active?.data.current?.type !== 'container') ||
      items.includes(over.id)
    : false;

  const semesterOrder = useScheduleStore((state) => state.semesterOrder);
  const coursesBySemesterID = useScheduleStore(
    (state) => state.coursesBySemesterID
  );
  const courses = useScheduleStore((state) => state.courses);

  let headerColorClass = '';
  if (typeof id === 'string' && id !== 'placeholder') {
    const totalCredits = calculateRunningCredits(
      semesterOrder,
      coursesBySemesterID,
      courses,
      id
    );
    headerColorClass = getHeaderColorClass(totalCredits);
  }

  const isCoursePool = id === COURSE_POOL_CONTAINER_ID;

  return (
    <Container
      ref={disabled ? undefined : setNodeRef}
      style={{
        ...style,
        transition,
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.5 : undefined,
        backgroundColor: isCoursePool
          ? 'var(--color-base-300)'
          : 'var(--color-base-100)',
        boxShadow: !isCoursePool ? '0 0 10px 0 rgba(0, 0, 0, 0.1)' : 'none',
        border: isCoursePool ? '1px solid var(--color-base-00)' : 'none',
      }}
      hover={isOverContainer}
      handleProps={{
        ...attributes,
        ...listeners,
      }}
      columns={columns}
      headerClassName={headerColorClass}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      isHovered={isHovered}
      {...props}
    >
      {children}
    </Container>
  );
}
