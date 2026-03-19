import LocationSearch from '@/app/components/organisms/LocationSearch';
import MonthNavigator from '@/app/components/organisms/MonthNavigator';
import CalendarGrid from '@/app/components/organisms/CalendarGrid';
import WeatherLegend from '@/app/components/molecules/WeatherLegend';
import type { WeatherDay, Location } from '@/app/lib/weather';

interface WeatherHistoryTemplateProps {
  location: Location | null;
  loading: boolean;
  error: string | null;
  weatherData: Record<string, WeatherDay>;
  viewMonth: number;
  viewYear: number;
  isAtMinMonth: boolean;
  isAtCurrentMonth: boolean;
  onSelectLocation: (location: Location) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
  onGoToToday: () => void;
  onRetry: () => void;
}

export default function WeatherHistoryTemplate({
  location,
  loading,
  error,
  weatherData,
  viewMonth,
  viewYear,
  isAtMinMonth,
  isAtCurrentMonth,
  onSelectLocation,
  onPrevMonth,
  onNextMonth,
  onMonthChange,
  onYearChange,
  onGoToToday,
  onRetry,
}: WeatherHistoryTemplateProps) {
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
        <LocationSearch onSelect={onSelectLocation} selectedLocation={location} />

        {/* Month/year navigation */}
        <MonthNavigator
          viewMonth={viewMonth}
          viewYear={viewYear}
          isAtMinMonth={isAtMinMonth}
          isAtCurrentMonth={isAtCurrentMonth}
          onPrevMonth={onPrevMonth}
          onNextMonth={onNextMonth}
          onMonthChange={onMonthChange}
          onYearChange={onYearChange}
          onGoToToday={onGoToToday}
        />

        {/* Calendar grid */}
        <CalendarGrid
          loading={loading}
          error={error}
          location={location}
          weatherData={weatherData}
          viewYear={viewYear}
          viewMonth={viewMonth}
          onRetry={onRetry}
        />

        {/* Legend */}
        {location && !loading && <WeatherLegend />}
      </div>
    </div>
  );
}
