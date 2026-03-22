import type { ReactNode } from 'react';
import {
  getWeatherIconType,
  getCloudCoverFromCode,
  getConditionLabel,
  getWindDirection,
  formatSunTime,
  formatSunshineDuration,
  type WeatherDay,
  type WeatherIconType,
} from '@/app/lib/weather';

const EMOJI: Record<WeatherIconType, string> = {
  'sun': '☀️',
  'partly-cloudy': '🌤️',
  'mostly-cloudy': '⛅️',
  'cloudy': '☁️',
  'rain': '🌧️',
  'snow': '❄️',
};

interface DayDetailContentProps {
  dateStr: string;
  day: WeatherDay | undefined;
}

function StatRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm w-5 text-center shrink-0 leading-none">{icon}</span>
      <span className="text-sm text-base-content/55 flex-1">{label}</span>
      <span className="text-sm font-medium tabular-nums">{value}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="px-5 py-4 space-y-3">
      <div className="text-[11px] font-semibold uppercase tracking-widest text-base-content/30 pb-0.5">
        {title}
      </div>
      {children}
    </div>
  );
}

function Divider() {
  return <div className="border-t border-base-300 mx-5" />;
}

function parseDateParts(dateStr: string) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return {
    weekday: d.toLocaleDateString('en-US', { weekday: 'long' }),
    monthDay: d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }),
    year: String(year),
  };
}

export default function DayDetailContent({ dateStr, day }: DayDetailContentProps) {
  if (!day) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-16 text-base-content/30">
        <span className="text-3xl">📅</span>
        <p className="text-sm">No data available</p>
      </div>
    );
  }

  const { weekday, monthDay, year } = parseDateParts(dateStr);
  const iconType = getWeatherIconType(day.weatherCode);
  const conditionLabel = getConditionLabel(day.weatherCode);
  const cloudCover = getCloudCoverFromCode(day.weatherCode);
  const windDir = getWindDirection(day.windDirectionDominant);

  return (
    <div>
      {/* Condition + date */}
      <div className="px-5 pt-5 pb-4">
        <div className="text-4xl mb-3 leading-none">{EMOJI[iconType]}</div>
        <div className="font-semibold text-base">{conditionLabel}</div>
        <div className="text-sm text-base-content/50 mt-1">
          {weekday}, {monthDay} {year}
        </div>
      </div>

      {/* Temperature — visually prominent */}
      <div className="px-5 pb-5">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-secondary">{day.tempMax}°</span>
          <span className="text-lg text-base-content/25">/</span>
          <span className="text-3xl font-bold text-primary">{day.tempMin}°</span>
        </div>
        <div className="text-xs text-base-content/35 mt-0.5">High / Low</div>
      </div>

      <Divider />

      <Section title="Conditions">
        <StatRow icon="☁️" label="Cloud cover" value={`${cloudCover}%`} />
        {day.precip > 0 && (
          <StatRow
            icon="💧"
            label="Precipitation"
            value={`${day.precip.toFixed(2)}"${day.precipHours > 0 ? ` · ${Math.round(day.precipHours)}h` : ''}`}
          />
        )}
        {day.snowfall > 0 && (
          <StatRow icon="❄️" label="Snowfall" value={`${day.snowfall.toFixed(1)}"`} />
        )}
      </Section>

      <Divider />

      <Section title="Sun">
        {day.sunrise && <StatRow icon="🌅" label="Sunrise" value={formatSunTime(day.sunrise)} />}
        {day.sunset && <StatRow icon="🌇" label="Sunset" value={formatSunTime(day.sunset)} />}
        <StatRow icon="☀️" label="Sunshine" value={formatSunshineDuration(day.sunshineDuration)} />
      </Section>

      <Divider />

      <Section title="Wind">
        <StatRow
          icon="💨"
          label="Max speed"
          value={`${Math.round(day.windSpeedMax)} mph · ${windDir}`}
        />
        <StatRow icon="🌬️" label="Max gusts" value={`${Math.round(day.windGustsMax)} mph`} />
      </Section>

    </div>
  );
}
