'use client';

import type { FC } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import type { UseWeatherAndTimeReturn, WeatherCondition, TimeOfDay } from '@/hooks/use-weather-and-time';

const weatherConditions: WeatherCondition[] = ['Clear', 'Partly Cloudy', 'Cloudy', 'Rainy', 'Stormy', 'Snowy', 'Foggy'];
const timesOfDay: TimeOfDay[] = ['Morning', 'Noon', 'Evening', 'Night'];

const WeatherController: FC<UseWeatherAndTimeReturn> = ({
  weather,
  setWeather,
  timeOfDay,
  setTimeOfDay,
  isDay,
}) => {
  const availableWeatherConditions = weatherConditions.map(condition => {
    if (condition === 'Clear') {
      return isDay ? 'Sunny' : 'Clear';
    }
    return condition;
  });

  const handleWeatherChange = (value: string) => {
    const condition = value === 'Sunny' ? 'Clear' : (value as WeatherCondition);
    setWeather(condition);
  }

  const displayWeather = weather === 'Clear' && isDay ? 'Sunny' : weather;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
      <div className="grid gap-2 text-left">
        <Label htmlFor="time-of-day-select">Time of Day</Label>
        <Select
          value={timeOfDay}
          onValueChange={(value: TimeOfDay) => setTimeOfDay(value)}
        >
          <SelectTrigger id="time-of-day-select" className="w-full">
            <SelectValue placeholder="Select Time" />
          </SelectTrigger>
          <SelectContent>
            {timesOfDay.map((time) => (
              <SelectItem key={time} value={time}>
                {time}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2 text-left">
        <Label htmlFor="weather-select">Weather</Label>
        <Select
          value={displayWeather}
          onValueChange={handleWeatherChange}
        >
          <SelectTrigger id="weather-select" className="w-full">
            <SelectValue placeholder="Select Weather" />
          </SelectTrigger>
          <SelectContent>
            {availableWeatherConditions.map((condition) => (
              <SelectItem key={condition} value={condition}>
                {condition}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default WeatherController;
