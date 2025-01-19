import { COURSE_POOL_CONTAINER_ID } from '@/app/features/leftPanel/courseCreation/CourseCreation';
import { CoursesBySemesterID } from '@/lib/types/models';
import { UniqueIdentifier } from '@dnd-kit/core';

export const findContainer = (
  items: CoursesBySemesterID,
  id: UniqueIdentifier
) => {
  if (id in items) {
    return id;
  }

  const container = Object.keys(items).find((key) => items[key].includes(id));
  return container;
};

export const getIndex = (items: CoursesBySemesterID, id: UniqueIdentifier) => {
  const container = findContainer(items, id);

  if (container === COURSE_POOL_CONTAINER_ID) {
    return 0;
  }

  if (!container) {
    return -1;
  }

  const index = items[container].indexOf(id);

  return index;
};

export const getNextContainerId = (items: CoursesBySemesterID) => {
  const containerIds = Object.keys(items);
  const lastContainerId = containerIds[containerIds.length - 1];

  return String.fromCharCode(lastContainerId.charCodeAt(0) + 1);
};
