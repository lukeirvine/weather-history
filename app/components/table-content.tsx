'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import WeatherTable from '@/app/components/organisms/weather-table';
import { type WeatherDay } from '@/app/lib/weather';
import { useLocation } from '@/app/components/context/location-context';
import { useMonthYear } from '@/app/components/context/month-year-context';

const TODAY = new Date();

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const TODAY_STR = toDateStr(TODAY);

export default function TableContent() {
  const { location } = useLocation();
  const { viewMonth, viewYear, isAtCurrentMonth } = useMonthYear();
  const [weatherData, setWeatherData] = useState<Record<string, WeatherDay>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Compute the list of days to display and the fetch range
  const { displayDates, fetchStart, fetchEnd } = useMemo(() => {
    const yesterday = new Date(TODAY);
    yesterday.setDate(yesterday.getDate() - 1);

    if (isAtCurrentMonth) {
      // Show last 30 days: today back 29 days (may overlap into previous month)
      const start = new Date(TODAY);
      start.setDate(start.getDate() - 29);

      const dates: string[] = [];
      const cursor = new Date(start);
      while (cursor <= TODAY) {
        dates.push(toDateStr(new Date(cursor)));
        cursor.setDate(cursor.getDate() + 1);
      }

      return {
        displayDates: [...dates].reverse(), // most recent first
        fetchStart: toDateStr(start),
        fetchEnd: toDateStr(yesterday), // archive API doesn't have today yet
      };
    } else {
      // Show all days in the selected month
      const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
      const mm = String(viewMonth + 1).padStart(2, '0');
      const dates: string[] = [];
      for (let d = 1; d <= daysInMonth; d++) {
        dates.push(`${viewYear}-${mm}-${String(d).padStart(2, '0')}`);
      }

      const lastDay = new Date(viewYear, viewMonth, daysInMonth);
      const effectiveEnd = lastDay < yesterday ? lastDay : yesterday;

      return {
        displayDates: [...dates].reverse(), // most recent first
        fetchStart: `${viewYear}-${mm}-01`,
        fetchEnd: toDateStr(effectiveEnd),
      };
    }
  }, [isAtCurrentMonth, viewMonth, viewYear]);

  const fetchWeather = useCallback(async () => {
    if (!location) return;

    // Nothing to fetch if the range is entirely in the future
    if (fetchStart > fetchEnd) {
      setWeatherData({});
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/weather?lat=${location.latitude}&lon=${location.longitude}&startDate=${fetchStart}&endDate=${fetchEnd}`
      );

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const record: Record<string, WeatherDay> = {};
      const { daily } = data;

      if (daily?.time) {
        (daily.time as string[]).forEach((date: string, i: number) => {
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
  }, [location, fetchStart, fetchEnd]);

  useEffect(() => {
    fetchWeather();
  }, [fetchWeather]);

  // Clear stale data when location changes
  useEffect(() => {
    setWeatherData({});
  }, [location]);

  return (
    <WeatherTable
      displayDates={displayDates}
      weatherData={weatherData}
      todayStr={TODAY_STR}
      loading={loading}
      error={error}
      hasLocation={!!location}
      onRetry={fetchWeather}
    />
  );
}
