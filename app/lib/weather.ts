export interface WeatherDay {
  date: string;
  tempMax: number;
  tempMin: number;
  precip: number; // inches
  precipHours: number; // hours with precipitation
  snowfall: number; // inches
  weatherCode: number; // WMO code
  sunrise: string; // ISO datetime e.g. "2024-03-05T06:52"
  sunset: string; // ISO datetime
  sunshineDuration: number; // seconds
  windSpeedMax: number; // mph
  windGustsMax: number; // mph
  windDirectionDominant: number; // degrees 0-360
  uvIndexMax: number;
}

export interface Location {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string;
}

export type WeatherIconType = 'sun' | 'partly-cloudy' | 'mostly-cloudy' | 'cloudy' | 'rain' | 'snow';

/** Map WMO weather code to an icon type. */
export function getWeatherIconType(code: number): WeatherIconType {
  if (code === 0) return 'sun';
  if (code === 1) return 'partly-cloudy';
  if (code === 2) return 'mostly-cloudy';
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
  if (snowfall > 0) return `❄️ ${snowfall.toFixed(1)}"`;
  return `💧 ${precip.toFixed(2)}"`;
}

/** Map WMO weather code to a human-readable condition label. */
export function getConditionLabel(code: number): string {
  const map: Record<number, string> = {
    0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
    45: 'Fog', 48: 'Rime fog',
    51: 'Light drizzle', 53: 'Moderate drizzle', 55: 'Dense drizzle',
    61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain',
    66: 'Light freezing rain', 67: 'Heavy freezing rain',
    71: 'Slight snowfall', 73: 'Moderate snowfall', 75: 'Heavy snowfall', 77: 'Snow grains',
    80: 'Slight showers', 81: 'Moderate showers', 82: 'Violent showers',
    85: 'Slight snow showers', 86: 'Heavy snow showers',
    95: 'Thunderstorm', 96: 'Thunderstorm w/ hail', 99: 'Thunderstorm w/ heavy hail',
  };
  return map[code] ?? 'Unknown';
}

/** Convert wind direction degrees to an 8-point compass bearing. */
export function getWindDirection(degrees: number): string {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(degrees / 45) % 8];
}

/** Human-readable UV index risk level. */
export function getUvLabel(uv: number): string {
  if (uv <= 2) return 'Low';
  if (uv <= 5) return 'Moderate';
  if (uv <= 7) return 'High';
  if (uv <= 10) return 'Very High';
  return 'Extreme';
}

/** Format an ISO datetime string (e.g. "2024-03-05T06:52") to "6:52 AM". */
export function formatSunTime(isoStr: string): string {
  const timePart = isoStr.split('T')[1];
  if (!timePart) return isoStr;
  const [hStr, mStr] = timePart.split(':');
  let h = parseInt(hStr, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  return `${h}:${mStr} ${ampm}`;
}

/** Format sunshine duration from seconds to a human-readable string. */
export function formatSunshineDuration(seconds: number): string {
  if (seconds <= 0) return 'None';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);
  if (hours === 0) return `${minutes} min`;
  if (minutes === 0) return `${hours} hr${hours !== 1 ? 's' : ''}`;
  return `${hours}h ${minutes}m`;
}

/** Format a YYYY-MM-DD date string to "Fri, Mar 5, 2025". */
export function formatDateShort(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  });
}
