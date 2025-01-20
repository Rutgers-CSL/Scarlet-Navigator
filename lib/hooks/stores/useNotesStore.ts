'use client';

import { SemesterID, CourseID } from '@/types/models';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type validID = SemesterID | CourseID;

export interface Note {
  note: string;
  displayNextToSemester: boolean;
}

interface NotesState {
  notes: Record<validID, Note>;
  setNote: (id: validID, content: Note) => void;
  deleteNote: (id: validID) => void;
}

export const useNotesStore = create<NotesState>()(
  persist(
    (set) => ({
      notes: {},
      setNote: (id: validID, note: Note) => {
        set((state) => ({
          notes: {
            ...state.notes,
            [id]: note,
          },
        }));
        return true;
      },
      deleteNote: (id: validID) =>
        set((state) => {
          const { [id]: _, ...rest } = state.notes;
          return { notes: rest };
        }),
    }),
    {
      name: 'notes-storage',
    }
  )
);
