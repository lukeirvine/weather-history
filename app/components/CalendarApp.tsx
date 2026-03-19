'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import WeatherIcon from './WeatherIcon';
import LocationSearch from './LocationSearch';
import {
  getWeatherIconType,
  getCloudCoverFromCode,
  formatPrecip,
  type WeatherDay,
  type Location,
} from '@/app/lib/weather';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MIN_YEAR = 1940;

const TODAY = new Date();
const TODAY_STR = `${TODAY.getFullYear()}-${String(TODAY.getMonth() + 1).padStart(2, '0')}-${String(TODAY.getDate()).padStart(2, '0')}`;

// --- Day Cell ---

interface DayCellProps {
  dayNumber: number;
  dateStr: string;
  dayData: WeatherDay | undefined;
  isToday: boolean;
  hasLocation: boolean;
}

function DayCell({ dayNumber, dateStr, dayData, isToday, hasLocation }: DayCellProps) {
  const isFuture = dateStr > TODAY_STR;
  const iconType = dayData ? getWeatherIconType(dayData.weatherCode) : null;
  const cloudCover = dayData ? getCloudCoverFromCode(dayData.weatherCode) : null;
  const precipStr = dayData ? formatPrecip(dayData.precip, dayData.snowfall) : null;

  return (
    <div
      className={[
        'border-r border-b flex flex-col min-h-27.5 sm:min-h-32.5 p-1 sm:p-1.5',
        isToday ? 'bg-primary/10 ring-1 ring-inset ring-primary/30' : 'bg-base-100',
        isFuture ? 'opacity-40' : '',
      ].join(' ')}
    >
      {/* Day number */}
      <div className="flex justify-end">
        <span
          className={[
            'text-xs sm:text-sm font-semibold leading-none w-6 h-6 flex items-center justify-center rounded-full',
            isToday ? 'bg-primary text-primary-content' : 'text-base-content/70',
          ].join(' ')}
        >
          {dayNumber}
        </span>
      </div>

      {/* Weather content */}
      {dayData ? (
        <>
          <div className="flex-1 flex items-center justify-center py-0.5">
            <WeatherIcon type={iconType!} size={28} />
          </div>
          <div className="text-center space-y-0.5">
            <div className="text-xs font-semibold leading-none">
              <span className="text-red-500">H:{dayData.tempMax}°</span>
              &nbsp;
              <span className="text-blue-500">L:{dayData.tempMin}°</span>
            </div>
            <div className="text-xs text-base-content/55 leading-none flex items-center justify-center gap-1 flex-wrap">
              {precipStr && <span>{precipStr}</span>}
              {cloudCover !== null && cloudCover > 0 && (
                <span>☁{cloudCover}%</span>
              )}
            </div>
          </div>
        </>
      ) : hasLocation && !isFuture ? (
        <div className="flex-1 flex items-center justify-center">
          <span className="text-base-content/20 text-xs">—</span>
        </div>
      ) : null}
    </div>
  );
}

// --- Main Calendar App ---

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

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
  const totalCells = Math.ceil((firstDayIndex + daysInMonth) / 7) * 7;

  const yearOptions = Array.from(
    { length: TODAY.getFullYear() - MIN_YEAR + 1 },
    (_, i) => TODAY.getFullYear() - i
  );

  return (
    <div className="min-h-screen bg-base-200 p-3 sm:p-6">
      <div className="max-w-5xl mx-auto space-y-4">

        {/* Page header */}
        <div className="text-center pt-2">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            🌤 Weather History
          </h1>
          <p className="text-base-content/50 text-sm mt-1">
            Historical daily weather powered by Open-Meteo
          </p>
        </div>

        {/* Location search */}
        <LocationSearch onSelect={setLocation} selectedLocation={location} />

        {/* Month/year navigation */}
        <div className="card bg-base-100 shadow">
          <div className="card-body p-3 sm:p-4">
            <div className="flex items-center justify-between gap-2">
              <button
                className="btn btn-circle btn-ghost btn-sm sm:btn-md"
                onClick={prevMonth}
                disabled={isAtMinMonth}
                aria-label="Previous month"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <div className="flex items-center gap-2 flex-wrap justify-center">
                <select
                  className="select select-bordered select-sm"
                  value={viewMonth}
                  onChange={(e) => setViewMonth(Number(e.target.value))}
                >
                  {MONTH_NAMES.map((name, i) => (
                    <option
                      key={i}
                      value={i}
                      disabled={viewYear === TODAY.getFullYear() && i > TODAY.getMonth()}
                    >
                      {name}
                    </option>
                  ))}
                </select>

                <select
                  className="select select-bordered select-sm"
                  value={viewYear}
                  onChange={(e) => setViewYear(Number(e.target.value))}
                >
                  {yearOptions.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>

                {!isAtCurrentMonth && (
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => {
                      setViewMonth(TODAY.getMonth());
                      setViewYear(TODAY.getFullYear());
                    }}
                  >
                    Today
                  </button>
                )}
              </div>

              <button
                className="btn btn-circle btn-ghost btn-sm sm:btn-md"
                onClick={nextMonth}
                disabled={isAtCurrentMonth}
                aria-label="Next month"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Calendar card */}
        <div className="card bg-base-100 shadow overflow-hidden">
          {/* Day-of-week headers */}
          <div className="grid grid-cols-7 border-b border-base-300">
            {DAY_NAMES.map((day) => (
              <div
                key={day}
                className="text-center text-xs sm:text-sm font-semibold text-base-content/50 py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Loading state */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <span className="loading loading-spinner loading-lg text-primary" />
              <span className="text-base-content/50 text-sm">Loading weather data…</span>
            </div>
          )}

          {/* Error state */}
          {error && !loading && (
            <div className="p-4">
              <div className="alert alert-error">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
                <button className="btn btn-sm btn-ghost" onClick={fetchWeather}>Retry</button>
              </div>
            </div>
          )}

          {/* Empty / no location state */}
          {!location && !loading && (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-base-content/40">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12">
                <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 0 0 .723 0l.028-.015.071-.041a16.975 16.975 0 0 0 1.144-.742 19.58 19.58 0 0 0 2.683-2.282c1.944-2.003 3.5-4.697 3.5-8.327a8 8 0 0 0-16 0c0 3.63 1.556 6.326 3.5 8.327a19.583 19.583 0 0 0 2.682 2.282 16.975 16.975 0 0 0 1.144.742ZM12 13.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clipRule="evenodd" />
              </svg>
              <p className="text-lg font-medium">Search for a location above</p>
              <p className="text-sm">Select a city to view its weather history</p>
            </div>
          )}

          {/* Calendar grid */}
          {!loading && location && !error && (
            <div className="grid grid-cols-7 border-l border-t border-base-300">
              {/* Leading empty cells */}
              {Array.from({ length: firstDayIndex }, (_, i) => (
                <div key={`empty-start-${i}`} className="border-r border-b border-base-300 bg-base-200/40 min-h-27.5 sm:min-h-32.5" />
              ))}

              {/* Day cells */}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const dayNumber = i + 1;
                const mm = String(viewMonth + 1).padStart(2, '0');
                const dd = String(dayNumber).padStart(2, '0');
                const dateStr = `${viewYear}-${mm}-${dd}`;
                return (
                  <DayCell
                    key={dateStr}
                    dayNumber={dayNumber}
                    dateStr={dateStr}
                    dayData={weatherData[dateStr]}
                    isToday={dateStr === TODAY_STR}
                    hasLocation={!!location}
                  />
                );
              })}

              {/* Trailing empty cells */}
              {Array.from(
                { length: totalCells - firstDayIndex - daysInMonth },
                (_, i) => (
                  <div key={`empty-end-${i}`} className="border-r border-b border-base-300 bg-base-200/40 min-h-27.5 sm:min-h-32.5" />
                )
              )}
            </div>
          )}
        </div>

        {/* Legend */}
        {location && !loading && (
          <div className="flex flex-wrap gap-3 justify-center text-xs text-base-content/50 pb-4">
            {(['sun', 'partly-cloudy', 'cloudy', 'rain', 'snow'] as const).map((t) => (
              <span key={t} className="flex items-center gap-1">
                <WeatherIcon type={t} size={16} />
                <span className="capitalize">{t.replace('-', ' ')}</span>
              </span>
            ))}
            <span className="flex items-center gap-1">
              <span className="text-red-500 font-semibold">H</span> High&nbsp;/&nbsp;
              <span className="text-blue-500 font-semibold">L</span> Low (°F)
            </span>
            <span>☁ Cloud cover</span>
          </div>
        )}
      </div>
    </div>
  );
}
