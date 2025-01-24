import { KeyboardEvent } from 'react';
import CoreList from './CoreList';

interface CoreInputProps {
  currentCore: string;
  setCurrentCore: (value: string) => void;
  selectedCores: string[];
  setSelectedCores: (cores: string[]) => void;
  globalCores: Set<string>;
  placeholder?: string;
  label?: string;
}

export default function CoreInput({
  currentCore,
  setCurrentCore,
  selectedCores,
  setSelectedCores,
  globalCores,
  placeholder = 'Type a core and press Enter',
  label = 'Cores:',
}: CoreInputProps) {
  const handleCoreKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && currentCore.trim()) {
      e.preventDefault();
      const newCore = currentCore.trim().toUpperCase();
      if (!selectedCores.includes(newCore)) {
        setSelectedCores([...selectedCores, newCore]);
      }
      setCurrentCore('');
    }
  };

  const removeCore = (coreToRemove: string) => {
    setSelectedCores(selectedCores.filter((core) => core !== coreToRemove));
  };

  const addCore = (core: string) => {
    if (!selectedCores.includes(core)) {
      setSelectedCores([...selectedCores, core]);
    }
  };

  // Get all available cores that aren't selected
  const availableCores = Array.from(globalCores).filter(
    (core) => !selectedCores.includes(core)
  );

  return (
    <div className='space-y-4'>
      <div>
        <label className='mb-1 block text-sm font-medium'>
          {label}
          <div className='flex gap-2'>
            <input
              type='text'
              value={currentCore}
              onChange={(e) => setCurrentCore(e.target.value.toUpperCase())}
              onKeyDown={handleCoreKeyDown}
              className='mt-1 w-24 rounded-md border border-gray-300 bg-white px-3 py-2 text-center uppercase shadow-xs focus:border-indigo-500 focus:ring-indigo-500 focus:outline-hidden'
              placeholder='XXX'
            />
            <button
              type='button'
              onClick={() => {
                if (currentCore.trim()) {
                  const newCore = currentCore.trim().toUpperCase();
                  if (!selectedCores.includes(newCore)) {
                    setSelectedCores([...selectedCores, newCore]);
                  }
                  setCurrentCore('');
                }
              }}
              className='mt-1 rounded-md bg-gray-100 px-6 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-200 focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:outline-hidden'
            >
              Add
            </button>
          </div>
        </label>
      </div>

      {selectedCores.length > 0 && (
        <div>
          <p className='mb-2 text-sm text-gray-600'>Current Cores:</p>
          <div className='flex flex-wrap gap-2'>
            <CoreList
              color='blue'
              cores={selectedCores}
              handleRemoveCore={removeCore}
            />
          </div>
        </div>
      )}

      {availableCores.length > 0 && (
        <div>
          <p className='mb-2 text-sm text-gray-600'>
            Other Cores You Could Add:
          </p>
          <div className='flex flex-wrap gap-2'>
            <CoreList
              color='gray'
              cores={availableCores}
              handleOnClick={addCore}
            />
          </div>
        </div>
      )}

      {selectedCores.some((core) => !globalCores.has(core)) && (
        <div>
          <p className='mb-2 text-sm text-gray-600'>New Cores:</p>
          <div className='flex flex-wrap gap-2'>
            <CoreList
              color='green'
              cores={selectedCores.filter((core) => !globalCores.has(core))}
              handleRemoveCore={removeCore}
            />
          </div>
        </div>
      )}
    </div>
  );
}
