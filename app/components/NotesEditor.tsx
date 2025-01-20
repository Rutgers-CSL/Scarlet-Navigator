import { useEffect, useRef, useState } from 'react';
import Markdown from 'react-markdown';
import { useNotesStore } from '@/lib/hooks/stores/useNotesStore';

interface NotesEditorProps {
  id: string | number;
  showDisplayOption?: boolean;
  className?: string;
  title?: string;
}

export default function NotesEditor({
  id,
  showDisplayOption = false,
  title,
}: NotesEditorProps) {
  const { notes, setNote } = useNotesStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(notes[id]?.note || '');
  const [displayNextToSemester, setDisplayNextToSemester] = useState(
    notes[id]?.displayNextToSemester || false
  );
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = 'auto';
      textAreaRef.current.style.height =
        textAreaRef.current.scrollHeight + 'px';
    }
  }, [editValue, isEditing]);

  const handleSave = () => {
    setNote(id, {
      note: editValue,
      displayNextToSemester,
    });
    setIsEditing(false);
  };

  return (
    <div>
      <div className='mb-2 flex items-center justify-between'>
        {title && <h2 className='text-lg font-bold'>{title}</h2>}
        {!title && <h3 className='text-sm font-medium'>Notes:</h3>}
        <button
          onClick={isEditing ? handleSave : () => setIsEditing(true)}
          className='text-sm text-blue-600 hover:text-blue-800'
        >
          {isEditing ? 'Save' : 'Edit'}
        </button>
      </div>

      {showDisplayOption && (
        <div className='mb-2 flex items-center'>
          <input
            type='checkbox'
            checked={displayNextToSemester}
            onChange={(e) => {
              setDisplayNextToSemester(e.target.checked);
              setNote(id, {
                note: editValue,
                displayNextToSemester: e.target.checked,
              });
            }}
            className='mr-2'
          />
          <label className='text-sm text-gray-600'>
            Display next to semester
          </label>
        </div>
      )}

      {isEditing ? (
        <div className='space-y-2'>
          <textarea
            ref={textAreaRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className='h-32 w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
            placeholder='Add your notes here...'
          />
          <div className='text-xs text-gray-500'>
            Markdown supported: **bold**, *italic*, # heading, - list,
            [link](url)
            <br />
            <a
              href='https://www.markdownguide.org/basic-syntax/'
              target='_blank'
              rel='noopener noreferrer'
              className='text-blue-600 hover:text-blue-800'
            >
              Learn more about Markdown
            </a>
          </div>
        </div>
      ) : (
        <article
          className='prose prose-sm cursor-pointer overflow-scroll rounded-md p-2 hover:bg-gray-100'
          onClick={() => setIsEditing(true)}
        >
          {notes[id]?.note ? (
            <Markdown>{notes[id].note}</Markdown>
          ) : (
            <span className='text-gray-500'>No notes added yet</span>
          )}
        </article>
      )}
    </div>
  );
}
