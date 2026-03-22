import clsx from 'clsx';
import DayNumber from '@/app/components/atoms/day-number';
import {
  getWeatherIconType,
  getCloudCoverFromCode,
  formatPrecip,
  type WeatherDay,
} from '@/app/lib/weather';
import WeatherEmoji from '../atoms/weather-emoji';
import TemperatureBar from './temperature-bar';

interface DayCellProps {
  dayNumber: number;
  dateStr: string;
  dayData: WeatherDay | undefined;
  isToday: boolean;
  todayStr: string;
  hasLocation: boolean;
  monthTempMin: number;
  monthTempMax: number;
  isSelected: boolean;
  onClick: () => void;
}

export default function DayCell({ dayNumber, dateStr, dayData, isToday, todayStr, hasLocation, monthTempMin, monthTempMax, isSelected, onClick }: DayCellProps) {
  const isFuture = todayStr !== '' && dateStr >= todayStr;
  const iconType = dayData ? getWeatherIconType(dayData.weatherCode) : null;
  const cloudCover = dayData ? getCloudCoverFromCode(dayData.weatherCode) : null;
  const precipStr = dayData ? formatPrecip(dayData.precip, dayData.snowfall) : null;

  return (
    <div
      onClick={!isFuture ? onClick : undefined}
      className={clsx(
        'border rounded flex flex-col min-h-27.5 sm:min-h-32.5 p-1 sm:p-1.5 transition-colors',
        !isFuture && 'cursor-pointer',
        isSelected && 'border-accent ring-2 ring-inset ring-accent bg-accent/5',
        isToday
          ? 'border-base-300 bg-primary/10 ring-1 ring-inset ring-primary/30'
          : 'border-base-300 bg-base-200',
        !isFuture && !isToday && 'hover:bg-base-200/70',
        isFuture && !isToday && 'opacity-40',
      )}
    >
      <div className="flex justify-between">
        <DayNumber dayNumber={dayNumber} isToday={isToday} />
        <WeatherEmoji type={iconType!} />
      </div>

      {dayData && (
        <>
          <div className="text-center space-y-1 mt-1">
            <TemperatureBar max={dayData.tempMax} min={dayData.tempMin} rangeMin={monthTempMin} rangeMax={monthTempMax} />
            <div className="text-xs text-base-content/80 leading-none flex items-center justify-between gap-1 flex-wrap">
              {precipStr ? <span>{precipStr}</span> : <span></span>}
              {cloudCover !== null && cloudCover > 0 && (
                <span>☁️ {cloudCover}%</span>
              )}
            </div>
          </div>
        </>
      ) }
    </div>
  );
}
