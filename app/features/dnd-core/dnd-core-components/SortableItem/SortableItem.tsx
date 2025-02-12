import { UniqueIdentifier } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { Item } from '../Item/Item';
import { getColor } from '../../dnd-utils';
import useScheduleHandlers from '../../dnd-hooks/useScheduleHandlers';
import { useScheduleStore } from '@/lib/hooks/stores/useScheduleStore';
import useAuxiliaryStore from '@/lib/hooks/stores/useAuxiliaryStore';
import { SEARCH_ITEM_DELIMITER } from '@/lib/constants';
import { useMemo } from 'react';

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

  const courseName = useMemo(() => {
    if (id.toString().endsWith(SEARCH_ITEM_DELIMITER)) {
      const searchResults = useAuxiliaryStore.getState().searchResultMap;
      if (searchResults[id]) {
        return searchResults[id].name;
      }
    }

    const courses = useScheduleStore.getState().courses;
    if (!courses[id]) return 'Loading...';
    return courses[id].name;
  }, [id]);

  return (
    <Item
      id={id}
      ref={disabled ? undefined : setNodeRef}
      value={courseName}
      onRemove={() => {
        handleRemoveCourse(id, containerId);
      }}
      dragging={isDragging}
      sorting={isSorting}
      handle={handle}
      handleProps={handle ? { ref: setActivatorNodeRef } : undefined}
      index={index}
      wrapperStyle={wrapperStyle({ index })}
      style={style({
        index,
        value: id,
        isDragging,
        isSorting,
        overIndex: over ? getIndex(over.id) : overIndex,
        containerId,
      })}
      color={getColor(id)}
      transition={transition}
      transform={transform}
      listeners={listeners}
      showCores={showCores}
    />
  );
}
