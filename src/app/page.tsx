'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import WeatherScape from '@/components/weather-scape';
import WeatherController from '@/components/weather-controller';
import { useWeatherAndTime } from '@/hooks/use-weather-and-time';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Moon, CloudSun } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useForecast } from '@/hooks/use-forecast';

export default function Home() {
  const { location, setLocation } = useForecast();
  const { data: forecast, isLoading: isForecastLoading } = useForecast(location);
  const { reset, isOverridden, moonPhase, ...weatherAndTime } = useWeatherAndTime(forecast?.current.condition);

  const [isUiVisible, setIsUiVisible] = useState(true);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location: ", error);
        }
      );
    }
  }, [setLocation]);


  return (
    <>
      <WeatherScape {...weatherAndTime} moonPhase={moonPhase} />
      <main className="relative z-10 flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 text-center">
        <div
          className={cn(
            'bg-background/30 dark:bg-background/50 backdrop-blur-md p-6 sm:p-8 rounded-2xl shadow-2xl border border-white/10 w-full max-w-lg transition-all duration-500',
            isUiVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
          )}
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground font-headline">
            WeatherScape
          </h1>
          <p className="mt-4 text-md md:text-lg text-foreground/80">
            A dynamic theme that adapts to real-time local conditions.
          </p>
          <div className="mt-8 w-full max-w-md mx-auto space-y-4">
            <WeatherController {...weatherAndTime} setWeather={weatherAndTime.setWeather} setTimeOfDay={weatherAndTime.setTimeOfDay} />
            {isOverridden && (
              <Button onClick={reset} variant="ghost" size="sm">
                Return to Real-Time
              </Button>
            )}
          </div>
          {!weatherAndTime.isDay && moonPhase && (
            <div className="mt-4 flex items-center justify-center gap-2 text-foreground/80">
              <Moon className="w-4 h-4" />
              <span>{moonPhase.phaseName}</span>
            </div>
          )}
        </div>
      </main>
      <div className="fixed bottom-4 right-4 z-20 flex gap-2">
        <Button
          onClick={() => setIsUiVisible(!isUiVisible)}
          variant="ghost"
          size="icon"
          className="text-foreground bg-background/30 hover:bg-background/50"
          aria-label={isUiVisible ? 'Hide UI' : 'Show UI'}
        >
          {isUiVisible ? <EyeOff /> : <Eye />}
        </Button>
        <Button
          asChild
          variant="ghost"
          size="icon"
          className="text-foreground bg-background/30 hover:bg-background/50"
          aria-label="View Forecast"
        >
          <Link href="/forecast">
            <CloudSun />
          </Link>
        </Button>
      </div>
    </>
  );
}
