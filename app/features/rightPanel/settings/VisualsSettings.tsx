import { useSettingsStore } from '@/lib/hooks/stores/useSettingsStore';
import { SettingsToggle, SettingsNumberInput } from './components';

export default function VisualsSettings() {
  const resetVisuals = useSettingsStore((state) => state.resetVisuals);

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h2 className='text-lg font-semibold'>Visual Settings</h2>
        <button
          onClick={resetVisuals}
          className='rounded-lg bg-gray-100 px-3 py-1 text-sm text-gray-600 hover:bg-gray-200'
        >
          Reset to Defaults
        </button>
      </div>
      <div className='space-y-3'>
        <SettingsToggle settingKey='showGrades' />
        <SettingsToggle settingKey='showCoreLabelsInCoursesInsideScheduleBoard' />
        <SettingsToggle settingKey='showGPAsInSemesterTitles' />
        <SettingsNumberInput
          settingKey='goalCreditsForGraduation'
          min={0}
          max={200}
        />
        <SettingsToggle settingKey='progressivelyDarkenSemestersBasedOnCreditGoal' />
        <SettingsToggle settingKey='showCreditCountOnCourseTitles' />
        <SettingsToggle settingKey='showQuarterlyStudentTitlesOnSemesterTitles' />
      </div>
    </div>
  );
}
