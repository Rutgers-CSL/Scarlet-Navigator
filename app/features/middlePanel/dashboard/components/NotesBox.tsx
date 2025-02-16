import { useNotesStore } from '@/lib/hooks/stores/useNotesStore';
import { useScheduleStore } from '@/lib/hooks/stores/useScheduleStore';
import { SemesterID } from '@/lib/types/models';
import NotesEditor from '@/app/components/NotesEditor';

function NotesBox({ semesterID }: { semesterID: SemesterID }) {
  const notes = useNotesStore((state) => state.notes);
  const semester = useScheduleStore((state) => state.semesterByID[semesterID]);
  if (!semester) return null;

  const { title } = semester;

  if (!notes[semesterID]) return null;
  if (!notes[semesterID].displayNextToSemester) return null;

  return <NotesEditor id={semesterID} title={title} />;
}

export default NotesBox;
