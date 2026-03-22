'use client';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const MIN_YEAR = 1940;

interface MonthNavigatorProps {
  viewMonth: number;
  viewYear: number;
  todayMonth: number;
  todayYear: number;
  isAtMinMonth: boolean;
  isAtCurrentMonth: boolean;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
  onGoToToday: () => void;
}

export default function MonthNavigator({
  viewMonth,
  viewYear,
  todayMonth,
  todayYear,
  isAtMinMonth,
  isAtCurrentMonth,
  onPrevMonth,
  onNextMonth,
  onMonthChange,
  onYearChange,
  onGoToToday,
}: MonthNavigatorProps) {
  // When todayYear is not yet known (-1), fall back to viewYear so the list is always non-empty
  const maxYear = todayYear !== -1 ? todayYear : viewYear;
  const yearOptions = Array.from(
    { length: maxYear - MIN_YEAR + 1 },
    (_, i) => maxYear - i
  );

  return (
    <div className="card bg-base-100 shadow">
      <div className="card-body p-3 sm:p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap grow">
            <select
              className="select select-bordered select-sm sm:max-w-40"
              value={viewMonth}
              onChange={(e) => onMonthChange(Number(e.target.value))}
            >
              {MONTH_NAMES.map((name, i) => (
                <option
                  key={i}
                  value={i}
                  disabled={todayYear !== -1 && viewYear === todayYear && i > todayMonth}
                >
                  {name}
                </option>
              ))}
            </select>

            <select
              className="select select-bordered select-sm sm:max-w-40"
              value={viewYear}
              onChange={(e) => onYearChange(Number(e.target.value))}
            >
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>

            {!isAtCurrentMonth && (
              <button className="btn btn-ghost btn-sm" onClick={onGoToToday}>
                Today
              </button>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              className="btn btn-circle btn-ghost btn-sm sm:btn-md"
              onClick={onPrevMonth}
              disabled={isAtMinMonth}
              aria-label="Previous month"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              className="btn btn-circle btn-ghost btn-sm sm:btn-md"
              onClick={onNextMonth}
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
    </div>
  );
}
