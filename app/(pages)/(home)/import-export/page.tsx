'use client';

import { ImportExportPanel } from '@/app/features/rightPanel/settings/ImportExport';
import { APP_VERSION } from '@/lib/utils/version';
export default function ImportExportPage() {
  return (
    <div className='container mx-auto px-4 py-8'>
      <h1 className='mb-6 text-2xl font-bold'>Import & Export Data</h1>
      <p className='text-base-content/70 mb-6'>
        Use this page to back up your data or transfer it to another device.
      </p>
      <p className='text-base-content/70 mb-6'>Version: {APP_VERSION}</p>

      <ImportExportPanel />
    </div>
  );
}
