import VisualsSettings from './VisualsSettings';
import GradePointSettings from './GradePointSettings';
import MiscSettings from './MiscSettings';

export default function Settings() {
  return (
    <div className='h-full space-y-4 p-4'>
      <div className='space-y-4'>
        <div className='collapse-arrow bg-base-200 collapse'>
          <input
            type='checkbox'
            name='settings-accordion'
            className='h-auto w-auto'
            defaultChecked
          />
          <div className='collapse-title font-medium'>Visual Settings</div>
          <div className='collapse-content'>
            <VisualsSettings />
          </div>
        </div>

        <div className='collapse-arrow bg-base-200 collapse'>
          <input
            type='checkbox'
            name='settings-accordion'
            className='h-auto w-auto'
          />
          <div className='collapse-title font-medium'>Grade Point Settings</div>
          <div className='collapse-content'>
            <GradePointSettings />
          </div>
        </div>

        <div className='collapse-arrow bg-base-200 collapse'>
          <input
            type='checkbox'
            name='settings-accordion'
            className='h-auto w-auto'
          />
          <div className='collapse-title font-medium'>Misc Settings</div>
          <div className='collapse-content'>
            <MiscSettings />
          </div>
        </div>
      </div>
    </div>
  );
}
