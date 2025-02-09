import useHistoryStore from '@/lib/hooks/stores/useHistoryStore';
import clsx from 'clsx';
import { Undo2, Redo2 } from 'lucide-react';
import useAuxiliaryStore from '@/lib/hooks/stores/useAuxiliaryStore';

function MenuContainer() {
  const { undo, redo, past, future } = useHistoryStore();
  const setActiveTab = useAuxiliaryStore((state) => state.setActiveTab);

  return (
    <ul className='menu menu-horizontal bg-base-200 rounded-box mx-auto mb-3'>
      <li>
        <button
          onClick={undo}
          aria-label='Undo'
          className={clsx('btn btn-ghost', {
            'btn-disabled': past.length == 0,
          })}
        >
          <Undo2 />
        </button>
      </li>
      <li>
        <button
          onClick={redo}
          aria-label='Redo'
          className={clsx('btn btn-ghost', {
            'btn-disabled': future.length == 0,
          })}
        >
          <Redo2 />
        </button>
      </li>
      <div className='divider divider-horizontal mx-1'></div>
      <li>
        <button
          onClick={() => setActiveTab('settings')}
          className='btn btn-soft'
        >
          Sync
        </button>
      </li>
    </ul>
  );
}

export default MenuContainer;
