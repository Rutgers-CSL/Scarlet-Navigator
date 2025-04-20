import InfoDisplay from './infoDisplay/InfoDisplay';
import FulfillmentTracker from './fulfillmentTracker/FulfillmentTracker';
import Settings from './settings/Settings';
import useAuxiliaryStore from '@/lib/hooks/stores/useAuxiliaryStore';

export default function RightPanel() {
  const { activeTab, setActiveTab } = useAuxiliaryStore();

  return (
    <div className='h-full w-full overflow-y-scroll border-l bg-white'>
      <div className='tabs tabs-border mt-3 grid grid-cols-3' role='tablist'>
        <input
          type='radio'
          name='right_panel_tabs'
          className='tab'
          aria-label='Info'
          checked={activeTab === 'info'}
          onChange={() => setActiveTab('info')}
        />
        <div className='tab-content col-span-3'>
          <InfoDisplay />
        </div>

        <input
          type='radio'
          name='right_panel_tabs'
          className='tab'
          aria-label='Tracker'
          checked={activeTab === 'tracker'}
          onChange={() => setActiveTab('tracker')}
        />
        <div className='tab-content bg-base-100 col-span-3'>
          <FulfillmentTracker />
        </div>

        <input
          type='radio'
          name='right_panel_tabs'
          className='tab'
          aria-label='Settings'
          checked={activeTab === 'settings'}
          onChange={() => setActiveTab('settings')}
        />
        <div className='tab-content bg-base-100 col-span-3'>
          <Settings />
        </div>
      </div>
    </div>
  );
}
