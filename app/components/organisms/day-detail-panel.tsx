import DayDetailContent from '@/app/components/molecules/day-detail-content';
import { formatDateShort, type WeatherDay } from '@/app/lib/weather';

interface DayDetailPanelProps {
  dateStr: string;
  day: WeatherDay | undefined;
  onClose: () => void;
}

export default function DayDetailPanel({ dateStr, day, onClose }: DayDetailPanelProps) {
  return (
    <div className="flex flex-col h-full bg-base-100">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-base-300 shrink-0">
        <span className="font-semibold text-sm text-base-content/70">{formatDateShort(dateStr)}</span>
        <button
          onClick={onClose}
          className="btn btn-ghost btn-xs btn-circle"
          aria-label="Close panel"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
            <path d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z" />
          </svg>
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <DayDetailContent dateStr={dateStr} day={day} />
      </div>
    </div>
  );
}
