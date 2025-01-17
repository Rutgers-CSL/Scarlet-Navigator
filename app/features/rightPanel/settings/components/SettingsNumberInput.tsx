import {
  useSettingsStore,
  type SettingsState,
} from '@/lib/hooks/stores/useSettingsStore';
import { formatLabel } from '@/lib/utils';

interface SettingsNumberInputProps {
  settingKey: Extract<keyof SettingsState['visuals'], string>;
  min?: number;
  max?: number;
  step?: string;
}

export default function SettingsNumberInput({
  settingKey,
  min,
  max,
  step,
}: SettingsNumberInputProps) {
  const value = useSettingsStore((state) => state.visuals[settingKey]);
  const setVisuals = useSettingsStore((state) => state.setVisuals);

  return (
    <div className='flex items-center justify-between'>
      <label className='text-sm font-medium'>{formatLabel(settingKey)}</label>
      <input
        type='number'
        className='input input-sm input-bordered w-24'
        value={value as number}
        onChange={(e) => setVisuals({ [settingKey]: Number(e.target.value) })}
        min={min}
        max={max}
        step={step}
      />
    </div>
  );
}
