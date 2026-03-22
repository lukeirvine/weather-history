import { Suspense } from 'react';
import { LocationProvider } from '@/app/components/context/location-context';
import { MonthYearProvider } from '@/app/components/context/month-year-context';
import { DayDetailProvider } from '@/app/components/context/day-detail-context';
import AppShell from '@/app/components/organisms/app-shell';

export default function ViewsLayout({ children }: { children: React.ReactNode }) {
  return (
    <LocationProvider>
      <Suspense>
        <MonthYearProvider>
          <DayDetailProvider>
            <AppShell>{children}</AppShell>
          </DayDetailProvider>
        </MonthYearProvider>
      </Suspense>
    </LocationProvider>
  );
}
