import { UniqueIdentifier } from '@dnd-kit/core';
import { unstable_batchedUpdates } from 'react-dom';
import { useScheduleStore } from '@/lib/hooks/stores/useScheduleStore';
import useAuxiliaryStore from '@/lib/hooks/stores/useAuxiliaryStore';
import { useSettingsStore } from '@/lib/hooks/stores/useSettingsStore';
import { calculateSemesterTitle } from '@/lib/utils/calculations/semesterTitle';
import { useShallow } from 'zustand/react/shallow';

export default function useScheduleHandlers() {
  const items = useScheduleStore((state) => state.coursesBySemesterID);
  const containers = useScheduleStore((state) => state.semesterOrder);
  const setSemesterOrder = useScheduleStore((state) => state.setSemesterOrder);
  const setCoursesBySemesterID = useScheduleStore(
    (state) => state.setCoursesBySemesterID
  );
  const _reset_ = useScheduleStore((state) => state.______reset______);
  const setCurrentInfo = useAuxiliaryStore((state) => state.setCurrentInfo);

  const { beginningTerm, beginningYear, includeWinterAndSummerTerms } =
    useSettingsStore((state) => state.general);

  const { removeCourse, updateSemester } = useScheduleStore(
    useShallow((state) => ({
      removeCourse: state.removeCourse,
      updateSemester: state.updateSemester,
    }))
  );

  const handleAddColumn = () => {
    const newContainerId = `semester${new Date().getTime()}`;
    const newItems = {
      ...items,
      [newContainerId]: [],
    };

    // Save current state to history before making changes
    // const currentState = useScheduleStore.getState();
    // addToHistory(currentState);

    // Calculate the semester title based on settings
    const semesterTitle = calculateSemesterTitle(
      beginningTerm,
      beginningYear,
      containers.length,
      includeWinterAndSummerTerms
    );

    // Create new semester with title
    const newSemester = {
      id: newContainerId,
      courses: [],
      title: semesterTitle,
    };

    // Update both states atomically
    unstable_batchedUpdates(() => {
      setSemesterOrder([...containers, newContainerId]);
      setCoursesBySemesterID(newItems, true); // Skip history for this call since we already saved it
      updateSemester(newContainerId, newSemester);
    });
  };

  const handlePopulateSchedule = () => {
    unstable_batchedUpdates(() => {
      _reset_();
    });
  };

  const handleEditSemester = (containerID: UniqueIdentifier) => {
    setCurrentInfo(containerID as string, 'semester');
  };

  const handleRemoveCourse = (
    courseID: UniqueIdentifier,
    containerID: UniqueIdentifier
  ) => {
    removeCourse(courseID as string, containerID);
    setCurrentInfo('', 'course');
  };

  return {
    handleEditSemester,
    handleRemoveCourse,
    handleAddColumn,
    handlePopulateSchedule,
  };
}
