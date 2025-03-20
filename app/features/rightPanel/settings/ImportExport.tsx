'use client';

import { useState } from 'react';
import {
  exportData,
  importFromFile,
  ExportOptions,
  ImportResult,
} from '@/lib/utils/importExport';

// Reusable setting checkbox component
const SettingCheckbox: React.FC<{
  option: keyof ExportOptions;
  label: string;
  options: ExportOptions;
  onChange: (key: keyof ExportOptions) => void;
}> = ({ option, label, options, onChange }) => (
  <div className='form-control'>
    <label className='label cursor-pointer justify-start'>
      <input
        type='checkbox'
        checked={options[option]}
        onChange={() => onChange(option)}
        className='checkbox mr-2'
      />
      <span className='label-text'>{label}</span>
    </label>
  </div>
);

export const ImportExportPanel: React.FC = () => {
  const [options, setOptions] = useState<ExportOptions>({
    schedule: true,
    settings: true,
    notes: true,
    auxiliary: true,
    history: true,
    programFulfillment: true,
  });

  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [pendingImportFile, setPendingImportFile] = useState<File | null>(null);
  const importModalID = 'import_confirm_modal';

  const settingOptions = [
    {
      key: 'schedule' as keyof ExportOptions,
      label: 'Schedule (includes Notes)',
    },
    { key: 'settings' as keyof ExportOptions, label: 'Settings' },
    {
      key: 'programFulfillment' as keyof ExportOptions,
      label: 'Program Requirements',
    },
    // { key: 'auxiliary' as keyof ExportOptions, label: 'UI Settings' },
    // { key: 'history' as keyof ExportOptions, label: 'History (Undo/Redo)' },
  ];

  const handleOptionChange = (key: keyof ExportOptions) => {
    // Special case: if schedule is toggled on, automatically toggle notes as well
    if (key === 'schedule' && !options.schedule) {
      setOptions({
        ...options,
        [key]: !options[key],
        notes: true,
      });
    } else {
      setOptions({
        ...options,
        [key]: !options[key],
      });
    }
  };

  const handleExport = () => {
    if (Object.values(options).some(Boolean)) {
      const now = new Date();
      const formattedDate = now
        .toISOString()
        .replace(/[:.]/g, '-')
        .replace('T', '_')
        .split('Z')[0];
      const filename = `scarlet-navigator-export_${formattedDate}.json`;
      exportData(options, filename);
    } else {
      alert('Please select at least one option to export.');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset file input
    e.target.value = '';

    if (file.type !== 'application/json') {
      setImportResult({
        success: false,
        errors: ['Invalid file type. Please select a JSON file.'],
      });
      return;
    }

    setPendingImportFile(file);
    (document.getElementById(importModalID) as HTMLDialogElement)?.showModal();
  };

  const handleConfirmImport = async () => {
    if (!pendingImportFile) return;

    const result = await importFromFile(pendingImportFile, options);
    setImportResult(result);
    setPendingImportFile(null);

    if (result.success) {
      // Reload the page to ensure all stores are updated
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  const handleCancelImport = () => {
    setPendingImportFile(null);
  };

  const getSelectedOptionsText = () => {
    const selected = settingOptions
      .filter((setting) => options[setting.key])
      .map((setting) => setting.label);

    return selected.length > 0 ? selected.join(', ') : 'No options selected';
  };

  return (
    <div className='space-y-4'>
      <div className='form-control'>
        <h3 className='mb-2 font-medium'>Select Options:</h3>
        <div className='space-y-2'>
          {settingOptions.map((setting) => (
            <SettingCheckbox
              key={setting.key}
              option={setting.key}
              label={setting.label}
              options={options}
              onChange={handleOptionChange}
            />
          ))}
        </div>
      </div>

      <div className='mb-4 flex gap-4'>
        <button onClick={handleExport} className='btn btn-neutral'>
          Export
        </button>

        <label className='btn'>
          Import
          <input
            type='file'
            accept='.json'
            onChange={handleFileSelect}
            className='hidden'
          />
        </label>
      </div>

      {/* Import Confirmation Modal */}
      {/* <dialog id={importModalID} className={`modal`}>
        <div className="modal-box">
          <h3 className="font-bold text-lg">Confirm Import</h3>
          <div className="py-4">
            <p className="mb-2">The following data will be imported and replace your current data:</p>
            <div className="bg-base-200 p-3 rounded-lg mb-3">
              <strong>{getSelectedOptionsText()}</strong>
            </div>
            <p className="text-warning"><strong>Warning</strong>: This action cannot be undone. Your current data will be replaced.</p>
          </div>
          <div className="modal-action">
            <form method="dialog" className="flex gap-4">
              <button className="btn btn-outline" onClick={handleCancelImport}>Cancel</button>
              <button className="btn btn-primary" onClick={handleConfirmImport}>Confirm Import</button>
            </form>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button onClick={handleCancelImport}>close</button>
        </form>
      </dialog> */}

      {importResult && (
        <>
          {/* Display success or error message */}
          <div
            className={`alert ${importResult.success ? 'alert-success' : 'alert-error'}`}
          >
            {importResult.success ? (
              <div>
                <span>Import successful! Page will reload shortly.</span>
              </div>
            ) : (
              <div>
                <div className='font-medium'>Import failed:</div>
                <ul className='mt-1 list-disc pl-5'>
                  {importResult.errors.map((error, i) => (
                    <li key={i}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Display warnings if any */}
          {importResult.warnings && importResult.warnings.length > 0 && (
            <div className='alert alert-warning mt-2'>
              <div className='text-warning-content'>
                <div className='font-medium'>Warnings:</div>
                <ul className='mt-1 list-disc pl-5'>
                  {importResult.warnings.map((warning, i) => (
                    <li key={i}>{warning}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </>
      )}

      <div className='mt-4 text-sm opacity-70'>
        <p>
          <strong>Note:</strong> Importing will replace your current data with
          the imported data. Make sure to export your current data first if you
          want to keep it.
        </p>
      </div>
    </div>
  );
};
