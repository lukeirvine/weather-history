'use client';

import clsx from 'clsx';
import DayDetailContent from '@/app/components/molecules/day-detail-content';
import type { WeatherDay } from '@/app/lib/weather';

interface DayDetailDrawerProps {
  isOpen: boolean;
  dateStr: string | null;
  day: WeatherDay | undefined;
  onClose: () => void;
}

export default function DayDetailDrawer({ isOpen, dateStr, day, onClose }: DayDetailDrawerProps) {
  return (
    <>
      {/* Backdrop */}
      <div
        className={clsx(
          'fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300',
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Bottom drawer */}
      <div
        className={clsx(
          'fixed bottom-0 left-0 right-0 z-50 md:hidden',
          'bg-base-100 rounded-t-2xl shadow-2xl',
          'transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-y-0' : 'translate-y-full',
        )}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-base-content/20" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-base-300">
          <span className="font-semibold text-sm text-base-content/70">{dateStr ?? ''}</span>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-xs btn-circle"
            aria-label="Close drawer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
              <path d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z" />
            </svg>
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto max-h-[60vh] pb-8">
          {dateStr && <DayDetailContent dateStr={dateStr} day={day} />}
        </div>
      </div>
    </>
  );
}
