import VisualsSettings from './VisualsSettings';
import GradePointSettings from './GradePointSettings';
import MiscSettings from './MiscSettings';
import GeneralSettings from './GeneralSettings';

export default function Settings() {
  return (
    <div className='h-full p-4'>
      <div className='space-y-4'>
        <div className='collapse-arrow bg-base-200 collapse'>
          <input
            type='checkbox'
            name='general-settings-accordion'
            defaultChecked
          />
          <div className='collapse-title text-base font-medium'>
            General Settings
          </div>
          <div className='collapse-content'>
            <GeneralSettings />
          </div>
        </div>

        <div className='collapse-arrow bg-base-200 collapse'>
          <input type='checkbox' name='visuals-settings-accordion' />
          <div className='collapse-title text-base font-medium'>
            Visual Settings
          </div>
          <div className='collapse-content'>
            <VisualsSettings />
          </div>
        </div>

        <div className='collapse-arrow bg-base-200 collapse'>
          <input type='checkbox' name='grade-point-settings-accordion' />
          <div className='collapse-title text-base font-medium'>
            Grade Point Settings
          </div>
          <div className='collapse-content'>
            <GradePointSettings />
          </div>
        </div>

        <div className='collapse-arrow bg-base-200 collapse'>
          <input type='checkbox' name='misc-settings-accordion' />
          <div className='collapse-title text-base font-medium'>
            Misc Settings
          </div>
          <div className='collapse-content'>
            <MiscSettings />
          </div>
        </div>
      </div>
    </div>
  );
}
