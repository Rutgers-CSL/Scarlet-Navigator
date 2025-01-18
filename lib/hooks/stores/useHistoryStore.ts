import { create } from 'zustand';
import { ScheduleState } from '@/lib/types/models';
import { useScheduleStore } from './useScheduleStore';

type HistoryState = {
  past: Array<Omit<ScheduleState, 'past' | 'future'>>;
  future: Array<Omit<ScheduleState, 'past' | 'future'>>;
};

type HistoryActions = {
  addToHistory: (state: Omit<ScheduleState, 'past' | 'future'>) => void;
  undo: () => void;
  redo: () => void;
  clear: () => void;
};

const useHistoryStore = create<HistoryState & HistoryActions>((set, get) => ({
  past: [],
  future: [],

  addToHistory: (state) => {
    set((history) => ({
      past: [...history.past, state],
      future: [],
    }));
  },

  undo: () => {
    const { past, future } = get();
    const scheduleStore = useScheduleStore.getState();

    if (past.length === 0) return;

    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);

    useScheduleStore.setState(previous);
    set({
      past: newPast,
      future: [scheduleStore, ...future],
    });
  },

  redo: () => {
    const { past, future } = get();
    const scheduleStore = useScheduleStore.getState();

    if (future.length === 0) return;

    const next = future[0];
    const newFuture = future.slice(1);

    useScheduleStore.setState(next);
    set({
      past: [...past, scheduleStore],
      future: newFuture,
    });
  },

  clear: () => {
    set({ past: [], future: [] });
  },
}));

export default useHistoryStore;
