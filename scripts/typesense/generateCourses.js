#!/usr/bin/env node
/**
 * generateCourses.js
 *
 * Generates a JSONL file with random course data.
 */

const path = require('path');
const envFile =
  process.env.NODE_ENV === 'production' ? '.env.prod' : '.env.dev';
require('dotenv').config({ path: path.resolve(__dirname, '../../' + envFile) });
const fs = require('fs');

/** Helper to pick a random element from an array */
function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Fake data helpers
const coursePrefixes = [
  'Advanced',
  'Introduction to',
  'Fundamentals of',
  'Applied',
  'Topics in',
  'Principles of',
  'Modern',
  'Contemporary',
  'Theoretical',
  'Experimental',
];

const courseSubjects = [
  'Programming',
  'Computer Science',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Literature',
  'History',
  'Economics',
  'Psychology',
  'Philosophy',
  'Engineering',
  'Data Science',
  'Artificial Intelligence',
  'Business',
  'Statistics',
];

const courseSpecializations = [
  'Analysis',
  'Theory',
  'Applications',
  'Methods',
  'Systems',
  'Design',
  'Research',
  'Studies',
  'Development',
  'Architecture',
  'Algorithms',
];

const courseNumbers = ['101', '201', '301', '401', '501'];

/** Generate a random course name */
function generateCourseName() {
  const usePrefix = Math.random() > 0.3; // 70% chance to use prefix
  const useSpecialization = Math.random() > 0.5; // 50% chance to use specialization
  const useNumber = Math.random() > 0.3; // 70% chance to use number

  let name = '';

  if (usePrefix) {
    name += pickRandom(coursePrefixes) + ' ';
  }

  name += pickRandom(courseSubjects);

  if (useSpecialization) {
    name += ' ' + pickRandom(courseSpecializations);
  }

  if (useNumber) {
    name += ' ' + pickRandom(courseNumbers);
  }

  return name;
}

const gradeOptions = [null, 'A', 'B', 'C', 'D', 'F'];
const coresOptions = [
  'math',
  'science',
  'literature',
  'computer-science',
  'arts',
];

/** Generate a random Course object */
function getRandomCourse(id) {
  const selectedCores = Array.from(
    new Set([pickRandom(coresOptions), pickRandom(coresOptions)])
  );

  return {
    id: `course-${id}`,
    name: generateCourseName(),
    credits: Math.floor(Math.random() * 5) + 1,
    cores: selectedCores,
    grade: pickRandom(gradeOptions),
  };
}

// Number of courses to generate
const NUMBER_OF_COURSES = 50;

// Where we'll output the JSONL file
const OUTPUT_FILE = path.join(__dirname, 'courses.jsonl');

// Create a write stream
const writeStream = fs.createWriteStream(OUTPUT_FILE);

for (let i = 1; i <= NUMBER_OF_COURSES; i++) {
  const course = getRandomCourse(i);
  writeStream.write(JSON.stringify(course) + '\n');
}

writeStream.end(() => {
  console.log(`✅ Generated ${NUMBER_OF_COURSES} courses to ${OUTPUT_FILE}`);
});
