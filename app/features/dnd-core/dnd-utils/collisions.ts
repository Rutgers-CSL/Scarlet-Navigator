import {
  closestCenter,
  pointerWithin,
  rectIntersection,
  getFirstCollision,
  CollisionDetection,
  Collision,
} from '@dnd-kit/core';
import { SEARCH_CONTAINER_ID, SEARCH_ITEM_DELIMITER } from '@/lib/constants';

/**
 * This is meant to prevent any re-arrangement animations from occurring in the
 * search container.
 */
export const customCollisionDetectionStrategy = (
  args: Parameters<CollisionDetection>[0]
): Collision[] => {
  const { active } = args;

  const pointerIntersections = pointerWithin(args);
  const intersections =
    pointerIntersections.length > 0
      ? // If there are droppables intersecting with the pointer, return those
        pointerIntersections
      : rectIntersection(args);

  let overId = getFirstCollision(intersections, 'id');

  const isSearchItem = active.id.toString().endsWith(SEARCH_ITEM_DELIMITER);
  const isOverItemWithSearchDelimiter = overId
    ?.toString()
    .endsWith(SEARCH_ITEM_DELIMITER);

  console.log('from the collisions', active.id, overId);

  // Here, we are saying that if we are dragging a search item
  // within the search container, return 0 collisions detected
  // to prevent automatic re-arrangement.
  if (
    isSearchItem &&
    (isOverItemWithSearchDelimiter || overId === SEARCH_CONTAINER_ID)
  ) {
    return [{ id: active.id }];
  }

  return closestCenter({
    ...args,
  });
};
