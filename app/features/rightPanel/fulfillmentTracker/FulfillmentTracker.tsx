'use client';

import { useState } from 'react';
import { useProgramFulfillment } from '@/lib/hooks/stores/useProgramFulfillment';
import { useCoreRequirements } from '@/lib/hooks/useCoreRequirements';
import {
  CoreCategory,
  ProgramOfStudy,
  SemesterID,
  Course,
} from '@/lib/types/models';
import ConfirmationModal from '@/app/components/ConfirmationModal';
import { useScheduleStore } from '@/lib/hooks/stores/useScheduleStore';

interface AddProgramFormProps {
  onSubmit: (name: string) => void;
}

function AddProgramForm({ onSubmit }: AddProgramFormProps) {
  const [name, setName] = useState('');
  const [showTooltip, setShowTooltip] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid()) return;
    onSubmit(name);
    setName('');
  };

  const isFormValid = () => {
    return name.trim() !== '';
  };

  const getMissingFields = () => {
    const missing = [];
    if (!name.trim()) missing.push('Program Name');
    return missing;
  };

  const getTooltipText = () => {
    const missing = getMissingFields();
    if (missing.length === 0) return '';
    return `Please fill out: ${missing.join(', ')}`;
  };

  return (
    <form onSubmit={handleSubmit} className='border-b border-gray-200 p-4'>
      <div className='mb-4'>
        <label className='block text-sm font-medium text-gray-700'>
          Program Name
        </label>
        <input
          type='text'
          value={name}
          onChange={(e) => setName(e.target.value)}
          className='input input-bordered w-full'
          required
        />
      </div>
      <div className='relative'>
        <button
          type='submit'
          disabled={!isFormValid()}
          onMouseEnter={() => !isFormValid() && setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className={`btn btn-primary w-full ${!isFormValid() ? 'btn-disabled' : ''}`}
        >
          Add Program
        </button>
        {showTooltip && !isFormValid() && (
          <div className='tooltip tooltip-open tooltip-error absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full'>
            {getTooltipText()}
          </div>
        )}
      </div>
    </form>
  );
}

interface AddCategoryFormProps {
  programId: string;
  onSubmit: (name: string) => void;
}

function AddCategoryForm({ programId, onSubmit }: AddCategoryFormProps) {
  const [name, setName] = useState('');
  const [showTooltip, setShowTooltip] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid()) return;
    onSubmit(name);
    setName('');
  };

  const isFormValid = () => {
    return name.trim() !== '';
  };

  const getMissingFields = () => {
    const missing = [];
    if (!name.trim()) missing.push('Category Name');
    return missing;
  };

  const getTooltipText = () => {
    const missing = getMissingFields();
    if (missing.length === 0) return '';
    return `Please fill out: ${missing.join(', ')}`;
  };

  return (
    <form onSubmit={handleSubmit} className='mt-4 border-t border-gray-200 p-4'>
      <div className='mb-4'>
        <label className='block text-sm font-medium text-gray-700'>
          Category Name
        </label>
        <input
          type='text'
          value={name}
          onChange={(e) => setName(e.target.value)}
          className='input input-bordered w-full'
          required
        />
      </div>
      <div className='relative'>
        <button
          type='submit'
          disabled={!isFormValid()}
          onMouseEnter={() => !isFormValid() && setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className={`btn btn-primary w-full ${!isFormValid() ? 'btn-disabled' : ''}`}
        >
          Add Category
        </button>
        {showTooltip && !isFormValid() && (
          <div className='tooltip tooltip-open tooltip-error absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full'>
            MouseE
            {getTooltipText()}
          </div>
        )}
      </div>
    </form>
  );
}

interface AddCoreFormProps {
  categoryId: string;
  onSubmit: (categoryId: string, name: string, requiredCredits: number) => void;
}

function AddCoreForm({ categoryId, onSubmit }: AddCoreFormProps) {
  const [name, setName] = useState('');
  const [requiredCredits, setRequiredCredits] = useState(3);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(categoryId, name.trim().toUpperCase(), requiredCredits);
    setName('');
    setRequiredCredits(3);
  };

  return (
    <form onSubmit={handleSubmit} className='mt-2 rounded-md bg-gray-50 p-4'>
      <div className='mb-4'>
        <label className='block text-sm font-medium text-gray-700'>
          Core Name
        </label>
        <input
          type='text'
          value={name}
          onChange={(e) => setName(e.target.value)}
          className='input input-bordered w-full'
          required
        />
      </div>
      <div className='mb-4'>
        <label className='block text-sm font-medium text-gray-700'>
          Required Credits
        </label>
        <input
          type='number'
          min='1'
          value={requiredCredits}
          onChange={(e) => setRequiredCredits(parseInt(e.target.value))}
          className='input input-bordered w-full'
          required
        />
      </div>
      <button type='submit' className='btn btn-primary w-full'>
        Add Core
      </button>
    </form>
  );
}

interface CategoryItemProps {
  category: CoreCategory;
  progress: {
    satisfiedCores: number;
    requiredCores: number;
    cores: Record<string, { currentCredits: number; requiredCredits: number }>;
  };
  onAddCore: (
    categoryId: string,
    name: string,
    requiredCredits: number
  ) => void;
  onRemoveCategory: (id: string) => void;
  onRemoveCore: (categoryId: string, coreId: string) => void;
}

interface EditableTextProps {
  value: string;
  onSave: (newValue: string) => void;
  className?: string;
}

function EditableText({ value, onSave, className = '' }: EditableTextProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (editValue.trim()) {
        onSave(editValue);
        setIsEditing(false);
      }
    } else if (e.key === 'Escape') {
      setEditValue(value);
      setIsEditing(false);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleBlur = () => {
    if (editValue.trim()) {
      onSave(editValue);
    } else {
      setEditValue(value);
    }
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <input
        type='text'
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        onClick={(e) => e.stopPropagation()}
        className={`w-24 rounded border border-blue-500 bg-white px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
        autoFocus
        size={6}
      />
    );
  }

  return (
    <span
      onClick={handleClick}
      className={`inline-block w-14 cursor-pointer truncate rounded px-2 py-1 hover:bg-gray-100 ${className}`}
    >
      {value}
    </span>
  );
}

function CategoryItem({
  category,
  progress,
  onAddCore,
  onRemoveCategory,
  onRemoveCore,
}: CategoryItemProps) {
  const [isAddingCore, setIsAddingCore] = useState(false);
  const [showRemoveCategoryModal, setShowRemoveCategoryModal] = useState(false);
  const [coreToRemove, setCoreToRemove] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const updateCategory = useProgramFulfillment((state) => state.updateCategory);
  const updateCoreRequirement = useProgramFulfillment(
    (state) => state.updateCoreRequirement
  );

  const handleCategoryNameChange = (newName: string) => {
    updateCategory(category.id, { name: newName });
  };

  const handleCoreNameChange = (coreId: string, newName: string) => {
    updateCoreRequirement(category.id, coreId, {
      name: newName.trim().toUpperCase(),
    });
  };

  return (
    <>
      <div className='collapse collapse-arrow mb-4 bg-base-200'>
        <input type='checkbox' className='h-auto w-auto' defaultChecked />
        <div className='collapse-title relative flex items-center justify-between pr-12'>
          <div className='flex items-center'>
            <h3 className='flex items-center text-lg font-medium'>
              <EditableText
                value={category.name}
                onSave={handleCategoryNameChange}
                className='text-lg font-medium'
              />
              <span className='ml-2'>
                ({progress.satisfiedCores}/{progress.requiredCores} satisfied)
              </span>
            </h3>
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowRemoveCategoryModal(true);
            }}
            className='btn btn-outline btn-error btn-sm absolute right-8 z-20'
          >
            Remove
          </button>
        </div>
        <div className='collapse-content'>
          <div className='space-y-2 pt-2'>
            {category.cores.map((core) => (
              <div
                key={core.id}
                className='flex items-center justify-between rounded-lg bg-base-100 p-2'
              >
                <span className='flex-1'>
                  <EditableText
                    value={core.name}
                    onSave={(newName) => handleCoreNameChange(core.id, newName)}
                  />
                  <span className='ml-2'>
                    ({progress.cores[core.id]?.currentCredits ?? 0}/
                    {core.requiredCredits} credits)
                  </span>
                  <div className='mt-1 text-xs text-gray-500'>
                    Fulfilled by:{' '}
                    {Object.values(useScheduleStore.getState().courses)
                      .filter((course: Course) =>
                        course.cores.includes(core.name)
                      )
                      .map((course: Course) => course.name)
                      .join(', ') || 'No courses yet'}
                  </div>
                </span>
                <button
                  onClick={() =>
                    setCoreToRemove({ id: core.id, name: core.name })
                  }
                  className='btn btn-outline btn-error btn-sm'
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          {isAddingCore ? (
            <AddCoreForm
              categoryId={category.id}
              onSubmit={(categoryId, name, credits) => {
                onAddCore(categoryId, name, credits);
                setIsAddingCore(false);
              }}
            />
          ) : (
            <button
              onClick={() => setIsAddingCore(true)}
              className='btn btn-ghost btn-block mt-4'
            >
              Add Core
            </button>
          )}
        </div>
      </div>

      <ConfirmationModal
        title='Remove Category'
        message={`Are you sure you want to remove the category "${category.name}"? This action cannot be undone.`}
        visible={showRemoveCategoryModal}
        onConfirm={() => {
          onRemoveCategory(category.id);
          setShowRemoveCategoryModal(false);
        }}
        onCancel={() => setShowRemoveCategoryModal(false)}
      />

      <ConfirmationModal
        title='Remove Core'
        message={`Are you sure you want to remove the core "${coreToRemove?.name}"? This action cannot be undone.`}
        visible={!!coreToRemove}
        onConfirm={() => {
          if (coreToRemove) {
            onRemoveCore(category.id, coreToRemove.id);
          }
          setCoreToRemove(null);
        }}
        onCancel={() => setCoreToRemove(null)}
      />
    </>
  );
}

interface ProgramItemProps {
  program: ProgramOfStudy;
  categories: Record<string, CoreCategory>;
  progress: Record<
    SemesterID,
    {
      satisfiedCores: number;
      requiredCores: number;
      cores: Record<
        string,
        { currentCredits: number; requiredCredits: number }
      >;
    }
  >;
  onAddCore: (
    categoryId: string,
    name: string,
    requiredCredits: number
  ) => void;
  onRemoveCategory: (id: string) => void;
  onRemoveCore: (categoryId: string, coreId: string) => void;
  onRemoveProgram: (id: string) => void;
}

function ProgramItem({
  program,
  categories,
  progress,
  onAddCore,
  onRemoveCategory,
  onRemoveCore,
  onRemoveProgram,
}: ProgramItemProps) {
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [showRemoveProgramModal, setShowRemoveProgramModal] = useState(false);
  const { addCategory, addCategoryToProgram, updateProgram } =
    useProgramFulfillment();

  const handleAddCategory = (name: string) => {
    const newCategoryId = addCategory(name);
    addCategoryToProgram(program.id, newCategoryId);
    setIsAddingCategory(false);
  };

  const handleProgramNameChange = (newName: string) => {
    updateProgram(program.id, { name: newName });
  };

  return (
    <>
      <div className='collapse collapse-arrow mb-4 rounded-lg bg-base-100'>
        <input type='checkbox' className='h-auto w-auto' />
        <div className='collapse-title relative flex items-center justify-between pr-12'>
          <div className='flex items-center gap-2'>
            <h2 className='text-xl font-bold'>
              <EditableText
                value={program.name}
                onSave={handleProgramNameChange}
                className='text-xl'
              />
            </h2>
            <span className='badge badge-neutral'>
              {
                program.categoryIds
                  .map((id) => progress[id])
                  .filter((p) => p && p.satisfiedCores === p.requiredCores)
                  .length
              }{' '}
              / {program.categoryIds.length}
            </span>
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowRemoveProgramModal(true);
            }}
            className='btn btn-outline btn-error btn-sm absolute right-8 z-20'
          >
            Remove Program
          </button>
        </div>
        <div className='collapse-content'>
          {program.categoryIds.map((categoryId) => {
            const category = categories[categoryId];
            if (!category) return null;
            return (
              <CategoryItem
                key={categoryId}
                category={category}
                progress={progress[categoryId]}
                onAddCore={onAddCore}
                onRemoveCategory={onRemoveCategory}
                onRemoveCore={onRemoveCore}
              />
            );
          })}
          {isAddingCategory ? (
            <AddCategoryForm
              programId={program.id}
              onSubmit={handleAddCategory}
            />
          ) : (
            <button
              onClick={() => setIsAddingCategory(true)}
              className='btn btn-ghost btn-block mt-4'
            >
              Add Category
            </button>
          )}
        </div>
      </div>

      <ConfirmationModal
        title='Remove Program'
        message={`Are you sure you want to remove the program "${program.name}"? This action cannot be undone.`}
        visible={showRemoveProgramModal}
        onConfirm={() => {
          onRemoveProgram(program.id);
          setShowRemoveProgramModal(false);
        }}
        onCancel={() => setShowRemoveProgramModal(false)}
      />
    </>
  );
}

export default function FulfillmentTracker() {
  const {
    categories,
    programs,
    addProgram,
    removeProgram,
    addCategory,
    removeCategory,
    addCoreToCategory,
    removeCoreFromCategory,
  } = useProgramFulfillment();

  const { calculateAllProgress } = useCoreRequirements();
  const progress = calculateAllProgress();

  const handleAddProgram = (name: string) => {
    addProgram(name);
  };

  return (
    <div className='h-full overflow-y-auto'>
      <div className='card mx-auto mt-4 w-96 bg-base-100 shadow-xl'>
        <div className='card-body'>
          <h2 className='card-title'>Fulfillment Tracker</h2>
          <div className='card-actions justify-end'>
            <div>
              <p className='text-sm'>
                <span className='font-semibold'>Program:</span> A complete
                course of study (e.g., SAS, Computer Science, pre-med, pre-pt)
                <br />
                <span className='font-semibold'>Category:</span> A group of
                related core requirements (e.g., Math Requirements)
                <br />
                <span className='font-semibold'>Core:</span> A specific
                requirement that can be fulfilled by courses (e.g., MATH101)
              </p>
            </div>
          </div>
        </div>
      </div>
      <AddProgramForm onSubmit={handleAddProgram} />
      <div className='space-y-4 p-4'>
        {Object.values(programs).map((program) => (
          <ProgramItem
            key={program.id}
            program={program}
            categories={categories}
            progress={progress}
            onAddCore={addCoreToCategory}
            onRemoveCategory={removeCategory}
            onRemoveCore={removeCoreFromCategory}
            onRemoveProgram={removeProgram}
          />
        ))}
      </div>
    </div>
  );
}
