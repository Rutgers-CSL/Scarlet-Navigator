import { CAMPUSES, LEVELS } from '@/lib/constants';
import { Course } from '@/lib/types/models';

type RawCourse = {
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
 * We are not using the official TypeSense library because it was causing issues in the
 * CloudFlare Worker runtime. Object keys were inaccessible.
 */
export async function POST(request: Request) {
  try {
    // 1. Validate environment variables
    if (
      !process.env.TYPESENSE_SEARCH_ONLY_API_KEY ||
      !process.env.TYPESENSE_HOST ||
      !process.env.TYPESENSE_PORT
    ) {
      return Response.json(
        { error: 'Required Typesense environment variables are not set' },
        { status: 500 }
      );
    }

    // 2. Parse request body for search parameters
    const formData = await request.json();
    const q = formData.q || '*';
    const filter_by = formData.filter_by || '';
    const sort_by = formData.sort_by || '';

    // 3. Build the base URL + query params
    const protocol = 'https';
    const host = process.env.TYPESENSE_HOST;
    const port = process.env.TYPESENSE_PORT;
    const apiKey = process.env.TYPESENSE_SEARCH_ONLY_API_KEY;

    const baseUrl = `${protocol}://${host}:${port}/collections`;

    // 5. Now perform the search in the "master" collection via GET
    // Construct a URL with the necessary query params
    const searchUrl = new URL(`${baseUrl}/master/documents/search`);
    searchUrl.searchParams.set('q', q);
    searchUrl.searchParams.set('query_by', 'title,expandedTitle,courseString');
    if (filter_by) searchUrl.searchParams.set('filter_by', filter_by);
    if (sort_by) searchUrl.searchParams.set('sort_by', sort_by);

    const searchRes = await fetch(searchUrl.toString(), {
      method: 'GET',
      headers: {
        'X-TYPESENSE-API-KEY': apiKey,
      },
    });
    if (!searchRes.ok) {
      console.error('Search request failed:', searchRes.status);
      return Response.json({ error: 'Search request failed' }, { status: 500 });
    }

    // 6. Parse the search JSON
    const searchData = await searchRes.json();
    const searchResults = searchData.hits || []; // Typically an array

    // 7. Transform your raw hits into Course objects
    const courses = searchResults.map((hit: { document: RawCourse }) => {
      const rawCourse = hit.document;

      const school = rawCourse.school.description;
      const level = rawCourse.level === LEVELS.G ? LEVELS.G : LEVELS.UG;
      const mainCampus =
        CAMPUSES[rawCourse.mainCampus as keyof typeof CAMPUSES];

      const courseName =
        rawCourse.expandedTitle && rawCourse.expandedTitle.trim().length > 0
          ? rawCourse.expandedTitle
          : rawCourse.title;

      const credits = rawCourse.credits || 0;
      const cores = rawCourse.coreCodes?.map((core) => core.coreCode) || [];

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
        lastOffered: rawCourse.lastOffered,
      };
      return course;
    });

    return Response.json(courses, { status: 200 });
  } catch (error) {
    console.error('Search courses API error:', error);
    return Response.json(
      { error: 'Failed to search courses' },
      { status: 500 }
    );
  }
}
