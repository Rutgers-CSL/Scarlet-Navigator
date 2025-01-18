'use client';

import { useScheduleStore } from './stores/useScheduleStore';
import { useProgramFulfillment } from './stores/useProgramFulfillment';
import { Course, CoreCategory, CoreRequirement } from '@/lib/types/models';

/**
 * interface ProgramOfStudy {
 *  name: str;
 *  coreCategories<CoreCategory_ids>[];
 * }
 *
 *
 */

interface CoreProgress {
  currentCredits: number;
  requiredCredits: number;
  isSatisfied: boolean;
}

interface CategoryProgress {
  satisfiedCores: number;
  requiredCores: number;
  isSatisfied: boolean;
  cores: Record<string, CoreProgress>;
}

export function useCoreRequirements() {
  const courses = useScheduleStore((state) => state.courses);
  const categories = useProgramFulfillment((state) => state.categories);

  const calculateCoreProgress = (
    core: CoreRequirement,
    courses: Record<string, Course>
  ): CoreProgress => {
    let currentCredits = 0;

    // Sum up credits from courses that have this core
    Object.values(courses).forEach((course) => {
      if (course.cores.includes(core.name)) {
        currentCredits += course.credits;
      }
    });

    return {
      currentCredits,
      requiredCredits: core.requiredCredits,
      isSatisfied: currentCredits >= core.requiredCredits,
    };
  };

  const calculateCategoryProgress = (
    category: CoreCategory,
    courses: Record<string, Course>
  ): CategoryProgress => {
    const coreProgress: Record<string, CoreProgress> = {};
    let satisfiedCores = 0;

    category.cores.forEach((core) => {
      const progress = calculateCoreProgress(core, courses);
      coreProgress[core.id] = progress;
      if (progress.isSatisfied) {
        satisfiedCores++;
      }
    });

    return {
      satisfiedCores,
      requiredCores: category.cores.length,
      isSatisfied: satisfiedCores >= category.cores.length,
      cores: coreProgress,
    };
  };

  const calculateAllProgress = () => {
    const progress: Record<string, CategoryProgress> = {};

    Object.values(categories).forEach((category) => {
      progress[category.id] = calculateCategoryProgress(category, courses);
    });

    return progress;
  };

  return {
    calculateAllProgress,
    calculateCategoryProgress,
    calculateCoreProgress,
  };
}
