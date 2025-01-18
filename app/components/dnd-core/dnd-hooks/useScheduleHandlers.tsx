import { UniqueIdentifier } from '@dnd-kit/core';
import { unstable_batchedUpdates } from 'react-dom';
import { useScheduleStore } from '@/lib/hooks/stores/useScheduleStore';
import useHistoryStore from '@/lib/hooks/stores/useHistoryStore';
import useAuxiliaryStore from '@/lib/hooks/stores/useAuxiliaryStore';

export default function useScheduleHandlers() {
  const items = useScheduleStore((state) => state.coursesBySemesterID);
  const containers = useScheduleStore((state) => state.semesterOrder);
  const setSemesterOrder = useScheduleStore((state) => state.setSemesterOrder);
  const setCoursesBySemesterID = useScheduleStore(
    (state) => state.setCoursesBySemesterID
  );
  const ___TEMP___populate = useScheduleStore(
    (state) => state.___TEMP___populate
  );
  const _reset_ = useScheduleStore((state) => state.______reset______);
  const setCurrentInfo = useAuxiliaryStore((state) => state.setCurrentInfo);

  const handleAddColumn = () => {
    const newContainerId = `semester${new Date().getTime()}`;
    const newItems = {
      ...items,
      [newContainerId]: [],
    };

    // Save current state to history before making changes
    const currentState = useScheduleStore.getState();
    useHistoryStore.getState().addToHistory(currentState);

    // Create new semester with title
    const newSemester = {
      id: newContainerId,
      courses: [],
      title: `Semester ${containers.length + 1}`,
    };

    // Update both states atomically
    unstable_batchedUpdates(() => {
      setSemesterOrder([...containers, newContainerId]);
      setCoursesBySemesterID(newItems, true); // Skip history for this call since we already saved it
      useScheduleStore.getState().updateSemester(newContainerId, newSemester);
    });
  };

  const handlePopulateSchedule = () => {
    unstable_batchedUpdates(() => {
      _reset_();
      ___TEMP___populate();
    });
  };

  const handleEditSemester = (containerID: UniqueIdentifier) => {
    setCurrentInfo(containerID as string, 'semester');
  };

  const handleRemoveCourse = (
    courseID: UniqueIdentifier,
    containerID: UniqueIdentifier
  ) => {
    console.log('handleRemoveCourse');
    const newItems = {
      ...items,
      [containerID]: items[containerID].filter((id) => id !== courseID),
    };

    setCoursesBySemesterID(newItems);
  };

  return {
    handleEditSemester,
    handleRemoveCourse,
    handleAddColumn,
    handlePopulateSchedule,
  };
}
