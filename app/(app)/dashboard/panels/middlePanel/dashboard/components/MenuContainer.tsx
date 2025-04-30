import useHistoryStore from '@/lib/hooks/stores/useHistoryStore';
import { signIn } from 'next-auth/react';
import clsx from 'clsx';
import { Undo2, Redo2 } from 'lucide-react';
import { useState } from 'react';

function MenuContainer() {
  const { undo, redo, past, future } = useHistoryStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleSync = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  return (
    <ul className='menu menu-horizontal bg-base-200 rounded-box mx-auto mb-2 scale-90'>
      <li>
        <button
          onClick={undo}
          aria-label='Undo'
          className={clsx('btn btn-ghost btn-sm', {
            'btn-disabled': past.length == 0,
          })}
        >
          <Undo2 size={18} />
        </button>
      </li>
      <li>
        <button
          onClick={redo}
          aria-label='Redo'
          className={clsx('btn btn-ghost btn-sm', {
            'btn-disabled': future.length == 0,
          })}
        >
          <Redo2 size={18} />
        </button>
      </li>
      <div className='divider divider-horizontal mx-0.5'></div>
      <li>
        <button onClick={handleSync} className='btn btn-ghost btn-sm'>
          {isLoading ? (
            <span className='loading loading-spinner loading-sm'></span>
          ) : null}
          Sync
        </button>
      </li>
      <li>
        <button
          onClick={() => signIn('google')}
          className='btn btn-ghost btn-sm'
        >
          Log in
        </button>
      </li>
    </ul>
  );
}

export default MenuContainer;
