/**
 * Central location for all store keys used in localStorage
 * This ensures consistency and prevents typos when accessing store data
 */

export const SCHEDULE_STORAGE_KEY = 'schedule-storage';
export const NOTES_STORAGE_KEY = 'notes-storage';
export const SETTINGS_STORAGE_KEY = 'settings-storage';
export const AUXILIARY_STORAGE_KEY = 'auxiliary-storage';
export const PROGRAM_FULFILLMENT_STORAGE_KEY = 'program-fulfillment-storage';

// Combined list of all storage keys
export const ALL_STORAGE_KEYS = [
  SCHEDULE_STORAGE_KEY,
  NOTES_STORAGE_KEY,
  SETTINGS_STORAGE_KEY,
  AUXILIARY_STORAGE_KEY,
  PROGRAM_FULFILLMENT_STORAGE_KEY,
];
