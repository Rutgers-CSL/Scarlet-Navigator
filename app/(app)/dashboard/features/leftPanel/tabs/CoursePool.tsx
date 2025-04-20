import { SortableItem } from '@/app/(app)/dashboard/features/dnd-core/dnd-core-components/SortableItem';
import { useScheduleStore } from '@/lib/hooks/stores/useScheduleStore';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { COURSE_POOL_CONTAINER_ID } from './CourseCreation';
import { DroppableContainer } from '@/app/(app)/dashboard/features/dnd-core/dnd-core-components/DroppableContainer';

function CoursePool() {
  const coursesBySemesterID = useScheduleStore(
    (state) => state.coursesBySemesterID
  );
  const courses = useScheduleStore((state) => state.courses);
  const items = coursesBySemesterID[COURSE_POOL_CONTAINER_ID] || [];

  const handleRemoveCourse = useScheduleStore((state) => state.removeCourse);

  return (
    <div className='card bg-base-100'>
      <div className='card-body bg-base-100'>
        <h2 className='card-title'>Saved for Later</h2>
        <DroppableContainer
          key={COURSE_POOL_CONTAINER_ID}
          id={COURSE_POOL_CONTAINER_ID}
          items={items}
        >
          <SortableContext items={items} strategy={verticalListSortingStrategy}>
            {items.map((value) => (
              <SortableItem
                course={courses[value]}
                containerId={COURSE_POOL_CONTAINER_ID}
                key={value}
                id={value}
                index={0}
                handle={false}
                style={() => ({})}
                wrapperStyle={() => ({})}
                getIndex={() => 0}
                onRemove={() =>
                  handleRemoveCourse(value, COURSE_POOL_CONTAINER_ID)
                }
              />
            ))}
          </SortableContext>
        </DroppableContainer>
      </div>
    </div>
  );
}

export default CoursePool;
