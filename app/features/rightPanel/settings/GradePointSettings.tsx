import { useSettingsStore } from '@/lib/hooks/stores/useSettingsStore';

export default function GradePointSettings() {
  const gradePoints = useSettingsStore((state) => state.gradePoints);
  const setGradePoints = useSettingsStore((state) => state.setGradePoints);
  const resetGradePoints = useSettingsStore((state) => state.resetGradePoints);

  const handleGradePointChange = (grade: string, value: string) => {
    const numValue = value === '' ? null : Number(value);
    setGradePoints({
      ...gradePoints,
      [grade]: numValue,
    });
  };

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h2 className='text-lg font-semibold'>Grade Point Settings</h2>
        <button
          onClick={resetGradePoints}
          className='rounded-lg bg-gray-100 px-3 py-1 text-sm text-gray-600 hover:bg-gray-200'
        >
          Reset to Defaults
        </button>
      </div>
      <div className='grid grid-cols-2 gap-4'>
        {Object.entries(gradePoints).map(([grade, points]) => (
          <div key={grade} className='flex items-center justify-between'>
            <label className='text-sm font-medium'>{grade}</label>
            <input
              type='number'
              className='input input-sm input-bordered w-24'
              value={points === null ? '' : points}
              onChange={(e) => handleGradePointChange(grade, e.target.value)}
              placeholder='N/A'
              step='0.1'
              min='0'
              max='4'
            />
          </div>
        ))}
      </div>
    </div>
  );
}
