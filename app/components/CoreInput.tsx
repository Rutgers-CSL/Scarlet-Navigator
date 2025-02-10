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
  placeholder = 'XXX',
  label = 'Cores:',
}: CoreInputProps) {
  const handleCoreSubmit = (
    e: KeyboardEvent<HTMLInputElement> | React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    const newCore = currentCore.trim().toUpperCase();
    if (newCore && !selectedCores.includes(newCore)) {
      addCore(newCore);
      setCurrentCore('');
    }
  };

  const removeCore = (coreToRemove: string) => {
    setSelectedCores(selectedCores.filter((core) => core !== coreToRemove));
  };

  const addCore = (core: string) => {
    const newCore = core.trim().toUpperCase();

    if (!selectedCores.includes(newCore)) {
      setSelectedCores([...selectedCores, newCore]);
    }
  };

  // Get all available cores that aren't selected
  const availableCores = Array.from(globalCores).filter(
    (core) => !selectedCores.includes(core)
  );

  return (
    <div className='space-y-4'>
      <div>
        <label className='input input-bordered flex items-center gap-2 pr-0'>
          {label}
          <input
            type='text'
            value={currentCore}
            onChange={(e) => setCurrentCore(e.target.value.toUpperCase())}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleCoreSubmit(e);
              }
            }}
            className='grow'
            placeholder={placeholder}
          />
          <button onClick={handleCoreSubmit} className='btn'>
            Add
          </button>
        </label>
      </div>

      {selectedCores.length > 0 && (
        <div>
          <p className='base-content mb-2 text-sm'>Current Cores:</p>
          <div className='flex flex-wrap gap-2'>
            <CoreList cores={selectedCores} handleRemoveCore={removeCore} />
          </div>
        </div>
      )}

      {availableCores.length > 0 && (
        <div>
          <p className='mb-2 text-sm'>Other Cores You Could Add:</p>
          <div className='flex flex-wrap gap-2'>
            <CoreList cores={availableCores} handleOnClick={addCore} />
          </div>
        </div>
      )}
    </div>
  );
}
