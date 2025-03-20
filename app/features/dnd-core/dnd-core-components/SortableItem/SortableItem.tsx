import { UniqueIdentifier } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { Item } from '../Item/Item';
import { getColor } from '../../dnd-utils';
import useScheduleHandlers from '../../dnd-hooks/useScheduleHandlers';
import { useScheduleStore } from '@/lib/hooks/stores/useScheduleStore';
import { SEARCH_ITEM_DELIMITER } from '@/lib/constants';
import { useCallback, useMemo } from 'react';
import { CourseID } from '@/lib/types/models';

interface SortableItemProps {
  containerId: UniqueIdentifier;
  id: UniqueIdentifier;
  index: number;
  handle: boolean;
  disabled?: boolean;
  style(args: any): React.CSSProperties;
  getIndex(id: UniqueIdentifier): number;
  wrapperStyle({ index }: { index: number }): React.CSSProperties;
  showCores?: boolean;
  currentInfoID: CourseID | null;
}

export default function SortableItem({
  disabled,
  id,
  index,
  handle,
  style,
  containerId,
  getIndex,
  wrapperStyle,
  showCores = true,
  currentInfoID,
}: SortableItemProps) {
  const {
    setNodeRef,
    setActivatorNodeRef,
    listeners,
    isDragging,
    isSorting,
    over,
    overIndex,
    transform,
    transition,
  } = useSortable({
    id,
  });
  const { handleRemoveCourse } = useScheduleHandlers();
  const onRemove = useCallback(() => {
    handleRemoveCourse(id, containerId);
  }, [id, containerId, handleRemoveCourse]);
  const course = useScheduleStore((state) => state.courses[id as string]);
  const isSearchItem = useMemo(
    () => id.toString().endsWith(SEARCH_ITEM_DELIMITER),
    [id]
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoListeners = useMemo(() => listeners, [id]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const onRemoveProp = useMemo(() => (isSearchItem ? undefined : onRemove), []);

  if (!course) return null;
  const courseName = course.name;

  return (
    <Item
      id={id}
      ref={disabled ? undefined : setNodeRef}
      currentInfoID={currentInfoID}
      disabled={disabled}
      value={courseName}
      onRemove={onRemoveProp}
      dragging={isDragging}
      sorting={isSorting}
      handle={handle}
      handleProps={handle ? { ref: setActivatorNodeRef } : undefined}
      index={index}
      // wrapperStyle={memoWrapperStyle({ index })}
      color={getColor(id)}
      transition={transition}
      transform={transform}
      listeners={memoListeners}
      showCores={showCores}
    />
  );
}
