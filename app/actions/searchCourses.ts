'use server';

import { CAMPUSES, LEVELS } from '@/lib/constants';
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
    query_by: ['title', 'expandedTitle', 'courseString'],
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
      const rawCourse = hit.document as {
        subject: string;
        preReqNotes: string;
        courseString: string;
        school: {
          code: string;
          description: string;
        };
        credits: number;
        subjectDescription: string;
        coreCodes: {
          coreCode: string;
        }[];
        expandedTitle: string;
        mainCampus: string;
        level: string;
        synopsisUrl: string;
        lastOffered: string;
        title: string;
      };

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
            "Last Offered": "Spring2025",
            "coreCodes": [
              {
                  "id": "2024901198105  21",
                  "year": "2024",
                  "term": "9",
                  "lastUpdated": 1468423768000,
                  "description": "Information Technology and Research",
                  "offeringUnitCode": "01",
                  "offeringUnitCampus": "NB",
                  "code": "ITR",
                  "unit": "01",
                  "course": "105",
                  "subject": "198",
                  "effective": "20249",
                  "coreCodeReferenceId": "21",
                  "coreCode": "ITR",
                  "coreCodeDescription": "Information Technology and Research",
                  "supplement": "  "
              },
            ]
          },
       */

      const school = rawCourse.school.description;
      const level = rawCourse.level === LEVELS.G ? LEVELS.G : LEVELS.UG;
      const mainCampus =
        CAMPUSES[rawCourse.mainCampus as keyof typeof CAMPUSES];

      const courseName = rawCourse.expandedTitle || rawCourse.title;

      const credits = rawCourse.credits || 0;
      const cores = rawCourse.coreCodes
        ? rawCourse.coreCodes.map((core: { coreCode: string }) => core.coreCode)
        : [];

      const course: Course = {
        id: rawCourse.courseString,
        name: courseName,
        credits: credits,
        level: level,
        school: school,
        mainCampus: mainCampus,
        cores: cores,
        grade: null,
        prereqNotes: rawCourse.preReqNotes,
        lastOffered: rawCourse['lastOffered'],
      };
      return course;
    });
  } catch (error) {
    console.error('searchCoursesAction error:', error);
    throw error;
  }
}
