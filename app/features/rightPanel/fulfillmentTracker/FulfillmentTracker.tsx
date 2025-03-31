'use client';

import { useEffect, useState } from 'react';
import { useProgramsStore } from '@/lib/hooks/stores/useProgramsStore';
import { useScheduleStore } from '@/lib/hooks/stores/useScheduleStore';
import ProgramCard from './ProgramCard';
import { useShallow } from 'zustand/react/shallow';

export default function FulfillmentTracker() {
  const {
    availablePrograms,
    selectedPrograms,
    programEvaluations,
    selectProgram,
    deselectProgram,
    evaluateSelectedPrograms,
    loadAvailablePrograms,
  } = useProgramsStore(
    useShallow((state) => ({
      availablePrograms: state.availablePrograms,
      selectedPrograms: state.selectedPrograms,
      programEvaluations: state.programEvaluations,
      selectProgram: state.selectProgram,
      deselectProgram: state.deselectProgram,
      evaluateSelectedPrograms: state.evaluateSelectedPrograms,
      loadAvailablePrograms: state.loadAvailablePrograms,
    }))
  );

  const { coursesBySemesterID, courses, semesterOrder } = useScheduleStore();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Use the store's loadAvailablePrograms function
    setIsLoading(true);
    loadAvailablePrograms()
      .then(() => setIsLoading(false))
      .catch((error) => {
        console.error('Failed to load programs:', error);
        setIsLoading(false);
      });
  }, [loadAvailablePrograms]);

  useEffect(() => {
    if (selectedPrograms.length > 0) {
      // Convert the schedule into the format expected by the evaluation functions
      const scheduleBoard = semesterOrder.map(
        (semesterId) => (coursesBySemesterID[semesterId] || []) as string[]
      );

      evaluateSelectedPrograms(scheduleBoard, courses);
    }
  }, [selectedPrograms, coursesBySemesterID, evaluateSelectedPrograms]);

  const isProgramSelected = (programName: string) => {
    return selectedPrograms.includes(programName);
  };

  // This function is still used internally but not exposed through UI buttons
  const handleToggleProgramSelection = (programName: string) => {
    if (isProgramSelected(programName)) {
      deselectProgram(programName);
    } else {
      selectProgram(programName);
    }
  };

  return (
    <div className='h-full overflow-y-auto p-2'>
      <h2 className='mb-4 text-xl font-bold'>Program Tracker</h2>

      <div className='text-base-content/70 mb-4 text-sm'>
        Showing program evaluation based on your current schedule.
      </div>

      {isLoading ? (
        <div className='alert alert-info'>
          <span>Loading available programs...</span>
        </div>
      ) : availablePrograms.length === 0 ? (
        <div className='alert alert-warning'>
          <span>No programs available. Please check your configuration.</span>
        </div>
      ) : (
        <div className='space-y-4'>
          {availablePrograms.map((programName) => (
            <ProgramCard
              key={programName}
              programName={programName}
              isSelected={isProgramSelected(programName)}
              programEvaluations={programEvaluations}
              onToggleSelection={handleToggleProgramSelection}
            />
          ))}
        </div>
      )}
    </div>
  );
}
