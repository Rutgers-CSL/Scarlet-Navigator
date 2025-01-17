import { useState } from 'react';
import { useSettingsStore } from '@/lib/hooks/stores/useSettingsStore';
import VisualsSettings from './VisualsSettings';
import GradePointSettings from './GradePointSettings';

type SettingsTab = 'visuals' | 'gradePoints';

interface TabButtonProps {
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

function TabButton({ isActive, onClick, children }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 px-4 py-2 text-sm font-medium ${
        isActive
          ? 'border-b-2 border-blue-500 text-blue-600'
          : 'text-gray-500 hover:text-gray-700'
      }`}
    >
      {children}
    </button>
  );
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('visuals');
  const resetAllSettings = useSettingsStore((state) => state.resetAllSettings);

  return (
    <div className='h-full'>
      <div className='flex items-center justify-between border-b border-gray-200 px-4'>
        <div className='flex flex-1'>
          <TabButton
            isActive={activeTab === 'visuals'}
            onClick={() => setActiveTab('visuals')}
          >
            Visuals
          </TabButton>
          <TabButton
            isActive={activeTab === 'gradePoints'}
            onClick={() => setActiveTab('gradePoints')}
          >
            Grade Points
          </TabButton>
        </div>
        <button
          onClick={resetAllSettings}
          className='rounded-lg bg-red-50 px-3 py-1 text-sm text-red-600 hover:bg-red-100'
        >
          Reset All
        </button>
      </div>

      <div className='p-4'>
        {activeTab === 'visuals' && <VisualsSettings />}
        {activeTab === 'gradePoints' && <GradePointSettings />}
      </div>
    </div>
  );
}
