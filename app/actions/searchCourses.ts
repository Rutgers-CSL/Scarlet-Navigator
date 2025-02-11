'use server';

import Typesense from 'typesense';

function returnHostAndPort() {
  if (process.env.NODE_ENV === 'production') {
    return {
      host: process.env.TYPESENSE_HOST_PROD as string,
      port: parseInt(process.env.TYPESENSE_PORT_PROD as string),
    };
  }

  return {
    host: process.env.TYPESENSE_HOST_DEV as string,
    port: parseInt(process.env.TYPESENSE_PORT_DEV as string),
  };
}

interface SearchFormInput {
  q: string;
  filter_by?: string;
  sort_by?: string;
}

// Example "Server Action" that can be invoked via a <form> or programmatically.
export async function searchCoursesAction(formData: SearchFormInput) {
  if (
    !process.env.TYPESENSE_API_KEY ||
    !process.env.TYPESENSE_HOST_DEV ||
    !process.env.TYPESENSE_PORT_DEV
  ) {
    throw new Error(
      'TYPESENSE_API_KEY is not set in the environment variables'
    );
  }

  const q = formData.q || '*';
  const filter_by = formData.filter_by || '';
  const sort_by = formData.sort_by || '';

  const client = new Typesense.Client({
    nodes: [
      {
        host: returnHostAndPort().host,
        port: returnHostAndPort().port,
        protocol: 'http',
      },
    ],
    apiKey: process.env.TYPESENSE_API_KEY as string,
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

    return searchResults;
  } catch (error) {
    console.error('searchCoursesAction error:', error);
    throw error;
  }
}
