import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import SortableItem from "../../middlePanel/dashboard/components/SortableItem";
import { useScheduleStore } from "@/lib/hooks/stores/useScheduleStore";
import { useState } from "react";
import CoreInput from "./components/CoreInput";

export const COURSE_CREATION_CONTAINER_ID = 'COURSE_CREATION_CONTAINER_ID';
export const COURSE_CREATION_COURSE_ID = '!_new_c_!';

export default function CourseCreation() {
  const [courseName, setCourseName] = useState("");
  const [credits, setCredits] = useState<number>(3);
  const [error, setError] = useState<string>("");
  const [currentCore, setCurrentCore] = useState("");
  const [selectedCores, setSelectedCores] = useState<string[]>([]);

  const coursesBySemesterID = useScheduleStore((state) => state.coursesBySemesterID);
  const courses = useScheduleStore((state) => state.courses);
  const addCourse = useScheduleStore((state) => state.addCourse);
  const globalCores = useScheduleStore((state) => state.globalCores);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!courseName.trim()) {
      setError("Course name is required");
      return;
    }

    if (credits < 1 || credits > 6) {
      setError("Credits must be between 1 and 6");
      return;
    }

    addCourse(courseName, credits, selectedCores);
    setCourseName("");
    setCredits(3);
    setSelectedCores([]);
    setError("");
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Course Creation</h1>

      <form onSubmit={handleSubmit} className="mb-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Course Name:
            <input
              type="text"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter course name"
            />
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Credits:
            <input
              type="number"
              value={credits}
              onChange={(e) => setCredits(Number(e.target.value))}
              min={1}
              max={6}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </label>
        </div>

        <CoreInput
          currentCore={currentCore}
          setCurrentCore={setCurrentCore}
          selectedCores={selectedCores}
          setSelectedCores={setSelectedCores}
          globalCores={globalCores}
        />

        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Create Course
        </button>
      </form>

      <div className="mt-4">
        <SortableContext
          items={coursesBySemesterID[COURSE_CREATION_CONTAINER_ID] || []}
          strategy={verticalListSortingStrategy}>
          {(coursesBySemesterID[COURSE_CREATION_CONTAINER_ID] || []).map((value) => (
            <SortableItem
              containerId={COURSE_CREATION_CONTAINER_ID}
              key={value}
              id={value}
              index={0}
              handle={false}
              renderItem={() => <div className="p-2">{courses[value]?.name || "Loading..."}</div>}
              style={() => ({
                margin: "8px 0",
                background: "white",
                borderRadius: "4px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
              })}
              wrapperStyle={() => ({})}
              getIndex={() => 0}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}