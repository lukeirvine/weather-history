import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  if (!lat || !lon || !startDate || !endDate) {
    return Response.json({ error: 'Missing required parameters' }, { status: 400 });
  }

  // Validate coordinates to prevent SSRF
  const latNum = parseFloat(lat);
  const lonNum = parseFloat(lon);
  if (isNaN(latNum) || isNaN(lonNum) || latNum < -90 || latNum > 90 || lonNum < -180 || lonNum > 180) {
    return Response.json({ error: 'Invalid coordinates' }, { status: 400 });
  }

  // Validate date format (YYYY-MM-DD only)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
    return Response.json({ error: 'Invalid date format' }, { status: 400 });
  }

  const url = new URL('https://archive-api.open-meteo.com/v1/archive');
  url.searchParams.set('latitude', latNum.toFixed(6));
  url.searchParams.set('longitude', lonNum.toFixed(6));
  url.searchParams.set('start_date', startDate);
  url.searchParams.set('end_date', endDate);
  url.searchParams.set(
    'daily',
    [
      'weather_code',
      'temperature_2m_max',
      'temperature_2m_min',
      'precipitation_sum',
      'precipitation_hours',
      'snowfall_sum',
      'sunrise',
      'sunset',
      'sunshine_duration',
      'wind_speed_10m_max',
      'wind_gusts_10m_max',
      'wind_direction_10m_dominant',
    ].join(',')
  );
  url.searchParams.set('temperature_unit', 'fahrenheit');
  url.searchParams.set('precipitation_unit', 'inch');
  url.searchParams.set('wind_speed_unit', 'mph');
  url.searchParams.set('timezone', 'auto');

  try {
    const response = await fetch(url.toString(), {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      const text = await response.text();
      return Response.json(
        { error: 'Weather API error', details: text },
        { status: response.status }
      );
    }

    const data = await response.json();
    return Response.json(data);
  } catch {
    return Response.json({ error: 'Failed to fetch weather data' }, { status: 500 });
  }
}
