import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const q = searchParams.get('q');

  if (!q || q.trim().length < 2) {
    return Response.json({ results: [] });
  }

  // Limit query length to prevent abuse
  const sanitizedQuery = q.trim().slice(0, 100);

  const url = new URL('https://geocoding-api.open-meteo.com/v1/search');
  url.searchParams.set('name', sanitizedQuery);
  url.searchParams.set('count', '6');
  url.searchParams.set('language', 'en');
  url.searchParams.set('format', 'json');

  try {
    const response = await fetch(url.toString(), {
      next: { revalidate: 86400 },
    });

    if (!response.ok) {
      return Response.json({ results: [] });
    }

    const data = await response.json();
    return Response.json({ results: data.results || [] });
  } catch {
    return Response.json({ results: [] }, { status: 500 });
  }
}
