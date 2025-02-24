import {
  useSettingsStore,
  type SettingsState,
} from '@/lib/hooks/stores/useSettingsStore';
import { formatLabel } from '@/lib/utils';

interface SettingsToggleProps {
  settingKey: keyof SettingsState['visuals'];
  label?: string;
}

export default function SettingsToggle({
  settingKey,
  label,
}: SettingsToggleProps) {
  const value = useSettingsStore((state) => state.visuals[settingKey]);
  const setVisuals = useSettingsStore((state) => state.setVisuals);

  return (
    <div className='form-control'>
      <label className='label cursor-pointer'>
        <input
          type='checkbox'
          checked={value as boolean}
          className='toggle'
          onChange={() => setVisuals({ [settingKey]: !value })}
        />
        <span className='label-text'>{label || formatLabel(settingKey)}</span>
      </label>
    </div>
  );
}
