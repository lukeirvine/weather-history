'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import WeatherHistoryTemplate from '@/app/components/templates/WeatherHistoryTemplate';
import { type WeatherDay, type Location } from '@/app/lib/weather';

const MIN_YEAR = 1940;
const TODAY = new Date();

export default function CalendarApp() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initDone = useRef(false);

  const [location, setLocation] = useState<Location | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [viewMonth, setViewMonth] = useState(TODAY.getMonth());
  const [viewYear, setViewYear] = useState(TODAY.getFullYear());
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
            snowfall: daily.snowfall_sum[i] ?? 0,
            weatherCode: daily.weather_code[i] ?? 0,
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

  // Initialize location from URL params on first mount
  useEffect(() => {
    if (initDone.current) return;
    initDone.current = true;

    const locId = searchParams.get('loc');
    if (!locId) {
      setInitialized(true);
      return;
    }

    fetch(`/api/geocode?id=${encodeURIComponent(locId)}`)
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data && data.id) {
          setLocation({
            id: data.id,
            name: data.name,
            latitude: data.latitude,
            longitude: data.longitude,
            country: data.country_code ?? data.country ?? '',
            admin1: data.admin1 || undefined,
          });
        }
      })
      .catch(() => {})
      .finally(() => setInitialized(true));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync selected location to URL as a single ?loc=<id> param
  useEffect(() => {
    if (!initialized || !location) return;
    router.replace(`?loc=${location.id}`, { scroll: false });
  }, [location, initialized, router]);

  function prevMonth() {
    if (viewMonth === 0) {
      if (viewYear > MIN_YEAR) {
        setViewMonth(11);
        setViewYear((y) => y - 1);
      }
    } else {
      setViewMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    const isAtCurrentMonth = viewYear === TODAY.getFullYear() && viewMonth === TODAY.getMonth();
    if (isAtCurrentMonth) return;
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  }

  const isAtCurrentMonth = viewYear === TODAY.getFullYear() && viewMonth === TODAY.getMonth();
  const isAtMinMonth = viewYear === MIN_YEAR && viewMonth === 0;

  return (
    <WeatherHistoryTemplate
      location={location}
      loading={loading}
      error={error}
      weatherData={weatherData}
      viewMonth={viewMonth}
      viewYear={viewYear}
      isAtMinMonth={isAtMinMonth}
      isAtCurrentMonth={isAtCurrentMonth}
      onSelectLocation={setLocation}
      onPrevMonth={prevMonth}
      onNextMonth={nextMonth}
      onMonthChange={setViewMonth}
      onYearChange={setViewYear}
      onGoToToday={() => {
        setViewMonth(TODAY.getMonth());
        setViewYear(TODAY.getFullYear());
      }}
      onRetry={fetchWeather}
    />
  );
}
