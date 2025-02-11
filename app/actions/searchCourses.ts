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
    query_by: 'name',
    filter_by,
    sort_by,
  };

  try {
    const searchResults = await client
      .collections('courses')
      .documents()
      .search(searchParams);

    if (!searchResults.hits) {
      return [];
    }

    return searchResults.hits.map((hit) => hit.document as Course);
  } catch (error) {
    console.error('searchCoursesAction error:', error);
    throw error;
  }
}
