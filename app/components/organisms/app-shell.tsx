'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import clsx from 'clsx';
import LocationSearch from '@/app/components/organisms/location-search';
import MonthNavigator from '@/app/components/organisms/month-navigator';
import DayDetailPanel from '@/app/components/organisms/day-detail-panel';
import { useLocation } from '@/app/components/context/location-context';
import { useMonthYear } from '@/app/components/context/month-year-context';
import { useDayDetail } from '@/app/components/context/day-detail-context';

const TABS = [
  { label: 'Calendar', href: '/calendar' },
  { label: 'Table', href: '/table' },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { location, setLocation } = useLocation();
  const { viewMonth, viewYear, todayMonth, todayYear, isAtMinMonth, isAtCurrentMonth, prevMonth, nextMonth, setViewMonth, setViewYear, goToToday } = useMonthYear();
  const { selectedDateStr, selectedDay, isPanelOpen, onClose } = useDayDetail();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const initDone = useRef(false);
  const [initialized, setInitialized] = useState(false);

  // Close panel on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isPanelOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPanelOpen, onClose]);

  // Initialize location from URL params on first mount
  useEffect(() => {
    if (initDone.current) return;
    initDone.current = true;

    const locId = searchParams.get('loc');
    if (!locId) {
      setInitialized(true);
      return;
    }

    fetch(`/api/geocode?id=${encodeURIComponent(locId)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.id) {
          setLocation({
            id: data.id,
            name: data.name,
            latitude: data.latitude,
            longitude: data.longitude,
            country: data.country_code ?? data.country ?? '',
            admin1: data.admin1 || undefined,
          });
        }
      })
      .catch(() => {})
      .finally(() => setInitialized(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync location to URL (preserve other params like ?month)
  useEffect(() => {
    if (!initialized) return;
    const params = new URLSearchParams(searchParams.toString());
    if (location) {
      params.set('loc', String(location.id));
    } else {
      params.delete('loc');
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, initialized]);

  // Build tab hrefs that preserve current search params
  const tabHref = (href: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const qs = params.toString();
    return qs ? `${href}?${qs}` : href;
  };

  return (
    <div>
      <div className="flex h-screen overflow-hidden bg-base-200">
        {/* Main scrollable content column */}
        <div className="flex-1 min-w-0 overflow-y-auto p-3 sm:p-6">
          <div className="max-w-5xl mx-auto space-y-4 pb-6">
            {/* Page header */}
            <div className="text-center pt-2">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                🌧️ Puddle Tracker
              </h1>
              <p className="text-base-content/50 text-sm mt-1">
                Weather history that&apos;s actually good
              </p>
            </div>
            {/* Location search */}
            <LocationSearch onSelect={setLocation} selectedLocation={location} />
            {/* Month/year navigation */}
            <MonthNavigator
              viewMonth={viewMonth}
              viewYear={viewYear}
              todayMonth={todayMonth}
              todayYear={todayYear}
              isAtMinMonth={isAtMinMonth}
              isAtCurrentMonth={isAtCurrentMonth}
              onPrevMonth={prevMonth}
              onNextMonth={nextMonth}
              onMonthChange={setViewMonth}
              onYearChange={setViewYear}
              onGoToToday={goToToday}
            />
            {/* Tab navigation */}
            <div role="tablist" className="tabs tabs-border">
              {TABS.map((tab) => (
                <Link
                  key={tab.href}
                  href={tabHref(tab.href)}
                  role="tab"
                  className={clsx('tab', pathname === tab.href && 'tab-active')}
                  onClick={onClose}
                >
                  {tab.label}
                </Link>
              ))}
            </div>
            {children}

            <div className="text-neutral/75 text-sm max-w-prose mt-9">
              This app was built in partnership with Claude. For reference,
              here&apos;s the <a href="" className="link link-primary transition-all">version</a> of the app Claude created on the original prompt without intervention.
            </div>
          </div>
        </div>

        {/* Desktop side panel — slides in from the right edge */}
        <div
          className={clsx(
            'hidden md:flex md:flex-col shrink-0 overflow-hidden',
            'transition-[width] duration-300 ease-in-out',
            'border-l border-base-300',
            isPanelOpen ? 'w-[35vw]' : 'w-0 border-l-0',
          )}
        >
          {/* Inner div holds fixed width so content never squishes during animation */}
          <div className="w-[35vw] h-full flex flex-col">
            {selectedDateStr && (
              <DayDetailPanel
                dateStr={selectedDateStr}
                day={selectedDay}
                onClose={onClose}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
