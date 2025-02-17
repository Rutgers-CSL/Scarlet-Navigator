import {
  closestCenter,
  pointerWithin,
  rectIntersection,
  getFirstCollision,
  CollisionDetection,
  UniqueIdentifier,
} from '@dnd-kit/core';
import { SEARCH_ITEM_DELIMITER, TRASH_ID } from '@/lib/constants';
import { RefObject } from 'react';

type Items = Record<UniqueIdentifier, UniqueIdentifier[]>;

/**
 *
 * PERSONAL NOTES:
 *
 * This collision strategy is meant to do the clean animation where the course
 * goes to its designated spot smoothly. If you remove this,
 * you will find that courses snap instantly to their designated spot.
 *
 */

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
  items: Items
) => {
  // Start by finding any intersecting droppable
  const pointerIntersections = pointerWithin(args);
  const intersections =
    pointerIntersections.length > 0
      ? // If there are droppables intersecting with the pointer, return those
        pointerIntersections
      : rectIntersection(args);
  let overId = getFirstCollision(intersections, 'id');

  if (!overId) {
    console.error('collisionDetection: overId does not exist.');
    return [];
  }

  if (overId === TRASH_ID) {
    // If the intersecting droppable is the trash, return early
    return intersections;
  }

  const draggingCourseIsSearchItem = activeId
    ?.toString()
    .endsWith(SEARCH_ITEM_DELIMITER);
  const overContainerIsSearchContainer = overId
    .toString()
    .endsWith(SEARCH_ITEM_DELIMITER);

  const userIsDraggingSearchItemWithinSearchContainer =
    draggingCourseIsSearchItem && overContainerIsSearchContainer;

  /**
   * Important Note:
   * If the user is dragging a search result within the search container,
   * we want to prevent the search container items from re-arranging.
   *
   * If the user is moving the search item OUT OF the search container, then we
   * want to allow the re-arrangement animations to occur.
   */
  if (userIsDraggingSearchItemWithinSearchContainer) {
    return closestCenter({
      ...args,
      droppableContainers: args.droppableContainers.filter(
        (container) => container.id in items
      ),
    });
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
};
