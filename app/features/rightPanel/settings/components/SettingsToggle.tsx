import {
  useSettingsStore,
  type SettingsState,
} from '@/lib/hooks/stores/useSettingsStore';
import { formatLabel } from '@/lib/utils';

interface SettingsToggleProps {
  settingKey: keyof SettingsState['visuals'];
}

export default function SettingsToggle({ settingKey }: SettingsToggleProps) {
  const value = useSettingsStore((state) => state.visuals[settingKey]);
  const setVisuals = useSettingsStore((state) => state.setVisuals);

  return (
    <div className='flex items-center justify-between'>
      <label className='text-sm font-medium'>{formatLabel(settingKey)}</label>
      <input
        type='checkbox'
        className='toggle'
        checked={value as boolean}
        onChange={() => setVisuals({ [settingKey]: !value })}
      />
    </div>
  );
}
