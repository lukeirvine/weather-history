import { WeatherIconType } from '@/app/lib/weather';
import React, { ReactNode } from 'react';

const emojis: Record<WeatherIconType, string> = {
  'sun': '☀️',
  'partly-cloudy': '🌤️',
  'mostly-cloudy': '⛅️',
  'cloudy': '☁️',
  'rain': '🌧️',
  'snow': '❄️',
};

type WeatherEmojiProps = {
  type: WeatherIconType;
};

const WeatherEmoji: React.FC<Readonly<WeatherEmojiProps>> = ({ type }) => {
  return <div className="text-xl">{emojis[type]}</div>;
};

export default WeatherEmoji;
