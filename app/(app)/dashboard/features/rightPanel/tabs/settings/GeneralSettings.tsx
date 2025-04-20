import {
  useSettingsStore,
  ValidTerm,
} from '@/lib/hooks/stores/useSettingsStore';
import { useScheduleStore } from '@/lib/hooks/stores/useScheduleStore';
import { useEffect } from 'react';
import { calculateSemesterTitle } from '@/lib/utils/calculations/semesterTitle';

export default function GeneralSettings() {
  const {
    beginningTerm,
    beginningYear,
    includeWinterAndSummerTerms,
    validatePrerequisites = true,
  } = useSettingsStore((state) => state.general);

  const setGeneral = useSettingsStore((state) => state.setGeneral);
  const semesterOrder = useScheduleStore((state) => state.semesterOrder);
  const updateSemester = useScheduleStore((state) => state.updateSemester);

  // Update all semester titles when settings change
  useEffect(
    () => {
      let _beginningTerm: ValidTerm = beginningTerm;
      const validTermsForStandardSchedule =
        beginningTerm == 'Fall' || beginningTerm == 'Spring';

      if (!includeWinterAndSummerTerms && !validTermsForStandardSchedule) {
        setGeneral({
          beginningTerm: 'Fall',
        });

        _beginningTerm = 'Fall';
      }

      semesterOrder.forEach((semesterId, index) => {
        const newTitle = calculateSemesterTitle(
          //reason why we have _beginningTerm is because setGeneral
          //occurs asynchronously with this function so it leads to some
          //weird race conditions

          _beginningTerm,
          beginningYear,
          index,
          includeWinterAndSummerTerms
        );
        updateSemester(semesterId, { title: newTitle });
      });
    },
    // intentional incomplete dependency array to prevent performance issues
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      beginningTerm,
      beginningYear,
      includeWinterAndSummerTerms,
      semesterOrder,
      updateSemester,
    ]
  );

  const handleTermChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setGeneral({
      beginningTerm: e.target.value as ValidTerm,
    });
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const year = parseInt(e.target.value);
    if (!isNaN(year)) {
      setGeneral({
        beginningYear: year,
      });
    }
  };

  const handleIncludeTermsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGeneral({
      includeWinterAndSummerTerms: e.target.checked,
    });
  };

  const handleValidatePrerequisitesChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setGeneral({
      validatePrerequisites: e.target.checked,
    });
  };

  // Generate year options from current year -10 to +10
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from(
    { length: 21 }, // -10 to +10 = 21 years
    (_, i) => currentYear - 10 + i
  );

  return (
    <div className='space-y-4'>
      <div className='form-control'>
        <label className='label'>
          <span className='label-text'>Starting Term</span>
        </label>
        <select
          className='select select-bordered w-full'
          value={beginningTerm}
          onChange={handleTermChange}
        >
          <option value='Fall'>Fall</option>
          <option value='Spring'>Spring</option>
          {includeWinterAndSummerTerms && (
            <>
              <option value='Winter'>Winter</option>
              <option value='Summer'>Summer</option>
            </>
          )}
        </select>
      </div>

      <div className='form-control'>
        <label className='label'>
          <span className='label-text'>Starting Year</span>
        </label>
        <select
          className='select select-bordered w-full'
          value={beginningYear}
          onChange={handleYearChange}
        >
          {yearOptions.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      <div className='form-control'>
        <label className='label cursor-pointer'>
          <span className='label-text'>Include Winter and Summer Terms</span>
          <input
            type='checkbox'
            className='toggle'
            checked={includeWinterAndSummerTerms}
            onChange={handleIncludeTermsChange}
          />
        </label>
      </div>

      <div className='form-control'>
        <label className='label cursor-pointer'>
          <span className='label-text'>
            Validate Prerequisites (Experimental)
          </span>
          <input
            type='checkbox'
            className='toggle'
            checked={validatePrerequisites}
            onChange={handleValidatePrerequisitesChange}
          />
        </label>
      </div>
    </div>
  );
}
