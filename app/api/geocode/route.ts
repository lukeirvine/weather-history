import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const id = searchParams.get('id');

  // Reverse-geocode coordinates → nearest city via Nominatim, then resolve in open-meteo
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  if (lat && lon) {
    try {
      const nominatimUrl = new URL('https://nominatim.openstreetmap.org/reverse');
      nominatimUrl.searchParams.set('format', 'json');
      nominatimUrl.searchParams.set('lat', lat);
      nominatimUrl.searchParams.set('lon', lon);
      nominatimUrl.searchParams.set('zoom', '10');
      nominatimUrl.searchParams.set('addressdetails', '1');
      const nomRes = await fetch(nominatimUrl.toString(), {
        headers: { 'User-Agent': 'weather-history-app/1.0' },
        cache: 'no-store',
      });
      if (!nomRes.ok) return Response.json({ error: 'Reverse geocode failed' }, { status: 502 });
      const nomData = await nomRes.json();
      const address = nomData.address ?? {};
      const cityName = address.city ?? address.town ?? address.village ?? address.county ?? nomData.name;
      if (!cityName) return Response.json({ error: 'No city found' }, { status: 404 });

      // Search open-meteo for the resolved city name — fetch several candidates
      // and pick the one geographically closest to the user's actual coordinates
      const searchUrl = new URL('https://geocoding-api.open-meteo.com/v1/search');
      searchUrl.searchParams.set('name', cityName);
      searchUrl.searchParams.set('count', '10');
      searchUrl.searchParams.set('language', 'en');
      searchUrl.searchParams.set('format', 'json');
      const geoRes = await fetch(searchUrl.toString(), { next: { revalidate: 86400 } });
      if (!geoRes.ok) return Response.json({ error: 'Geocoding lookup failed' }, { status: 502 });
      const geoData = await geoRes.json();
      const candidates: { id: number; name: string; latitude: number; longitude: number; country_code?: string; country?: string; admin1?: string }[] = geoData.results ?? [];
      if (!candidates.length) return Response.json({ error: 'No results' }, { status: 404 });

      const userLat = parseFloat(lat);
      const userLon = parseFloat(lon);
      const closest = candidates.reduce((best, c) => {
        const dLat = c.latitude - userLat;
        const dLon = c.longitude - userLon;
        const dist = dLat * dLat + dLon * dLon;
        const dLatB = best.latitude - userLat;
        const dLonB = best.longitude - userLon;
        const distB = dLatB * dLatB + dLonB * dLonB;
        return dist < distB ? c : best;
      });
      return Response.json(closest);
    } catch {
      return Response.json({ error: 'Reverse geocode error' }, { status: 500 });
    }
  }

  // Fetch a single location by numeric ID
  if (id) {
    const numericId = parseInt(id, 10);
    if (!Number.isFinite(numericId) || numericId <= 0) {
      return Response.json({ error: 'Invalid id' }, { status: 400 });
    }
    const url = new URL('https://geocoding-api.open-meteo.com/v1/get');
    url.searchParams.set('id', String(numericId));
    url.searchParams.set('language', 'en');
    url.searchParams.set('format', 'json');
    try {
      const response = await fetch(url.toString(), { next: { revalidate: 86400 } });
      if (!response.ok) return Response.json({ error: 'Not found' }, { status: 404 });
      const data = await response.json();
      return Response.json(data);
    } catch {
      return Response.json({ error: 'Geocoding error' }, { status: 500 });
    }
  }

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
