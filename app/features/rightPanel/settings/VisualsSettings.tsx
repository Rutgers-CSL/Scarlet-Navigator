import { useSettingsStore } from '@/lib/hooks/stores/useSettingsStore';
import { SettingsToggle, SettingsNumberInput } from './components';

export default function VisualsSettings() {
  const resetVisuals = useSettingsStore((state) => state.resetVisuals);

  return (
    <div className='space-y-4'>
      <div className='space-y-3'>
        <SettingsNumberInput
          settingKey='goalCreditsForGraduation'
          label='Goal Credits for Graduation'
          min={0}
          max={200}
        />
        <SettingsToggle
          settingKey='progressivelyDarkenSemestersBasedOnCreditGoal'
          label='Progressively Darken Semesters'
        />
        <SettingsToggle settingKey='showGrades' />
        <SettingsToggle settingKey='showCoreLabelsInCoursesInsideScheduleBoard' />
        <SettingsToggle
          settingKey='showGPAsInSemesterTitles'
          label='Show GPAs in Semester Titles'
        />
        <SettingsToggle settingKey='showCreditCountOnCourseTitles' />
        <SettingsToggle
          settingKey='showQuarterlyStudentTitlesOnSemesterTitles'
          label='Show Student Credit Standing'
        />
      </div>
      <div className='flex items-center justify-between'>
        <button onClick={resetVisuals} className='btn btn-sm btn-neutral'>
          Reset to Defaults
        </button>
      </div>
    </div>
  );
}
