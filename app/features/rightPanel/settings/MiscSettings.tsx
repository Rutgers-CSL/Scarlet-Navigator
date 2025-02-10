import { useSettingsStore } from '@/lib/hooks/stores/useSettingsStore';
import ConfirmationModal from '@/app/components/ConfirmationModal';

export default function MiscSettings() {
  const resetAllSettings = useSettingsStore((state) => state.resetAllSettings);

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <button
          onClick={() =>
            (
              document.getElementById(
                'reset_settings_modal'
              ) as HTMLDialogElement
            )?.showModal()
          }
          className='btn btn-neutral'
        >
          Reset All Settings
        </button>
      </div>
      <ConfirmationModal
        id='reset_settings_modal'
        title='Reset All Settings'
        message='Are you sure you want to reset all settings to their default values? This action cannot be undone.'
        onConfirm={() => resetAllSettings()}
        visible={false}
      />
    </div>
  );
}
