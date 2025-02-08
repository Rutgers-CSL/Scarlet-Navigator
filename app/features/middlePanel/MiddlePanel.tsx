import dynamic from 'next/dynamic';

const ScheduleBoard = dynamic<{}>(
  () =>
    import('@/app/features/middlePanel/dashboard/ScheduleBoard').then(
      (mod) => mod.ScheduleBoard
    ),
  {
    ssr: false,
  }
);

export function MiddlePanel() {
  return (
    <div>
      <ScheduleBoard />
    </div>
  );
}
