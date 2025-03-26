import { useEffect, useRef, useState } from 'react';
import Markdown from 'react-markdown';
import { useNotesStore } from '@/lib/hooks/stores/useNotesStore';
import { CourseID, SemesterID } from '@/lib/types/models';
import { useScheduleStore } from '@/lib/hooks/stores/useScheduleStore';

interface NotesEditorProps {
  id: SemesterID | CourseID;
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

  const currentCourse = useScheduleStore((state) => state.courses[id]);
  const currentSemester = useScheduleStore((state) => state.semesterByID[id]);

  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(notes[id]?.note || '');
  const [displayNextToSemester, setDisplayNextToSemester] = useState(
    notes[id]?.displayNextToSemester || false
  );
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  /**
   * We don't want to see redundant notes on the board
   * if the user has already added them to the board.
   */
  const showNotes = !showDisplayOption || !displayNextToSemester;

  useEffect(() => {
    setIsEditing(false);
    setDisplayNextToSemester(notes[id]?.displayNextToSemester || false);
    setEditValue(notes[id]?.note || '');
  }, [currentCourse, currentSemester, id, notes]);

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
          className='btn btn-ghost btn-sm'
        >
          {isEditing ? 'Save' : 'Edit'}
        </button>
      </div>

      {showDisplayOption && (
        <div className='form-control'>
          <label className='label cursor-pointer'>
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
              className='checkbox checkbox-sm'
            />
            <span className='label-text'>Display next to semester</span>
          </label>
        </div>
      )}

      {isEditing ? (
        <fieldset className='fieldset'>
          <legend className='fieldset-label'>Notes</legend>
          <textarea
            ref={textAreaRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className='textarea textarea-bordered w-full'
            placeholder='Add your notes here...'
          />
          <div className='fieldset-label text-sm whitespace-normal'>
            Markdown supported: **bold**, *italic*, # heading, - list,
            [link](url)
          </div>
          <div>
            <a
              href='https://www.markdownguide.org/basic-syntax/'
              target='_blank'
              rel='noopener noreferrer'
              className='text-info link'
            >
              Learn more about Markdown
            </a>
          </div>
        </fieldset>
      ) : (
        <NotesDisplay notes={notes[id]?.note} showNotes={showNotes} />
      )}
    </div>
  );
}

function NotesDisplay({
  notes,
  showNotes,
}: {
  notes: string;
  showNotes: boolean;
}) {
  if (!showNotes) return <span></span>;

  return (
    <article className='prose prose-sm overflow-scroll rounded-md p-2'>
      {notes?.length > 0 ? (
        <Markdown>{notes}</Markdown>
      ) : (
        <span className='text-gray-500'>No notes added yet</span>
      )}
    </article>
  );
}
