import { Suspense } from 'react';
import CalendarApp from '@/app/components/CalendarApp';

export default function Home() {
  return (
    <Suspense>
      <CalendarApp />
    </Suspense>
  );
}
