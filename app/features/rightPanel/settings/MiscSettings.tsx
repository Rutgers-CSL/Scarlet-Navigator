import { useSettingsStore } from '@/lib/hooks/stores/useSettingsStore';
import ConfirmationModal from '@/app/components/ConfirmationModal';

export default function MiscSettings() {
  const resetAllSettings = useSettingsStore((state) => state.resetAllSettings);
  const environment = process.env.NODE_ENV || 'development';

  return (
    <div className='space-y-4'>
      <div className='form-control'>
        <div className='bg-base-200 flex items-center justify-between rounded-lg p-4'>
          <span className='text-sm font-medium'>Environment:</span>
          <span
            className={`badge ${environment === 'production' ? 'badge-success' : 'badge-warning'}`}
          >
            {environment}
          </span>
        </div>
      </div>
      <div className='form-control'>
        <button
          onClick={() =>
            (
              document.getElementById(
                'reset_settings_modal'
              ) as HTMLDialogElement
            )?.showModal()
          }
          className='btn btn-bordered w-full'
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
