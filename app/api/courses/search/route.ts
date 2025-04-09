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
    const searchMode = formData.searchMode || 'Name'; // Default to Name search
    const page = parseInt(formData.page) || 1;
    const per_page = parseInt(formData.per_page) || 10;

    // 3. Build the base URL + query params
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const host = process.env.TYPESENSE_HOST;
    const port = process.env.TYPESENSE_PORT;
    const apiKey = process.env.TYPESENSE_SEARCH_ONLY_API_KEY;

    const baseUrl = `${protocol}://${host}:${port}/collections`;

    // 4. Now perform the search in the "master" collection via GET
    // Construct a URL with the necessary query params
    const searchUrl = new URL(`${baseUrl}/master/documents/search`);
    searchUrl.searchParams.set('q', q);

    // Set query fields based on search mode
    const queryFields =
      searchMode === 'Core'
        ? 'coreCodes.coreCode'
        : 'title,expandedTitle,courseString';
    searchUrl.searchParams.set('query_by', queryFields);

    // Set pagination parameters
    const offset = (page - 1) * per_page;
    searchUrl.searchParams.set('page', page.toString());
    searchUrl.searchParams.set('per_page', per_page.toString());

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

    // 5. Parse the search JSON
    const searchData = await searchRes.json();
    const searchResults = searchData.hits || []; // Typically an array
    const totalResults = searchData.found || 0; // Total number of matches found

    // 6. Transform your raw hits into Course objects
    const seenIds = new Set();
    const courses = searchResults
      .map((hit: { document: RawCourse }) => {
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
      })
      .filter((course: Course) => {
        const courseIdString = String(course.id);
        if (seenIds.has(courseIdString)) {
          return false; // Skip this course as its ID is a duplicate
        }
        seenIds.add(courseIdString);
        return true;
      });

    return Response.json(
      {
        courses,
        totalResults,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Search courses API error:', error);
    return Response.json(
      { error: 'Failed to search courses' },
      { status: 500 }
    );
  }
}
