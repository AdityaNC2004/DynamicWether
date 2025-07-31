
'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Home, LocateFixed, AlertCircle } from 'lucide-react';
import WeatherScape from '@/components/weather-scape';
import ForecastDisplay from '@/components/forecast-display';
import { useWeatherAndTime } from '@/hooks/use-weather-and-time';
import { Button } from '@/components/ui/button';
import { useForecast } from '@/hooks/use-forecast';
import { summarizeForecast } from '@/ai/flows/forecast-summary-flow';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function ForecastPage() {
  const { data: forecast, isLoading: isForecastLoading, error, location, setLocation } = useForecast();
  const { moonPhase, ...weatherAndTime } = useWeatherAndTime(forecast?.current.condition);
  const [summary, setSummary] = useState('');
  const [isSummaryLoading, setIsSummaryLoading] = useState(true);

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

  useEffect(() => {
    if (isForecastLoading) {
      setIsSummaryLoading(true);
      return;
    }
    if (forecast) {
      summarizeForecast(forecast)
        .then((result) => setSummary(result.summary))
        .catch(console.error)
        .finally(() => setIsSummaryLoading(false));
    } else {
        setIsSummaryLoading(false);
    }
  }, [forecast, isForecastLoading]);

  const renderContent = () => {
    if (error) {
      return (
        <Alert variant="destructive" className="w-full max-w-lg bg-background/50 backdrop-blur-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )
    }

    if (isForecastLoading || (!location && !forecast)) {
      return (
        <div className="w-full max-w-4xl space-y-4">
          <div className="flex flex-col items-center justify-center text-center p-8 bg-background/30 dark:bg-background/50 backdrop-blur-md rounded-2xl shadow-2xl border border-white/10 text-foreground">
            <LocateFixed className="w-12 h-12 mb-4 animate-pulse" />
            <h2 className="text-2xl font-bold">Getting your location...</h2>
            <p className="text-lg text-foreground/80">Please allow location access to get the weather forecast.</p>
          </div>
        </div>
      );
    }

    if (forecast) {
      return (
        <ForecastDisplay
          {...forecast}
          summary={summary}
          isSummaryLoading={isSummaryLoading}
        />
      )
    }

    return null;
  }

  return (
    <>
      <WeatherScape {...weatherAndTime} moonPhase={moonPhase} />
      <main className="relative z-10 flex min-h-screen flex-col items-center justify-center p-4">
        {renderContent()}
      </main>
       <div className="fixed bottom-4 right-4 z-20 flex gap-2">
        <Button
          asChild
          variant="ghost"
          size="icon"
          className="text-foreground bg-background/30 hover:bg-background/50"
          aria-label="Return to Home"
        >
          <Link href="/">
            <Home />
          </Link>
        </Button>
      </div>
    </>
  );
}
