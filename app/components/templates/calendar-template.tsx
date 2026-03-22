'use client';

import CalendarGrid from '@/app/components/organisms/calendar-grid';
import DayDetailDrawer from '@/app/components/organisms/day-detail-drawer';
import { useDayDetail } from '@/app/components/context/day-detail-context';
import type { WeatherDay, Location } from '@/app/lib/weather';

interface CalendarTemplateProps {
  location: Location | null;
  loading: boolean;
  error: string | null;
  weatherData: Record<string, WeatherDay>;
  viewMonth: number;
  viewYear: number;
  onRetry: () => void;
}

export default function CalendarTemplate({
  location,
  loading,
  error,
  weatherData,
  viewMonth,
  viewYear,
  onRetry,
}: CalendarTemplateProps) {
  const { selectedDateStr, selectedDay, isPanelOpen, onDayClick, onClose } = useDayDetail();

  const handleDayClick = (dateStr: string) => {
    onDayClick(dateStr, weatherData[dateStr]);
  };

  return (
    <>
      <CalendarGrid
        loading={loading}
        error={error}
        location={location}
        weatherData={weatherData}
        viewYear={viewYear}
        viewMonth={viewMonth}
        onRetry={onRetry}
        selectedDateStr={selectedDateStr}
        onDayClick={handleDayClick}
      />

      {/* Mobile bottom drawer — desktop panel lives in AppShell */}
      <DayDetailDrawer
        isOpen={isPanelOpen}
        dateStr={selectedDateStr}
        day={selectedDay}
        onClose={onClose}
      />
    </>
  );
}
