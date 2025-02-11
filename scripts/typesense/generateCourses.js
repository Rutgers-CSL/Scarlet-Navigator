#!/usr/bin/env node
/**
 * generateCourses.js
 *
 * Generates a JSONL file with random course data.
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');

/** Helper to pick a random element from an array */
function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Fake data helpers
const courseNames = [
  'Introduction to Programming',
  'Calculus I',
  'English Literature',
  'Art History',
  'Data Structures',
  'Web Development',
  'Chemistry 101',
  'Biology Basics',
  'Microeconomics',
  'Macroeconomics',
];

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
  // Generate 1-2 random cores (ensure uniqueness by using a Set)
  const selectedCores = Array.from(
    new Set([pickRandom(coresOptions), pickRandom(coresOptions)])
  );

  return {
    id: `course-${id}`,
    name: pickRandom(courseNames),
    credits: Math.floor(Math.random() * 5) + 1, // 1 through 5
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
