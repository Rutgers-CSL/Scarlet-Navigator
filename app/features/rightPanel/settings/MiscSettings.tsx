import { useSettingsStore } from '@/lib/hooks/stores/useSettingsStore';

export default function MiscSettings() {
  const resetAllSettings = useSettingsStore((state) => state.resetAllSettings);

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <button
          onClick={resetAllSettings}
          className='rounded-lg bg-red-50 px-3 py-1 text-sm text-red-600 hover:bg-red-100'
        >
          Reset All Settings
        </button>
      </div>
    </div>
  );
}
