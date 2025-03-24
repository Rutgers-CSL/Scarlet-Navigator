import { UniqueIdentifier } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { Item } from '../Item/Item';
import { getColor } from '../../dnd-utils';
import { SEARCH_ITEM_DELIMITER } from '@/lib/constants';
import { useMemo } from 'react';
import { Course } from '@/lib/types/models';
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
  course: Course;
  onRemove?: () => void;
}

export default function SortableItem({
  disabled,
  id,
  index,
  handle,
  containerId,
  showCores = true,
  course,
  onRemove,
}: SortableItemProps) {
  const {
    setNodeRef,
    setActivatorNodeRef,
    listeners,
    isDragging,
    isSorting,
    transform,
    transition,
  } = useSortable({
    id,
  });

  const isSearchItem = useMemo(
    () => id.toString().endsWith(SEARCH_ITEM_DELIMITER),
    [id]
  );

  // intentional blank dependency array to prevent performance issues
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoListeners = useMemo(() => listeners, [id]);
  // intentional blank dependency array to prevent performance issues
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const onRemoveProp = useMemo(() => (isSearchItem ? undefined : onRemove), []);

  if (!course) return null;
  const courseName = course.name;

  return (
    <Item
      id={id}
      ref={disabled ? undefined : setNodeRef}
      disabled={disabled}
      value={courseName}
      course={course}
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
