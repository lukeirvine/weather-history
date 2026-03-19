import WeatherIcon from '@/app/components/atoms/WeatherIcon';

export default function WeatherLegend() {
  return (
    <div className="flex flex-wrap gap-3 justify-center text-xs text-base-content/50 pb-4">
      {(['sun', 'partly-cloudy', 'cloudy', 'rain', 'snow'] as const).map((t) => (
        <span key={t} className="flex items-center gap-1">
          <WeatherIcon type={t} size={16} />
          <span className="capitalize">{t.replace('-', ' ')}</span>
        </span>
      ))}
      <span className="flex items-center gap-1">
        <span className="text-red-500 font-semibold">H</span> High&nbsp;/&nbsp;
        <span className="text-blue-500 font-semibold">L</span> Low (°F)
      </span>
      <span>☁ Cloud cover</span>
    </div>
  );
}
