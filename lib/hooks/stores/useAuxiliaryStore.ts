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
  leftPanelTab: 'search' | 'other';
  panelDimensions: Record<string, number>;
  searchQuery: string;
  selectedCampus: string;
  setRecentlyMovedToNewContainer: (flag: RefObject<boolean>) => void;
  setActiveID: (id: SemesterID) => void;
  setCurrentInfo: (
    id: string,
    type: 'course' | 'semester',
    preventSwitchToInfoTab?: boolean
  ) => void;
  setActiveTab: (tab: 'info' | 'tracker' | 'settings') => void;
  setLeftPanelTab: (tab: 'search' | 'other') => void;
  setPanelDimension: (key: string, value: number) => void;
  getPanelDimension: (key: string, defaultValue: number) => number;
  setSearchQuery: (query: string) => void;
  setSelectedCampus: (campus: string) => void;
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
      selectedCampus: 'NB', // Default to New Brunswick
      setRecentlyMovedToNewContainer: (flag: RefObject<boolean>) =>
        set({ recentlyMovedToNewContainer: flag }),
      setActiveID: (id: SemesterID) => {
        set({ activeID: id });
      },
      setCurrentInfo: (
        id: string,
        type: 'course' | 'semester',
        preventSwitchToInfoTab?: boolean
      ) => {
        set({
          currentInfoID: id,
          currentInfoType: type,
          activeTab: preventSwitchToInfoTab ? get().activeTab : 'info', // Switch to info tab when selection changes
        });
      },
      setActiveTab: (tab: 'info' | 'tracker' | 'settings') =>
        set({ activeTab: tab }),
      setLeftPanelTab: (tab: 'search' | 'other') => set({ leftPanelTab: tab }),
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
      setSelectedCampus: (campus: string) => {
        set({ selectedCampus: campus });
      },
    }),
    {
      name: AUXILIARY_STORAGE_KEY,
      partialize: (state) => ({
        panelDimensions: state.panelDimensions,
        activeTab: state.activeTab,
        leftPanelTab: state.leftPanelTab,
        selectedCampus: state.selectedCampus,
      }),
    }
  )
);

export default useAuxiliaryStore;
