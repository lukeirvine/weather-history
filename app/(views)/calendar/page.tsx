import { Suspense } from 'react';
import CalendarContent from '@/app/components/calendar-content';

export default function CalendarPage() {
  return (
    <Suspense>
      <CalendarContent />
    </Suspense>
  );
}
