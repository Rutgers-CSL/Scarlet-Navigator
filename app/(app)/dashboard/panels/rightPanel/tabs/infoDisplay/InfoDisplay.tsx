import useAuxiliaryStore from '@/lib/hooks/stores/useAuxiliaryStore';
import CourseInfo from './CourseInfo';
import SemesterInfo from './SemesterInfo';

export default function InfoDisplay() {
  const id = useAuxiliaryStore((state) => state.currentInfoID);
  const type = useAuxiliaryStore((state) => state.currentInfoType);

  if (type === 'course') {
    return <CourseInfo id={id} />;
  } else if (type === 'semester') {
    return <SemesterInfo id={id} />;
  }

  return null;
}
