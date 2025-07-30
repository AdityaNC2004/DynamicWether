
'use client';

import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';

export interface Forecast {
  current: {
    location: string;
    temperature: number;
    condition: string;
    conditionIcon: string;
    wind: number;
    humidity: number;
  };
  hourly: {
    time: string;
    temp: number;
    condition: string;
    conditionIcon: string;
    isDay: boolean;
  }[];
  daily: {
    day: string;
    condition: string;
    conditionIcon: string;
    high: number;
    low: number;
    sunrise: string;
    sunset: string;
  }[];
}

export interface Location {
  latitude: number;
  longitude: number;
}

const API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY;

export const useForecast = (location?: Location | null) => {
  const [forecast, setForecast] = useState<Forecast | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loc, setLoc] = useState<Location | null>(null);

  const setLocation = useCallback((location: Location | null) => {
    setLoc(location)
  }, []);

  const fetchForecast = useCallback(async (lat: number, lon: number) => {
    if (!API_KEY) {
      setError("Weather API key is not configured. Please add NEXT_PUBLIC_WEATHER_API_KEY to your .env file.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${lat},${lon}&days=5`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error.message || 'Failed to fetch weather data');
      }
      const data = await response.json();

      const transformedForecast: Forecast = {
        current: {
          location: `${data.location.name}, ${data.location.region}`,
          temperature: Math.round(data.current.temp_c),
          condition: data.current.condition.text,
          conditionIcon: `https:${data.current.condition.icon}`,
          wind: data.current.wind_kph,
          humidity: data.current.humidity,
        },
        hourly: data.forecast.forecastday[0].hour
          .filter((h: any) => new Date(h.time_epoch * 1000) > new Date())
          .slice(0, 8)
          .map((hour: any) => ({
            time: format(new Date(hour.time_epoch * 1000), 'ha'),
            temp: Math.round(hour.temp_c),
            condition: hour.condition.text,
            conditionIcon: `https:${hour.condition.icon}`,
            isDay: !!hour.is_day,
          })),
        daily: data.forecast.forecastday.map((day: any, index: number) => ({
          day: index === 0 ? 'Today' : format(new Date(day.date_epoch * 1000), 'E'),
          condition: day.day.condition.text,
          conditionIcon: `https:${day.day.condition.icon}`,
          high: Math.round(day.day.maxtemp_c),
          low: Math.round(day.day.mintemp_c),
          sunrise: day.astro.sunrise,
          sunset: day.astro.sunset,
        })),
      };
      setForecast(transformedForecast);
    } catch (err: any) {
      setError(err.message);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const targetLocation = location || loc;
    if (targetLocation) {
      fetchForecast(targetLocation.latitude, targetLocation.longitude);
    } else {
        // Keep loading until location is set
        setIsLoading(true);
    }
  }, [location, loc, fetchForecast]);

  return { data: forecast, isLoading, error, location: loc, setLocation };
};

export type UseForecastReturn = ReturnType<typeof useForecast>;
