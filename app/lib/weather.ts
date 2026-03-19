export interface WeatherDay {
  date: string;
  tempMax: number;
  tempMin: number;
  precip: number; // inches
  snowfall: number; // inches
  weatherCode: number; // WMO code
}

export interface Location {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string;
}

export type WeatherIconType = 'sun' | 'partly-cloudy' | 'cloudy' | 'rain' | 'snow';

/** Map WMO weather code to an icon type. */
export function getWeatherIconType(code: number): WeatherIconType {
  if (code === 0) return 'sun';
  if (code === 1 || code === 2) return 'partly-cloudy';
  if (code === 3 || code === 45 || code === 48) return 'cloudy';
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'snow';
  // 51-67 (drizzle/rain/freezing), 80-82 (showers), 95-99 (thunderstorm)
  return 'rain';
}

/** Derive approximate cloud cover % from WMO code. */
export function getCloudCoverFromCode(code: number): number {
  if (code === 0) return 0;
  if (code === 1) return 15;
  if (code === 2) return 45;
  if (code === 3) return 90;
  if (code === 45 || code === 48) return 100;
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 80;
  return 85; // all rain/drizzle/thunderstorm
}

/** Format a precipitation amount for display. */
export function formatPrecip(precip: number, snowfall: number): string | null {
  if (precip <= 0) return null;
  if (snowfall > 0) return `${snowfall.toFixed(1)}"❄`;
  return `${precip.toFixed(2)}"`;
}
