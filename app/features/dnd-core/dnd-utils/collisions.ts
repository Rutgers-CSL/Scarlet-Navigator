import {
  closestCenter,
  pointerWithin,
  rectIntersection,
  getFirstCollision,
  CollisionDetection,
  UniqueIdentifier,
} from '@dnd-kit/core';
import { TRASH_ID } from '@/lib/constants';
import { RefObject } from 'react';

type Items = Record<UniqueIdentifier, UniqueIdentifier[]>;

/**
 * Custom collision detection strategy optimized for multiple containers
 *
 * - First, find any droppable containers intersecting with the pointer.
 * - If there are none, find intersecting containers with the active draggable.
 * - If there are no intersecting containers, return the last matched intersection
 *
 */
export const collisionDetectionStrategy = (
  args: Parameters<CollisionDetection>[0],
  activeId: UniqueIdentifier | null,
  lastOverId: RefObject<UniqueIdentifier | null>,
  items: Items,
  recentlyMovedToNewContainer: RefObject<boolean> | null
) => {
  if (recentlyMovedToNewContainer == null) {
    console.error(
      'recentlyMovedToNewContainer is null! Was it set correctly with useRef?'
    );
    return [];
  }

  if (activeId && activeId in items) {
    return closestCenter({
      ...args,
      droppableContainers: args.droppableContainers.filter(
        (container) => container.id in items
      ),
    });
  }

  // Start by finding any intersecting droppable
  const pointerIntersections = pointerWithin(args);
  const intersections =
    pointerIntersections.length > 0
      ? // If there are droppables intersecting with the pointer, return those
        pointerIntersections
      : rectIntersection(args);
  let overId = getFirstCollision(intersections, 'id');

  if (overId != null) {
    if (overId === TRASH_ID) {
      // If the intersecting droppable is the trash, return early
      return intersections;
    }

    if (overId in items) {
      const containerItems = items[overId];

      // If a container is matched and it contains items (columns 'A', 'B', 'C')
      if (containerItems.length > 0) {
        // Return the closest droppable within that container
        overId = closestCenter({
          ...args,
          droppableContainers: args.droppableContainers.filter(
            (container) =>
              container.id !== overId && containerItems.includes(container.id)
          ),
        })[0]?.id;
      }
    }

    // Instead of modifying the ref directly, we return the new value
    const newOverId = overId;
    return [{ id: newOverId }];
  }

  // When a draggable item moves to a new container, the layout may shift
  // and the `overId` may become `null`. We return the activeId as the new overId
  if (recentlyMovedToNewContainer.current && activeId) {
    return [{ id: activeId }];
  }

  return [];
};
