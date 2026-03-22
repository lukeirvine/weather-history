'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

const MIN_YEAR = 1940;

interface MonthYearContextValue {
  viewMonth: number;
  viewYear: number;
  todayMonth: number;
  todayYear: number;
  isAtMinMonth: boolean;
  isAtCurrentMonth: boolean;
  prevMonth: () => void;
  nextMonth: () => void;
  setViewMonth: (month: number) => void;
  setViewYear: (year: number) => void;
  goToToday: () => void;
}

const MonthYearContext = createContext<MonthYearContextValue | null>(null);

export function MonthYearProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const initDone = useRef(false);

  // Read URL params synchronously — identical on server and client for the same request
  const [viewMonth, setViewMonth] = useState<number>(() => {
    const p = searchParams.get('month');
    if (p) { const m = parseInt(p.split('-')[1], 10) - 1; if (m >= 0 && m <= 11) return m; }
    return new Date().getUTCMonth(); // UTC is consistent between server render and client hydration
  });
  const [viewYear, setViewYear] = useState<number>(() => {
    const p = searchParams.get('month');
    if (p) { const y = parseInt(p.split('-')[0], 10); if (Number.isFinite(y)) return y; }
    return new Date().getUTCFullYear();
  });
  // todayMonth/todayYear start as -1 (never rendered server-side) and are set client-only in useEffect
  const [todayMonth, setTodayMonth] = useState(-1);
  const [todayYear, setTodayYear] = useState(-1);
  const [initialized, setInitialized] = useState(false);

  // Initialize month/year from URL params on first mount
  useEffect(() => {
    if (initDone.current) return;
    initDone.current = true;

    const now = new Date();
    setTodayMonth(now.getMonth());
    setTodayYear(now.getFullYear());

    const monthParam = searchParams.get('month');
    if (monthParam) {
      const [yearStr, monthStr] = monthParam.split('-');
      const y = parseInt(yearStr, 10);
      const m = parseInt(monthStr, 10) - 1; // convert to 0-based
      if (Number.isFinite(y) && Number.isFinite(m) && m >= 0 && m <= 11) {
        setViewYear(y);
        setViewMonth(m);
      }
    } else {
      // No URL param: correct view to local time (may differ slightly from UTC fallback)
      setViewMonth(now.getMonth());
      setViewYear(now.getFullYear());
    }

    setInitialized(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync month/year to URL (preserve other params like ?loc)
  useEffect(() => {
    if (!initialized) return;
    const mm = String(viewMonth + 1).padStart(2, '0');
    const params = new URLSearchParams(searchParams.toString());
    params.set('month', `${viewYear}-${mm}`);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMonth, viewYear, initialized]);

  const isAtCurrentMonth = todayYear !== -1 && viewYear === todayYear && viewMonth === todayMonth;
  const isAtMinMonth = viewYear === MIN_YEAR && viewMonth === 0;

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
    if (isAtCurrentMonth) return;
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  }

  function goToToday() {
    const now = new Date();
    setViewMonth(now.getMonth());
    setViewYear(now.getFullYear());
  }

  return (
    <MonthYearContext.Provider
      value={{
        viewMonth,
        viewYear,
        todayMonth,
        todayYear,
        isAtMinMonth,
        isAtCurrentMonth,
        prevMonth,
        nextMonth,
        setViewMonth,
        setViewYear,
        goToToday,
      }}
    >
      {children}
    </MonthYearContext.Provider>
  );
}

export function useMonthYear() {
  const ctx = useContext(MonthYearContext);
  if (!ctx) throw new Error('useMonthYear must be used within MonthYearProvider');
  return ctx;
}
