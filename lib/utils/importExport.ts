import { saveAs } from 'file-saver';
import { useScheduleStore } from '@/lib/hooks/stores/useScheduleStore';
import { useSettingsStore } from '@/lib/hooks/stores/useSettingsStore';
import { useNotesStore } from '@/lib/hooks/stores/useNotesStore';
import useAuxiliaryStore from '@/lib/hooks/stores/useAuxiliaryStore';
import useHistoryStore from '@/lib/hooks/stores/useHistoryStore';
import {
  APP_VERSION,
  checkVersionCompatibility,
} from '@/lib/utils/validation/version';
import {
  ALL_STORAGE_KEYS,
  SCHEDULE_STORAGE_KEY,
  NOTES_STORAGE_KEY,
  SETTINGS_STORAGE_KEY,
  AUXILIARY_STORAGE_KEY,
  PROGRAM_FULFILLMENT_STORAGE_KEY,
} from '@/lib/hooks/stores/storeKeys';

// Types
export type ExportOptions = {
  schedule?: boolean;
  settings?: boolean;
  notes?: boolean;
  auxiliary?: boolean;
  history?: boolean;
  programFulfillment?: boolean;
};

export type ImportResult = {
  success: boolean;
  errors: string[];
  warnings?: string[];
};

export type ExportMetadata = {
  version: string;
  exportDate: string;
  options: ExportOptions;
};

// Default export options
const DEFAULT_EXPORT_OPTIONS: ExportOptions = {
  schedule: true,
  settings: true,
  notes: true,
  auxiliary: true,
  history: true,
  programFulfillment: true,
};

// Required fields for validation
const REQUIRED_FIELDS: Record<string, string[]> = {
  [SCHEDULE_STORAGE_KEY]: ['courses', 'coursesBySemesterID', 'semesterByID'],
  [NOTES_STORAGE_KEY]: ['notes'],
  [SETTINGS_STORAGE_KEY]: ['gradePoints', 'visuals', 'general'],
  [AUXILIARY_STORAGE_KEY]: ['panelDimensions'],
  [PROGRAM_FULFILLMENT_STORAGE_KEY]: ['categories', 'programs'],
};

// Store key to human-readable name mapping
const STORE_NAMES: Record<string, string> = {
  [SCHEDULE_STORAGE_KEY]: 'schedule',
  [NOTES_STORAGE_KEY]: 'notes',
  [SETTINGS_STORAGE_KEY]: 'settings',
  [AUXILIARY_STORAGE_KEY]: 'auxiliary',
  [PROGRAM_FULFILLMENT_STORAGE_KEY]: 'program fulfillment',
  history: 'history',
};

// Maps options to store keys for loading and saving
const OPTION_TO_STORE_MAP = {
  schedule: SCHEDULE_STORAGE_KEY,
  settings: SETTINGS_STORAGE_KEY,
  notes: NOTES_STORAGE_KEY,
  auxiliary: AUXILIARY_STORAGE_KEY,
  programFulfillment: PROGRAM_FULFILLMENT_STORAGE_KEY,
};

/**
 * Helper function to get store data for export
 */
const getStoreData = (options: ExportOptions): Record<string, any> => {
  const data: Record<string, any> = {
    metadata: {
      version: APP_VERSION,
      exportDate: new Date().toISOString(),
      options,
    },
  };

  // Always include notes if schedule is selected
  const opts = {
    ...options,
    notes: options.notes || options.schedule,
  };

  // Get localStorage data for each selected store
  Object.entries(OPTION_TO_STORE_MAP).forEach(([option, key]) => {
    if (opts[option as keyof ExportOptions]) {
      data[key] = localStorage.getItem(key);
    }
  });

  // Handle history separately since it's not in localStorage
  if (opts.history) {
    const historyState = useHistoryStore.getState();
    data['history'] = {
      past: historyState.past,
      future: historyState.future,
    };
  }

  return data;
};

/**
 * Helper function to validate JSON structure
 */
const validateJsonStructure = (
  key: string,
  jsonStr: string | null,
  result: ImportResult
): boolean => {
  if (!jsonStr) {
    result.errors.push(`Missing ${STORE_NAMES[key]} data`);
    return false;
  }

  try {
    const parsed = JSON.parse(jsonStr);
    if (!parsed.state) {
      result.errors.push(
        `Invalid ${STORE_NAMES[key]} data: missing state property`
      );
      return false;
    }
    return true;
  } catch (error) {
    result.errors.push(
      `Invalid ${STORE_NAMES[key]} data: ${(error as Error).message}`
    );
    return false;
  }
};

/**
 * Helper function to validate specific store structure
 */
const validateStoreStructure = (
  key: string,
  jsonStr: string | null,
  requiredFields: string[],
  result: ImportResult
): boolean => {
  if (!validateJsonStructure(key, jsonStr, result)) {
    return false;
  }

  try {
    const parsed = JSON.parse(jsonStr || '');
    const missingFields = requiredFields.filter(
      (field) => !parsed.state.hasOwnProperty(field)
    );

    if (missingFields.length > 0) {
      result.errors.push(
        `Invalid ${STORE_NAMES[key]} data: missing required fields: ${missingFields.join(', ')}`
      );
      return false;
    }

    return true;
  } catch (error) {
    result.errors.push(
      `Error validating ${STORE_NAMES[key]} structure: ${(error as Error).message}`
    );
    return false;
  }
};

/**
 * Helper function to validate history data
 */
const validateHistoryData = (data: any, result: ImportResult): boolean => {
  if (!data) {
    result.errors.push('Missing history data');
    return false;
  }

  if (!Array.isArray(data.past)) {
    result.errors.push('Invalid history data: past should be an array');
    return false;
  }

  if (!Array.isArray(data.future)) {
    result.errors.push('Invalid history data: future should be an array');
    return false;
  }

  return true;
};

/**
 * Validates imported data to ensure it matches expected structure
 */
const validateImportData = (
  data: Record<string, any>,
  options: ExportOptions
): ImportResult => {
  const result: ImportResult = { success: true, errors: [], warnings: [] };

  // Check for metadata and version compatibility
  if (!data.metadata) {
    result.warnings?.push(
      'No metadata found in import file. This may be from an older version.'
    );
  } else {
    // Use the version compatibility checker
    const versionCheck = checkVersionCompatibility(data.metadata.version);
    if (!versionCheck.compatible) {
      result.errors.push(versionCheck.message);
      result.success = false;
    } else if (versionCheck.message !== 'Versions match.') {
      result.warnings?.push(versionCheck.message);
    }
  }

  // Always validate notes if schedule is selected
  const opts = {
    ...options,
    notes: options.notes || options.schedule,
  };

  // Validate each selected store
  Object.entries(OPTION_TO_STORE_MAP).forEach(([option, key]) => {
    if (opts[option as keyof ExportOptions]) {
      const storeData = data[key];
      const fields = REQUIRED_FIELDS[key];

      if (!validateStoreStructure(key, storeData, fields, result)) {
        result.success = false;
      }
    }
  });

  // Validate history separately
  if (opts.history && !validateHistoryData(data.history, result)) {
    result.success = false;
  }

  return result;
};

/**
 * Helper function to apply data to stores
 */
const applyDataToStores = (
  data: Record<string, any>,
  options: ExportOptions
): void => {
  // Always include notes if schedule is selected
  const opts = {
    ...options,
    notes: options.notes || options.schedule,
  };

  // Update localStorage and stores for each selected option
  if (opts.schedule) {
    localStorage.setItem(SCHEDULE_STORAGE_KEY, data[SCHEDULE_STORAGE_KEY]);
    useScheduleStore.setState(JSON.parse(data[SCHEDULE_STORAGE_KEY]).state);
  }

  if (opts.notes) {
    localStorage.setItem(NOTES_STORAGE_KEY, data[NOTES_STORAGE_KEY]);
    useNotesStore.setState(JSON.parse(data[NOTES_STORAGE_KEY]).state);
  }

  if (opts.settings) {
    localStorage.setItem(SETTINGS_STORAGE_KEY, data[SETTINGS_STORAGE_KEY]);
    useSettingsStore.setState(JSON.parse(data[SETTINGS_STORAGE_KEY]).state);
  }

  if (opts.auxiliary) {
    localStorage.setItem(AUXILIARY_STORAGE_KEY, data[AUXILIARY_STORAGE_KEY]);
    useAuxiliaryStore.setState(JSON.parse(data[AUXILIARY_STORAGE_KEY]).state);
  }

  if (opts.history && data.history) {
    useHistoryStore.setState({
      past: data.history.past || [],
      future: data.history.future || [],
    });
  }
};

/**
 * Exports selected store data to a JSON file
 */
export const exportData = (
  options: ExportOptions = DEFAULT_EXPORT_OPTIONS,
  filename = 'scarlet-navigator-export.json'
): void => {
  const exportData = getStoreData(options);
  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: 'application/json',
  });
  saveAs(blob, filename);
};

/**
 * Imports data from a JSON file and updates stores
 */
export const importData = (
  jsonData: string,
  options: ExportOptions = DEFAULT_EXPORT_OPTIONS
): ImportResult => {
  try {
    const data = JSON.parse(jsonData);

    // Validate the data first
    const validationResult = validateImportData(data, options);
    if (!validationResult.success) {
      return validationResult;
    }

    // Create a backup before importing
    const backup: Record<string, string | null> = {};
    ALL_STORAGE_KEYS.forEach((key) => {
      backup[key] = localStorage.getItem(key);
    });

    try {
      // Apply the data to stores
      applyDataToStores(data, options);

      return {
        success: true,
        errors: [],
        warnings: validationResult.warnings,
      };
    } catch (error) {
      // Restore from backup if something went wrong during import
      ALL_STORAGE_KEYS.forEach((key) => {
        if (backup[key]) {
          localStorage.setItem(key, backup[key]!);
        } else {
          localStorage.removeItem(key);
        }
      });

      return {
        success: false,
        errors: [
          `Error during import, restored previous data: ${(error as Error).message}`,
        ],
      };
    }
  } catch (error) {
    return {
      success: false,
      errors: [`Failed to import data: ${(error as Error).message}`],
    };
  }
};

/**
 * Loads data from a file input and imports it
 */
export const importFromFile = async (
  file: File,
  options: ExportOptions = DEFAULT_EXPORT_OPTIONS
): Promise<ImportResult> => {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      if (event.target?.result) {
        const jsonData = event.target.result as string;
        const result = importData(jsonData, options);
        resolve(result);
      } else {
        resolve({
          success: false,
          errors: ['Failed to read file'],
        });
      }
    };

    reader.onerror = () => {
      resolve({
        success: false,
        errors: ['Error reading file'],
      });
    };

    reader.readAsText(file);
  });
};
