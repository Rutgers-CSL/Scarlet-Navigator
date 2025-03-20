import { SortableItem } from '@/app/features/dnd-core/dnd-core-components/SortableItem';
import { useScheduleStore } from '@/lib/hooks/stores/useScheduleStore';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { COURSE_POOL_CONTAINER_ID } from './CourseCreation';
import { DroppableContainer } from '@/app/features/dnd-core/dnd-core-components/DroppableContainer';
import useAuxiliaryStore from '@/lib/hooks/stores/useAuxiliaryStore';

function CoursePool() {
  const coursesBySemesterID = useScheduleStore(
    (state) => state.coursesBySemesterID
  );
  const items = coursesBySemesterID[COURSE_POOL_CONTAINER_ID] || [];
  const currentInfoID = useAuxiliaryStore((state) => state.currentInfoID);

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
                containerId={COURSE_POOL_CONTAINER_ID}
                currentInfoID={
                  // we set to null to prevent re-renders
                  // so each item doesn't re-render when the currentInfoID changes
                  // only when the currentInfoID is the same as the item,
                  // then we re-render
                  currentInfoID === value ? value : null
                }
                key={value}
                id={value}
                index={0}
                handle={false}
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
