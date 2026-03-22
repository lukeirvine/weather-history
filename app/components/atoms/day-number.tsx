import clsx from 'clsx';

interface DayNumberProps {
  dayNumber: number;
  isToday: boolean;
}

export default function DayNumber({ dayNumber, isToday }: DayNumberProps) {
  return (
    <span
      className={clsx(
        'text-xs font-semibold leading-none w-6 h-6 flex items-center justify-center rounded-full',
        isToday ? 'bg-primary text-primary-content' : 'text-base-content/70',
      )}
    >
      {dayNumber}
    </span>
  );
}
