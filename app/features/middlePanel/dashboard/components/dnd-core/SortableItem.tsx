import useMountStatus from '@/lib/hooks/useMountStatus';
import { UniqueIdentifier } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { Item } from './Item/Item';
import { getColor } from '../../utils/dnd';
import useScheduleHandlers from '../../helpers/hooks/useScheduleHandlers';
import { useScheduleStore } from '@/lib/hooks/stores/useScheduleStore';

interface SortableItemProps {
  containerId: UniqueIdentifier;
  id: UniqueIdentifier;
  index: number;
  handle: boolean;
  disabled?: boolean;
  style(args: any): React.CSSProperties;
  getIndex(id: UniqueIdentifier): number;
  renderItem(): React.ReactElement<any>;
  wrapperStyle({ index }: { index: number }): React.CSSProperties;
  showCores?: boolean;
}

export default function SortableItem({
  disabled,
  id,
  index,
  handle,
  renderItem,
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
  const mounted = useMountStatus();
  const mountedWhileDragging = isDragging && !mounted;
  const { handleRemoveCourse } = useScheduleHandlers();

  const courseName = useScheduleStore((state) => {
    if (!state.courses[id]) return 'Loading...';

    return state.courses[id].name;
  });

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
        width: '20px',
      })}
      color={getColor(id)}
      transition={transition}
      transform={transform}
      fadeIn={mountedWhileDragging}
      listeners={listeners}
      renderItem={renderItem}
      showCores={showCores}
    />
  );
}
