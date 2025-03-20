import { version } from '@/next.config';

/**
 * Application version inform tion
 * This should be updated when releas ing new versions
 * Follows semantic versioning (major.minor.patch)
 */

// Import version directly rather than from package.json
// as Next.js may have issues with direct package.json imports
export const APP_VERSION = version;

// Export other version-related utilities if needed
export const isNewerVersion = (v1: string, v2: string): boolean => {
  const v1Parts = v1.split('.').map(Number);
  const v2Parts = v2.split('.').map(Number);

  for (let i = 0; i < v1Parts.length; i++) {
    if (v1Parts[i] > v2Parts[i]) return true;
    if (v1Parts[i] < v2Parts[i]) return false;
  }

  return false;
};

// Export function to check compatibility
export const checkVersionCompatibility = (
  importedVersion: string
): { compatible: boolean; message: string } => {
  if (!importedVersion) {
    return {
      compatible: true,
      message:
        'No version information found. Import may not include all expected data.',
    };
  }

  if (importedVersion === APP_VERSION) {
    return { compatible: true, message: 'Versions match.' };
  }

  const importedParts = importedVersion.split('.').map(Number);
  const currentParts = APP_VERSION.split('.').map(Number);

  // Major version mismatch
  if (importedParts[0] !== currentParts[0]) {
    return {
      compatible: false,
      message: `Major version mismatch (imported: ${importedVersion}, current: ${APP_VERSION}). Import may fail or cause issues.`,
    };
  }

  // Minor version mismatch
  if (importedParts[1] !== currentParts[1]) {
    return {
      compatible: true,
      message: `Minor version difference (imported: ${importedVersion}, current: ${APP_VERSION}). Some features may not be compatible.`,
    };
  }

  // Patch version mismatch is generally safe
  return {
    compatible: true,
    message: `Different patch versions (imported: ${importedVersion}, current: ${APP_VERSION}). Should be compatible.`,
  };
};
