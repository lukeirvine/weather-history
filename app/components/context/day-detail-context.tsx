'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import type { WeatherDay } from '@/app/lib/weather';

interface DayDetailContextValue {
  selectedDateStr: string | null;
  selectedDay: WeatherDay | undefined;
  isPanelOpen: boolean;
  onDayClick: (dateStr: string, day: WeatherDay | undefined) => void;
  onClose: () => void;
}

const DayDetailContext = createContext<DayDetailContextValue | null>(null);

export function DayDetailProvider({ children }: { children: ReactNode }) {
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<WeatherDay | undefined>(undefined);

  const onDayClick = (dateStr: string, day: WeatherDay | undefined) => {
    if (selectedDateStr === dateStr) {
      setSelectedDateStr(null);
      setSelectedDay(undefined);
    } else {
      setSelectedDateStr(dateStr);
      setSelectedDay(day);
    }
  };

  const onClose = () => {
    setSelectedDateStr(null);
    setSelectedDay(undefined);
  };

  return (
    <DayDetailContext.Provider
      value={{ selectedDateStr, selectedDay, isPanelOpen: selectedDateStr !== null, onDayClick, onClose }}
    >
      {children}
    </DayDetailContext.Provider>
  );
}

export function useDayDetail() {
  const ctx = useContext(DayDetailContext);
  if (!ctx) throw new Error('useDayDetail must be used within a DayDetailProvider');
  return ctx;
}
