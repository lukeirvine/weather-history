'use client';

import clsx from 'clsx';
import {
  getWeatherIconType,
  getCloudCoverFromCode,
  getConditionLabel,
  getWindDirection,
  getUvLabel,
  formatSunTime,
  formatSunshineDuration,
  type WeatherDay,
  type WeatherIconType,
} from '@/app/lib/weather';

const EMOJI: Record<WeatherIconType, string> = {
  sun: '☀️',
  'partly-cloudy': '🌤️',
  'mostly-cloudy': '⛅️',
  cloudy: '☁️',
  rain: '🌧️',
  snow: '❄️',
};

function parseDateDisplay(dateStr: string) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return {
    weekday: d.toLocaleDateString('en-US', { weekday: 'short' }),
    monthDay: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  };
}

interface WeatherTableProps {
  displayDates: string[];
  weatherData: Record<string, WeatherDay>;
  todayStr: string;
  loading: boolean;
  error: string | null;
  hasLocation: boolean;
  onRetry?: () => void;
}

export default function WeatherTable({
  displayDates,
  weatherData,
  todayStr,
  loading,
  error,
  hasLocation,
  onRetry,
}: WeatherTableProps) {
  if (!hasLocation) {
    return (
      <div className="flex items-center justify-center h-32 text-base-content/40 text-sm">
        Search for a location to view weather history
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32 text-base-content/40 text-sm gap-2">
        <span className="loading loading-spinner loading-sm" />
        Loading weather data…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-32 gap-2">
        <p className="text-error text-sm">{error}</p>
        {onRetry && (
          <button className="btn btn-sm btn-ghost" onClick={onRetry}>
            Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="overflow-auto rounded-lg border border-base-300 max-h-[calc(100vh-20rem)]">
      <table className="table table-sm w-full">
        <thead className="sticky top-0 z-20">
          <tr className="bg-base-300 text-base-content/60 text-xs uppercase tracking-wide">
            <th className="whitespace-nowrap sticky left-0 bg-base-300 z-10">Date</th>
            <th className="whitespace-nowrap">Condition</th>
            <th className="whitespace-nowrap text-secondary">High</th>
            <th className="whitespace-nowrap text-primary">Low</th>
            <th className="whitespace-nowrap">Precip</th>
            <th className="whitespace-nowrap">Snow</th>
            <th className="whitespace-nowrap">Cloud</th>
            <th className="whitespace-nowrap">Sunshine</th>
            <th className="whitespace-nowrap">Sunrise</th>
            <th className="whitespace-nowrap">Sunset</th>
            <th className="whitespace-nowrap">Wind</th>
            <th className="whitespace-nowrap">Gusts</th>
            <th className="whitespace-nowrap">UV</th>
          </tr>
        </thead>
        <tbody>
          {displayDates.map((dateStr) => {
            const day = weatherData[dateStr];
            const isToday = dateStr === todayStr;
            const { weekday, monthDay } = parseDateDisplay(dateStr);

            const iconType = day ? getWeatherIconType(day.weatherCode) : null;
            const cloudCover = day ? getCloudCoverFromCode(day.weatherCode) : null;
            const conditionLabel = day ? getConditionLabel(day.weatherCode) : null;
            const windDir = day ? getWindDirection(day.windDirectionDominant) : null;
            const uvLabel = day ? getUvLabel(day.uvIndexMax) : null;

            return (
              <tr
                key={dateStr}
                className={clsx(
                  'transition-colors border-b border-base-300/50 last:border-b-0',
                  isToday && 'bg-primary/10',
                  !isToday && 'hover:bg-base-300/30',
                )}
              >
                {/* Date — sticky on horizontal scroll */}
                <td className={clsx(
                  'whitespace-nowrap sticky left-0 z-10',
                  isToday ? 'bg-primary/10' : 'bg-base-100',
                )}>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-semibold text-sm">{monthDay}</span>
                    {isToday && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Today</span>
                    )}
                  </div>
                  <div className="text-xs text-base-content/40">{weekday}</div>
                </td>

                {/* Condition */}
                <td className="whitespace-nowrap">
                  {day ? (
                    <span className="flex items-center gap-1.5">
                      <span>{EMOJI[iconType!]}</span>
                      <span className="text-xs text-base-content/70">{conditionLabel}</span>
                    </span>
                  ) : (
                    <span className="text-base-content/25">—</span>
                  )}
                </td>

                {/* High temp */}
                <td className="tabular-nums font-semibold text-secondary">
                  {day ? `${day.tempMax}°` : <span className="text-base-content/25">—</span>}
                </td>

                {/* Low temp */}
                <td className="tabular-nums font-semibold text-primary">
                  {day ? `${day.tempMin}°` : <span className="text-base-content/25">—</span>}
                </td>

                {/* Precip */}
                <td className="tabular-nums whitespace-nowrap">
                  {day ? (
                    day.precip > 0 ? (
                      <span>
                        {day.precip.toFixed(2)}&quot;
                        {day.precipHours > 0 && (
                          <span className="text-xs text-base-content/40 ml-1">{Math.round(day.precipHours)}h</span>
                        )}
                      </span>
                    ) : (
                      <span className="text-base-content/25">—</span>
                    )
                  ) : (
                    <span className="text-base-content/25">—</span>
                  )}
                </td>

                {/* Snowfall */}
                <td className="tabular-nums">
                  {day ? (
                    day.snowfall > 0 ? (
                      `${day.snowfall.toFixed(1)}"`
                    ) : (
                      <span className="text-base-content/25">—</span>
                    )
                  ) : (
                    <span className="text-base-content/25">—</span>
                  )}
                </td>

                {/* Cloud cover */}
                <td className="tabular-nums">
                  {day ? `${cloudCover}%` : <span className="text-base-content/25">—</span>}
                </td>

                {/* Sunshine */}
                <td className="whitespace-nowrap">
                  {day ? formatSunshineDuration(day.sunshineDuration) : <span className="text-base-content/25">—</span>}
                </td>

                {/* Sunrise */}
                <td className="tabular-nums whitespace-nowrap">
                  {day && day.sunrise ? formatSunTime(day.sunrise) : <span className="text-base-content/25">—</span>}
                </td>

                {/* Sunset */}
                <td className="tabular-nums whitespace-nowrap">
                  {day && day.sunset ? formatSunTime(day.sunset) : <span className="text-base-content/25">—</span>}
                </td>

                {/* Wind speed + direction */}
                <td className="whitespace-nowrap tabular-nums">
                  {day ? (
                    `${Math.round(day.windSpeedMax)} mph ${windDir}`
                  ) : (
                    <span className="text-base-content/25">—</span>
                  )}
                </td>

                {/* Gusts */}
                <td className="whitespace-nowrap tabular-nums">
                  {day ? (
                    `${Math.round(day.windGustsMax)} mph`
                  ) : (
                    <span className="text-base-content/25">—</span>
                  )}
                </td>

                {/* UV */}
                <td className="whitespace-nowrap">
                  {day ? (
                    <span>
                      {Math.round(day.uvIndexMax)}
                      <span className="text-xs text-base-content/40 ml-1">{uvLabel}</span>
                    </span>
                  ) : (
                    <span className="text-base-content/25">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
