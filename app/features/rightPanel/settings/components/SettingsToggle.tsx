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
    <div className='flex items-center justify-between'>
      <fieldset className='fieldset w-64'>
        <label className='fieldset-label text-base-content'>
          <input
            type='checkbox'
            checked={value as boolean}
            className='toggle'
            onChange={() => setVisuals({ [settingKey]: !value })}
          />
          {label || formatLabel(settingKey)}
        </label>
      </fieldset>
    </div>
  );
}
