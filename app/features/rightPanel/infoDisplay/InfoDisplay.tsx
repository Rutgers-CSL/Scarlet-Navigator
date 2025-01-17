import useAuxiliaryStore from '@/lib/hooks/stores/useAuxiliaryStore';
import CourseInfo from './CourseInfo';
import SemesterInfo from './SemesterInfo';

export default function InfoDisplay() {
  const id = useAuxiliaryStore((state) => state.currentInfoID);
  const type = useAuxiliaryStore((state) => state.currentInfoType);

  if (!id) {
    return <div className='p-4 text-gray-500'>No item selected</div>;
  }

  if (type === 'course') {
    return <CourseInfo id={id} />;
  } else if (type === 'semester') {
    return <SemesterInfo id={id} />;
  }

  return null;
}
