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
    <div className='flex items-center gap-2 text-sm whitespace-nowrap'>
      <input
        type='number'
        className='input input-sm input-neutral w-16'
        value={value as number}
        onChange={(e) => setVisuals({ [settingKey]: Number(e.target.value) })}
        min={min}
        max={max}
        step={step}
      />
      {label || formatLabel(settingKey)}
    </div>
  );
}
