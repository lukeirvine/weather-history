import type { WeatherIconType } from '@/app/lib/weather';

// Reusable cloud shape: circles overlapping to form a cloud
function Cloud({
  cx = 12,
  cy = 14,
  scale = 1,
  color = '#94A3B8',
}: {
  cx?: number;
  cy?: number;
  scale?: number;
  color?: string;
}) {
  const s = scale;
  return (
    <g>
      <circle cx={cx} cy={cy - 2 * s} r={3 * s} fill={color} />
      <circle cx={cx - 3.5 * s} cy={cy - 0.5 * s} r={2.2 * s} fill={color} />
      <circle cx={cx + 3.5 * s} cy={cy - 0.5 * s} r={2.2 * s} fill={color} />
      <rect
        x={cx - 5.7 * s}
        y={cy - 0.5 * s}
        width={11.4 * s}
        height={3.5 * s}
        fill={color}
        rx={1}
      />
    </g>
  );
}

function SunCore({ cx = 12, cy = 12, outerR = 9, innerR = 6.5, circleR = 4.5, color = '#FCD34D' }: {
  cx?: number;
  cy?: number;
  outerR?: number;
  innerR?: number;
  circleR?: number;
  color?: string;
}) {
  const angles = [0, 45, 90, 135, 180, 225, 270, 315];
  return (
    <g>
      {angles.map((deg) => {
        const rad = (deg * Math.PI) / 180;
        return (
          <line
            key={deg}
            x1={(cx + innerR * Math.cos(rad)).toFixed(2)}
            y1={(cy + innerR * Math.sin(rad)).toFixed(2)}
            x2={(cx + outerR * Math.cos(rad)).toFixed(2)}
            y2={(cy + outerR * Math.sin(rad)).toFixed(2)}
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        );
      })}
      <circle cx={cx} cy={cy} r={circleR} fill={color} />
    </g>
  );
}

export default function WeatherIcon({
  type,
  size = 32,
}: {
  type: WeatherIconType;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label={type}
    >
      {type === 'sun' && <SunCore />}

      {type === 'partly-cloudy' && (
        <>
          {/* Small sun peeking top-right */}
          <g>
            {[315, 0, 45, 90].map((deg) => {
              const rad = (deg * Math.PI) / 180;
              return (
                <line
                  key={deg}
                  x1={(16 + 4.5 * Math.cos(rad)).toFixed(2)}
                  y1={(7.5 + 4.5 * Math.sin(rad)).toFixed(2)}
                  x2={(16 + 6.5 * Math.cos(rad)).toFixed(2)}
                  y2={(7.5 + 6.5 * Math.sin(rad)).toFixed(2)}
                  stroke="#FCD34D"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              );
            })}
            <circle cx={16} cy={7.5} r={3} fill="#FCD34D" />
          </g>
          {/* Cloud overlapping in front */}
          <Cloud cx={10} cy={16} scale={0.85} color="#94A3B8" />
        </>
      )}

      {type === 'cloudy' && <Cloud cx={12} cy={14} scale={1} color="#94A3B8" />}

      {type === 'rain' && (
        <>
          <Cloud cx={12} cy={11} scale={0.85} color="#64748B" />
          {/* Rain drops */}
          <line x1="8"  y1="17" x2="7"  y2="21" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="12" y1="17" x2="11" y2="21" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="16" y1="17" x2="15" y2="21" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" />
        </>
      )}

      {type === 'snow' && (
        <>
          <Cloud cx={12} cy={11} scale={0.85} color="#64748B" />
          {/* Snowflakes (small + shapes) */}
          {[7, 12, 17].map((x) => (
            <g key={x}>
              <line x1={x} y1="17.5" x2={x} y2="20.5" stroke="#BAE6FD" strokeWidth="1.5" strokeLinecap="round" />
              <line x1={x - 1.5} y1="19" x2={x + 1.5} y2="19" stroke="#BAE6FD" strokeWidth="1.5" strokeLinecap="round" />
            </g>
          ))}
        </>
      )}
    </svg>
  );
}
