import { SemesterID } from '@/lib/types/models';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { RefObject } from 'react';
import { AUXILIARY_STORAGE_KEY } from './storeKeys';

type AuxiliaryStore = {
  recentlyMovedToNewContainer: RefObject<boolean> | null;
  activeID: SemesterID;
  currentInfoID: string;
  currentInfoType: 'course' | 'semester';
  activeTab: 'info' | 'tracker' | 'settings';
  leftPanelTab: 'search' | 'create';
  panelDimensions: Record<string, number>;
  searchQuery: string;
  setRecentlyMovedToNewContainer: (flag: RefObject<boolean>) => void;
  setActiveID: (id: SemesterID) => void;
  setCurrentInfo: (id: string, type: 'course' | 'semester') => void;
  setActiveTab: (tab: 'info' | 'tracker' | 'settings') => void;
  setLeftPanelTab: (tab: 'search' | 'create') => void;
  setPanelDimension: (key: string, value: number) => void;
  getPanelDimension: (key: string, defaultValue: number) => number;
  setSearchQuery: (query: string) => void;
};

/**
 * Stores auxiliary state for the drag and drop functionality.
 */
const useAuxiliaryStore = create<AuxiliaryStore>()(
  persist(
    (set, get) => ({
      recentlyMovedToNewContainer: null,
      activeID: '',
      currentInfoID: '',
      currentInfoType: 'course',
      activeTab: 'info',
      leftPanelTab: 'search',
      panelDimensions: {},
      searchQuery: '',
      searchResultMap: {},
      setRecentlyMovedToNewContainer: (flag: RefObject<boolean>) =>
        set({ recentlyMovedToNewContainer: flag }),
      setActiveID: (id: SemesterID) => {
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
      setLeftPanelTab: (tab: 'search' | 'create') => set({ leftPanelTab: tab }),
      setPanelDimension: (key: string, value: number) =>
        set((state) => ({
          panelDimensions: {
            ...state.panelDimensions,
            [key]: value,
          },
        })),
      getPanelDimension: (key: string, defaultValue: number) => {
        return get().panelDimensions[key] ?? defaultValue;
      },
      setSearchQuery: (query: string) => {
        set({ searchQuery: query, leftPanelTab: 'search' });
      },
    }),
    {
      name: AUXILIARY_STORAGE_KEY,
      partialize: (state) => ({
        panelDimensions: state.panelDimensions,
        activeTab: state.activeTab,
        leftPanelTab: state.leftPanelTab,
      }),
    }
  )
);

export default useAuxiliaryStore;
