
'use client';

import type { FC } from 'react';
import Image from 'next/image';
import { Sun, Cloud, CloudRain, CloudSnow, Wind, Droplets, Sunrise, Sunset, Zap, Cloudy, Moon, BrainCircuit } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { Forecast } from '@/hooks/use-forecast';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Skeleton } from './ui/skeleton';

interface ForecastDisplayProps extends Forecast {
  summary: string;
  isSummaryLoading: boolean;
}

const ForecastDisplay: FC<ForecastDisplayProps> = ({ current, hourly, daily, summary, isSummaryLoading }) => {
  return (
    <div className="w-full max-w-4xl bg-background/30 dark:bg-background/50 backdrop-blur-md p-4 sm:p-6 rounded-2xl shadow-2xl border border-white/10 text-foreground animate-in fade-in-50 duration-500">

      {/* AI Summary */}
      <Card className="bg-transparent border-none shadow-none mb-4">
        <CardHeader className="flex flex-row items-center gap-4 pb-2">
          <BrainCircuit className="w-8 h-8 text-primary" />
          <CardTitle>AI Summary</CardTitle>
        </CardHeader>
        <CardContent>
          {isSummaryLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : (
            <p className="text-foreground/90">{summary}</p>
          )}
        </CardContent>
      </Card>

      <Separator className="my-4 sm:my-6 bg-white/20" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {/* Current Weather */}
        <div className="md:col-span-1 flex flex-col items-center justify-center text-center">
          <h2 className="text-2xl font-bold">{current.location}</h2>
          <p className="text-lg">{current.condition}</p>
          <div className="flex items-center my-4">
            <Image src={current.conditionIcon} alt={current.condition} width={80} height={80} />
            <p className="text-7xl font-bold ml-4">{current.temperature}°</p>
          </div>
          <div className="flex gap-x-6 text-sm">
            <span className="flex items-center gap-1"><Wind size={16} /> {current.wind}km/h</span>
            <span className="flex items-center gap-1"><Droplets size={16} /> {current.humidity}%</span>
          </div>
        </div>

        {/* Hourly Forecast */}
        <div className="md:col-span-2">
          <Card className="bg-transparent border-none shadow-none">
            <CardHeader>
              <CardTitle>Hourly Forecast</CardTitle>
            </CardHeader>
            <CardContent>
               <Carousel opts={{ align: "start" }} className="w-full">
                <CarouselContent>
                  {hourly.map((hour, index) => {
                    return (
                      <CarouselItem key={index} className="basis-1/4 sm:basis-1/5 md:basis-1/6">
                        <div className="flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-white/10 transition-colors">
                          <p className="text-sm font-medium">{hour.time}</p>
                           <Image src={hour.conditionIcon} alt={hour.condition} width={32} height={32} />
                          <p className="font-bold text-lg">{hour.temp}°</p>
                        </div>
                      </CarouselItem>
                    );
                  })}
                </CarouselContent>
                <CarouselPrevious className="hidden sm:flex" />
                <CarouselNext className="hidden sm:flex" />
              </Carousel>
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator className="my-4 sm:my-6 bg-white/20" />

      {/* Daily Forecast */}
      <div>
        <Card className="bg-transparent border-none shadow-none">
          <CardHeader>
            <CardTitle>5-Day Forecast</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {daily.map((day, index) => {
                return (
                  <div key={index} className="grid grid-cols-4 sm:grid-cols-5 items-center gap-2 text-sm p-2 rounded-lg hover:bg-white/10 transition-colors">
                    <p className="font-medium col-span-1">{day.day}</p>
                    <div className="flex items-center justify-center gap-2 col-span-1">
                      <Image src={day.conditionIcon} alt={day.condition} width={24} height={24} />
                      <span className="hidden sm:inline">{day.condition}</span>
                    </div>
                    <div className="flex items-center justify-center gap-1 col-span-1">
                      <Sunrise size={16} className="text-yellow-400" />
                      <span>{day.sunrise}</span>
                    </div>
                    <div className="flex items-center justify-center gap-1 col-span-1">
                      <Sunset size={16} className="text-orange-500" />
                      <span>{day.sunset}</span>
                    </div>
                    <p className="text-right font-medium col-span-1 sm:col-span-1">{day.high}° / {day.low}°</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForecastDisplay;
