import { UniqueIdentifier } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { animateLayoutChanges } from '../../utils/dnd';
import { ContainerProps, Container } from '.';
import { CSS } from '@dnd-kit/utilities';
import { useScheduleStore } from '@/lib/hooks/stores/useScheduleStore';
import { useSettingsStore } from '@/lib/hooks/stores/useSettingsStore';
import {
  calculateRunningCredits,
  getHeaderColorClass,
} from '../../utils/credits';

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

  const progressivelyDarken = useSettingsStore(
    (state) => state.visuals.progressivelyDarkenSemestersBasedOnCreditGoal
  );
  const semesterOrder = useScheduleStore((state) => state.semesterOrder);
  const coursesBySemesterID = useScheduleStore(
    (state) => state.coursesBySemesterID
  );
  const courses = useScheduleStore((state) => state.courses);

  let headerColorClass = '';
  if (progressivelyDarken && typeof id === 'string' && id !== 'placeholder') {
    const totalCredits = calculateRunningCredits(
      semesterOrder,
      coursesBySemesterID,
      courses,
      id
    );
    headerColorClass = getHeaderColorClass(totalCredits);
  }

  return (
    <Container
      ref={disabled ? undefined : setNodeRef}
      style={{
        ...style,
        transition,
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.5 : undefined,
      }}
      hover={isOverContainer}
      handleProps={{
        ...attributes,
        ...listeners,
      }}
      columns={columns}
      headerClassName={headerColorClass}
      {...props}
    >
      {children}
    </Container>
  );
}
