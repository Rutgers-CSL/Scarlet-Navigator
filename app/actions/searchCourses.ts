'use server';

import { Course } from '@/lib/types/models';
import Typesense from 'typesense';

interface SearchFormInput {
  q: string;
  filter_by?: string;
  sort_by?: string;
}

export async function searchCoursesAction(
  formData: SearchFormInput
): Promise<Course[]> {
  if (
    !process.env.TYPESENSE_API_KEY ||
    !process.env.TYPESENSE_HOST ||
    !process.env.TYPESENSE_PORT
  ) {
    throw new Error('Required Typesense environment variables are not set');
  }

  const q = formData.q || '*';
  const filter_by = formData.filter_by || '';
  const sort_by = formData.sort_by || '';

  const client = new Typesense.Client({
    nodes: [
      {
        host: process.env.TYPESENSE_HOST,
        port: parseInt(process.env.TYPESENSE_PORT),
        protocol: 'http',
      },
    ],
    apiKey: process.env.TYPESENSE_API_KEY,
    connectionTimeoutSeconds: 2,
  });

  const searchParams = {
    q,
    query_by: 'expandedTitle',
    filter_by,
    sort_by,
  };

  try {
    const searchResults = await client
      .collections('master')
      .documents()
      .search(searchParams);

    if (!searchResults.hits) {
      return [];
    }

    return searchResults.hits.map((hit) => {
      const rawCourse = hit.document as any;

      /**
       * Example of a raw course object in the master list:
       *
       * {
            "subject": "620",
            "preReqNotes": "",
            "courseString": "53:620:558",
            "school": {
                "code": "53",
                "description": "School of Business - Camden (Graduate)"
            },
            "credits": 1,
            "subjectDescription": "Management",
            "coreCodes": [],
            "expandedTitle": "LEAN SIX SIGMA GREEN BELT P2                                                    ",
            "mainCampus": "CM",
            "level": "G",
            "synopsisUrl": "",
            "Last Offered": "Spring2025"
          },
       */

      const school = rawCourse.school.description;
      const level = rawCourse.level === 'G' ? 'Graduate' : 'Undergraduate';
      const mainCampus =
        rawCourse.mainCampus === 'CM'
          ? 'Camden'
          : rawCourse.mainCampus === 'NB'
            ? 'New Brunswick'
            : rawCourse.mainCampus === 'NK'
              ? 'Newark'
              : 'Unknown Campus';

      const course: Course = {
        id: rawCourse.courseString,
        name: rawCourse.expandedTitle,
        credits: rawCourse.credits,
        level: level,
        school: school,
        mainCampus: mainCampus,
        cores: ['hello'],
        grade: null,
        prereqNotes: rawCourse.preReqNotes,
      };
      return course;
    });
  } catch (error) {
    console.error('searchCoursesAction error:', error);
    throw error;
  }
}
