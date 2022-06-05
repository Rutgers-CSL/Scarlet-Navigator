import React from 'react';

interface Course {
  title: string;
}

interface CourseInfoProps {
  course: Course;
}

function CourseInfo(props: CourseInfoProps) {
  const { course } = props;
  return (
    <div className="bg-green-300 grow">
      {!course ? <>T</> : course.title}
    </div>
  );
}

export default CourseInfo;