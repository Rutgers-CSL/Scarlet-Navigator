import { NextRequest, NextResponse } from 'next/server';
import { CAMPUSES, LEVELS } from '@/lib/constants';
import { Course } from '@/lib/types/models';
import Typesense from 'typesense';

export async function POST(request: NextRequest) {
  try {
    if (
      !process.env.TYPESENSE_API_KEY ||
      !process.env.TYPESENSE_HOST ||
      !process.env.TYPESENSE_PORT
    ) {
      return NextResponse.json(
        { error: 'Required Typesense environment variables are not set' },
        { status: 500 }
      );
    }

    const formData = await request.json();

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

    const searchResults = await client
      .collections('master')
      .documents()
      .search(searchParams);

    if (!searchResults.hits) {
      return NextResponse.json([], { status: 200 });
    }

    const courses = searchResults.hits.map((hit) => {
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

      const school = rawCourse.school.description;
      const level = rawCourse.level === LEVELS.G ? LEVELS.G : LEVELS.UG;
      const mainCampus =
        CAMPUSES[rawCourse.mainCampus as keyof typeof CAMPUSES];

      const courseName =
        rawCourse.expandedTitle && rawCourse.expandedTitle.trim().length > 0
          ? rawCourse.expandedTitle
          : rawCourse.title;

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

    return NextResponse.json(courses, { status: 200 });
  } catch (error) {
    console.error('Search courses API error:', error);
    return NextResponse.json(
      { error: 'Failed to search courses' },
      { status: 500 }
    );
  }
}
