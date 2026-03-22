import React from 'react';

type TemperatureBarProps = {
  max: number;
  min: number;
  rangeMin: number;
  rangeMax: number;
};

function tempToPercent(temp: number, rangeMin: number, rangeMax: number): number {
  const span = rangeMax - rangeMin || 1;
  return Math.min(100, Math.max(0, ((temp - rangeMin) / span) * 100));
}

const TemperatureBar: React.FC<Readonly<TemperatureBarProps>> = ({ max, min, rangeMin, rangeMax }) => {
  const minPct = tempToPercent(min, rangeMin, rangeMax);
  const maxPct = tempToPercent(max, rangeMin, rangeMax);
  const barLeft = minPct;
  const barWidth = maxPct - minPct;

  return (
    <div className="w-full px-0.5 py-1">
      {/* Degree labels */}
      <div className="flex justify-between h-4 mb-0.5">
        {/* Low label */}
        <span
          className="text-[10px] font-semibold leading-none text-accent"
        >
          {Math.round(min)}°
        </span>
        {/* High label */}
        <span
          className="text-[10px] font-semibold leading-none text-secondary"
        >
          {Math.round(max)}°
        </span>
      </div>

      {/* Bar track */}
      <div className="relative w-full h-1.5 rounded-full bg-base-300 overflow-hidden">
        {/* Colored segment from min → max */}
        <div
          className="absolute top-0 h-full rounded-full"
          style={{
            left: `${barLeft}%`,
            width: `${barWidth}%`,
            background:
              'linear-gradient(to right, var(--color-accent), var(--color-secondary))',
          }}
        />
      </div>
    </div>
  );
};

export default TemperatureBar;
