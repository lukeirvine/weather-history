'use client';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const MIN_YEAR = 1940;
const TODAY_YEAR = new Date().getFullYear();
const TODAY_MONTH = new Date().getMonth();

interface MonthNavigatorProps {
  viewMonth: number;
  viewYear: number;
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
  isAtMinMonth,
  isAtCurrentMonth,
  onPrevMonth,
  onNextMonth,
  onMonthChange,
  onYearChange,
  onGoToToday,
}: MonthNavigatorProps) {
  const yearOptions = Array.from(
    { length: TODAY_YEAR - MIN_YEAR + 1 },
    (_, i) => TODAY_YEAR - i
  );

  return (
    <div className="card bg-base-100 shadow">
      <div className="card-body p-3 sm:p-4">
        <div className="flex items-center justify-between gap-2">
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

          <div className="flex items-center gap-2 flex-wrap justify-center">
            <select
              className="select select-bordered select-sm"
              value={viewMonth}
              onChange={(e) => onMonthChange(Number(e.target.value))}
            >
              {MONTH_NAMES.map((name, i) => (
                <option
                  key={i}
                  value={i}
                  disabled={viewYear === TODAY_YEAR && i > TODAY_MONTH}
                >
                  {name}
                </option>
              ))}
            </select>

            <select
              className="select select-bordered select-sm"
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
  );
}
