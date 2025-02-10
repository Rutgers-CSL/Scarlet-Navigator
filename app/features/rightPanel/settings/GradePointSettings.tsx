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
      <div className='flex items-center justify-between'>
        <button onClick={resetGradePoints} className='btn btn-sm btn-neutral'>
          Reset to Defaults
        </button>
      </div>
    </div>
  );
}
