import WeatherIcon from '@/app/components/atoms/WeatherIcon';
import DayNumber from '@/app/components/atoms/DayNumber';
import {
  getWeatherIconType,
  getCloudCoverFromCode,
  formatPrecip,
  type WeatherDay,
} from '@/app/lib/weather';

const TODAY = new Date();
const TODAY_STR = `${TODAY.getFullYear()}-${String(TODAY.getMonth() + 1).padStart(2, '0')}-${String(TODAY.getDate()).padStart(2, '0')}`;

interface DayCellProps {
  dayNumber: number;
  dateStr: string;
  dayData: WeatherDay | undefined;
  isToday: boolean;
  hasLocation: boolean;
}

export default function DayCell({ dayNumber, dateStr, dayData, isToday, hasLocation }: DayCellProps) {
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
      <div className="flex justify-end">
        <DayNumber dayNumber={dayNumber} isToday={isToday} />
      </div>

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
