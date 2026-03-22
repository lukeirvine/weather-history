import { Suspense } from 'react';
import CalendarContent from '@/app/components/templates/calendar-content';

export default function CalendarPage() {
  return (
    <Suspense>
      <CalendarContent />
    </Suspense>
  );
}
