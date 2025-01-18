import { SemesterID } from '@/lib/types/models';
import { create } from 'zustand';
import { RefObject } from 'react';

type AuxiliaryStore = {
  recentlyMovedToNewContainer: RefObject<boolean> | null;
  activeID: SemesterID;
  currentInfoID: string;
  currentInfoType: 'course' | 'semester';
  activeTab: 'info' | 'tracker' | 'settings';
  setRecentlyMovedToNewContainer: (flag: RefObject<boolean>) => void;
  setActiveID: (id: SemesterID) => void;
  setCurrentInfo: (id: string, type: 'course' | 'semester') => void;
  setActiveTab: (tab: 'info' | 'tracker' | 'settings') => void;
};

/**
 * Stores auxiliary state for the drag and drop functionality.
 */
const useAuxiliaryStore = create<AuxiliaryStore>()((set) => ({
  recentlyMovedToNewContainer: null,
  activeID: '',
  currentInfoID: '',
  currentInfoType: 'course',
  activeTab: 'info',
  setRecentlyMovedToNewContainer: (flag: RefObject<boolean>) =>
    set({ recentlyMovedToNewContainer: flag }),
  setActiveID: (id: SemesterID) => {
    console.log('new active id', id);
    set({ activeID: id });
  },
  setCurrentInfo: (id: string, type: 'course' | 'semester') => {
    set({
      currentInfoID: id,
      currentInfoType: type,
      activeTab: 'info', // Switch to info tab when selection changes
    });
  },
  setActiveTab: (tab: 'info' | 'tracker' | 'settings') =>
    set({ activeTab: tab }),
}));

export default useAuxiliaryStore;
