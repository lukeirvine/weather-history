'use client';

import { useState, useEffect, useCallback } from 'react';
import CalendarTemplate from '@/app/components/templates/calendar-template';
import { type WeatherDay } from '@/app/lib/weather';
import { useLocation } from '@/app/components/context/location-context';
import { useMonthYear } from '@/app/components/context/month-year-context';

const TODAY = new Date();

export default function CalendarContent() {
  const { location } = useLocation();
  const { viewMonth, viewYear } = useMonthYear();
  const [weatherData, setWeatherData] = useState<Record<string, WeatherDay>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = useCallback(async () => {
    if (!location) return;

    setLoading(true);
    setError(null);

    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const mm = String(viewMonth + 1).padStart(2, '0');
    const startDate = `${viewYear}-${mm}-01`;
    // Cap endDate to yesterday — the archive API rejects today or future dates
    const yesterday = new Date(TODAY);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastDay = new Date(viewYear, viewMonth, daysInMonth);
    const effectiveEnd = lastDay < yesterday ? lastDay : yesterday;
    const endDate = `${effectiveEnd.getFullYear()}-${String(effectiveEnd.getMonth() + 1).padStart(2, '0')}-${String(effectiveEnd.getDate()).padStart(2, '0')}`;

    // If the entire month is in the future (or start > end), nothing to fetch
    if (startDate > endDate) {
      setLoading(false);
      setWeatherData({});
      return;
    }

    try {
      const res = await fetch(
        `/api/weather?lat=${location.latitude}&lon=${location.longitude}&startDate=${startDate}&endDate=${endDate}`
      );

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const record: Record<string, WeatherDay> = {};
      const { daily } = data;

      if (daily?.time) {
        (daily.time as string[]).forEach((date, i) => {
          record[date] = {
            date,
            tempMax: Math.round(daily.temperature_2m_max[i] ?? 0),
            tempMin: Math.round(daily.temperature_2m_min[i] ?? 0),
            precip: daily.precipitation_sum[i] ?? 0,
            precipHours: daily.precipitation_hours?.[i] ?? 0,
            snowfall: daily.snowfall_sum[i] ?? 0,
            weatherCode: daily.weather_code[i] ?? 0,
            sunrise: daily.sunrise?.[i] ?? '',
            sunset: daily.sunset?.[i] ?? '',
            sunshineDuration: daily.sunshine_duration?.[i] ?? 0,
            windSpeedMax: daily.wind_speed_10m_max?.[i] ?? 0,
            windGustsMax: daily.wind_gusts_10m_max?.[i] ?? 0,
            windDirectionDominant: daily.wind_direction_10m_dominant?.[i] ?? 0,
          };
        });
      }

      setWeatherData(record);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load weather data');
      setWeatherData({});
    } finally {
      setLoading(false);
    }
  }, [location, viewMonth, viewYear]);

  useEffect(() => {
    fetchWeather();
  }, [fetchWeather]);

  // Reset data when location changes so stale month data isn't shown
  useEffect(() => {
    setWeatherData({});
  }, [location]);

  return (
    <CalendarTemplate
      location={location}
      loading={loading}
      error={error}
      weatherData={weatherData}
      viewYear={viewYear}
      viewMonth={viewMonth}
      onRetry={fetchWeather}
    />
  );
}
