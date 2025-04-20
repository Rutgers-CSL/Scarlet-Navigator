import {
  useSettingsStore,
  type SettingsState,
} from '@/lib/hooks/stores/useSettingsStore';
import { formatLabel } from '@/app/(app)/dashboard/panels/rightPanel/tabs/settings/utils';

interface SettingsNumberInputProps {
  settingKey: Extract<keyof SettingsState['visuals'], string>;
  min?: number;
  max?: number;
  step?: string;
  label?: string;
}

export default function SettingsNumberInput({
  settingKey,
  min,
  max,
  step,
  label,
}: SettingsNumberInputProps) {
  const value = useSettingsStore((state) => state.visuals[settingKey]);
  const setVisuals = useSettingsStore((state) => state.setVisuals);

  return (
    <div className='form-control'>
      <label className='label'>
        <span className='label-text'>{label || formatLabel(settingKey)}</span>
        <input
          type='number'
          className='input input-bordered w-24'
          value={value as number}
          onChange={(e) => setVisuals({ [settingKey]: Number(e.target.value) })}
          min={min}
          max={max}
          step={step}
        />
      </label>
    </div>
  );
}
