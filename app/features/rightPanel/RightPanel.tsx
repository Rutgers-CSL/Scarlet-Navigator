import InfoDisplay from './infoDisplay/InfoDisplay';
import FulfillmentTracker from './fulfillmentTracker/FulfillmentTracker';
import Settings from './settings/Settings';

export default function RightPanel() {
  return (
    <div className='h-full w-full overflow-y-scroll border-l bg-white'>
      <div className='tabs tabs-border mt-3 grid grid-cols-3' role='tablist'>
        <input
          type='radio'
          name='right_panel_tabs'
          className='tab'
          aria-label='Info'
          defaultChecked
        />
        <div className='tab-content col-span-3'>
          <InfoDisplay />
        </div>

        <input
          type='radio'
          name='right_panel_tabs'
          className='tab'
          aria-label='Tracker'
        />
        <div className='tab-content bg-base-100 col-span-3'>
          <FulfillmentTracker />
        </div>

        <input
          type='radio'
          name='right_panel_tabs'
          className='tab'
          aria-label='Settings'
        />
        <div className='tab-content bg-base-100 col-span-3'>
          <Settings />
        </div>
      </div>
    </div>
  );
}
