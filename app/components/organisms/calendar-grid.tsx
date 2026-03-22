'use client';

import { useState } from 'react';
import DayCell from '@/app/components/molecules/day-cell';
import type { WeatherDay, Location } from '@/app/lib/weather';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function buildTodayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

interface CalendarGridProps {
  loading: boolean;
  error: string | null;
  location: Location | null;
  weatherData: Record<string, WeatherDay>;
  viewYear: number;
  viewMonth: number;
  onRetry: () => void;
  selectedDateStr: string | null;
  onDayClick: (dateStr: string) => void;
}

export default function CalendarGrid({
  loading,
  error,
  location,
  weatherData,
  viewYear,
  viewMonth,
  onRetry,
  selectedDateStr,
  onDayClick,
}: CalendarGridProps) {
  // Lazy initializer runs only on the client — never during SSR — so no hydration mismatch
  const [todayStr] = useState(buildTodayStr);

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
  const totalCells = Math.ceil((firstDayIndex + daysInMonth) / 7) * 7;

  const monthPrefix = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-`;
  const monthDays = Object.values(weatherData).filter((d) => d.date.startsWith(monthPrefix));
  const monthTempMin = monthDays.length ? Math.min(...monthDays.map((d) => d.tempMin)) : 0;
  const monthTempMax = monthDays.length ? Math.max(...monthDays.map((d) => d.tempMax)) : 100;

  return (
    <div className="flex gap-2 flex-col">
      {/* Day-of-week headers */}
      <div className="card bg-base-100 shadow grid grid-cols-7 border border-base-300">
        {DAY_NAMES.map((day) => (
          <div
            key={day}
            className="text-center text-xs sm:text-sm font-semibold text-base-content/50 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="card bg-base-100 shadow overflow-hidden">
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
              <button className="btn btn-sm btn-ghost" onClick={onRetry}>Retry</button>
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
          <div className="grid grid-cols-7 gap-2 p-2">
            {/* Leading empty cells */}
            {Array.from({ length: firstDayIndex }, (_, i) => (
              <div key={`empty-start-${i}`} className="min-h-27.5 sm:min-h-32.5" />
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
                  isToday={dateStr === todayStr}
                  todayStr={todayStr}
                  hasLocation={!!location}
                  monthTempMin={monthTempMin}
                  monthTempMax={monthTempMax}
                  isSelected={dateStr === selectedDateStr}
                  onClick={() => onDayClick(dateStr)}
                />
              );
            })}
            {/* Trailing empty cells */}
            {Array.from(
              { length: totalCells - firstDayIndex - daysInMonth },
              (_, i) => (
                <div key={`empty-end-${i}`} className="min-h-27.5 sm:min-h-32.5" />
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
