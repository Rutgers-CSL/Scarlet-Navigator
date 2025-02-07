import { SortableItem } from '@/app/features/dnd-core/dnd-core-components/SortableItem';
import { useScheduleStore } from '@/lib/hooks/stores/useScheduleStore';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { COURSE_POOL_CONTAINER_ID } from '../CourseCreation';
import { DroppableContainer } from '@/app/features/dnd-core/dnd-core-components/DroppableContainer';

function CoursePool() {
  const coursesBySemesterID = useScheduleStore(
    (state) => state.coursesBySemesterID
  );
  const courses = useScheduleStore((state) => state.courses);
  const items = coursesBySemesterID[COURSE_POOL_CONTAINER_ID] || [];

  return (
    <div className='card bg-base-100 w-96'>
      <div className='card-body bg-base-200'>
        <h2 className='card-title'>Saved for Later</h2>
        <DroppableContainer id={COURSE_POOL_CONTAINER_ID} items={items}>
          <SortableContext items={items} strategy={verticalListSortingStrategy}>
            {items.map((value) => (
              <SortableItem
                containerId={COURSE_POOL_CONTAINER_ID}
                key={value}
                id={value}
                index={0}
                handle={false}
                renderItem={() => (
                  <div className='p-2'>
                    {courses[value]?.name || 'Loading...'}
                  </div>
                )}
                style={() => ({})}
                wrapperStyle={() => ({})}
                getIndex={() => 0}
              />
            ))}
          </SortableContext>
        </DroppableContainer>
      </div>
    </div>
  );
}

export default CoursePool;
