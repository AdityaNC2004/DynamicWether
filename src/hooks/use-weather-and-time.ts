
'use client';

import { useState, useEffect, useCallback } from 'react';

export type WeatherCondition = 'Clear' | 'Rainy' | 'Stormy' | 'Snowy' | 'Foggy' | 'Cloudy' | 'Partly Cloudy';
export type TimeOfDay = 'Morning' | 'Noon' | 'Evening' | 'Night';

const skyThemes = {
  Morning: { gradient: 'linear-gradient(to top, #FFDAB9, #87CEEB)', sunColor: '#FFD700', sunShadow: '0 0 40px #FFD700' },
  Noon: { gradient: 'linear-gradient(to bottom, #87CEEB, #A0C4FF)', sunColor: '#FFFFFF', sunShadow: '0 0 50px #FFFFFF' },
  Evening: { gradient: 'linear-gradient(to bottom, #4682B4, #FF6347)', sunColor: '#FFA500', sunShadow: '0 0 40px #FFA500' },
  Night: { gradient: 'linear-gradient(to bottom, #1E232F, #000033)', moonColor: '#FFECB3', moonShadow: '0 0 30px #FFECB3' },
};

const getTimeOfDay = (date: Date): TimeOfDay => {
  const hour = date.getHours();
  if (hour >= 6 && hour < 10) return 'Morning';
  if (hour >= 10 && hour < 16) return 'Noon';
  if (hour >= 16 && hour < 19) return 'Evening';
  return 'Night';
};

const getRotationForTime = (date: Date): number => {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const totalMinutes = hours * 60 + minutes;

  // Sunrise at 6 AM, Sunset at 7 PM
  const dayStart = 6 * 60;
  const dayEnd = 19 * 60;
  const nightStart = dayEnd;
  const nightEnd = dayStart + 24 * 60;

  let progress;
  if (totalMinutes >= dayStart && totalMinutes < dayEnd) {
    // Daytime: Sun path from -90deg (sunrise) to 90deg (sunset)
    progress = (totalMinutes - dayStart) / (dayEnd - dayStart);
    return progress * 180 - 90;
  } else {
    // Nighttime: Moon path from -90deg (moonrise) to 90deg (moonset)
    let totalNightMinutes = totalMinutes >= nightStart ? totalMinutes : totalMinutes + 24 * 60;
    progress = (totalNightMinutes - nightStart) / (nightEnd - nightStart);
    return progress * 180 - 90;
  }
};

// Simplified moon phase calculation
const getMoonPhase = (date: Date) => {
    const synodicMonth = 29.53058867;
    // Known new moon: 2000-01-06
    const knownNewMoon = new Date('2000-01-06T18:14:00Z').getTime();
    const daysSinceKnownNewMoon = (date.getTime() - knownNewMoon) / (1000 * 60 * 60 * 24);
    const phase = (daysSinceKnownNewMoon % synodicMonth) / synodicMonth;

    const phases = [
      { name: 'New Moon', start: 0, end: 0.03 },
      { name: 'Waxing Crescent', start: 0.03, end: 0.22 },
      { name: 'First Quarter', start: 0.22, end: 0.28 },
      { name: 'Waxing Gibbous', start: 0.28, end: 0.47 },
      { name: 'Full Moon', start: 0.47, end: 0.53 },
      { name: 'Waning Gibbous', start: 0.53, end: 0.72 },
      { name: 'Last Quarter', start: 0.72, end: 0.78 },
      { name: 'Waning Crescent', start: 0.78, end: 0.97 },
      { name: 'New Moon', start: 0.97, end: 1 },
    ];

    const currentPhaseInfo = phases.find(p => phase >= p.start && phase < p.end) || phases[0];

    const r = 50; // radius of the moon
    const x = 50; // center x
    const y = 50; // center y
    let path;

    if (phase < 0.5) { // Waxing
        const a = 2 * r * (0.5 - phase);
        path = `M${x},${y-r} A${a},${r} 0 1,0 ${x},${y+r} A${r},${r} 0 1,1 ${x},${y-r}Z`;
    } else { // Waning
        const a = 2 * r * (phase - 0.5);
        path = `M${x},${y-r} A${r},${r} 0 1,1 ${x},${y+r} A${a},${r} 0 1,0 ${x},${y-r}Z`;
    }

    return {
      phase: phase,
      phaseName: currentPhaseInfo.name,
      path: path,
    };
};

export const useWeatherAndTime = () => {
  const [weather, setWeatherState] = useState<WeatherCondition>('Clear');
  const [timeOfDay, setTimeOfDayState] = useState<TimeOfDay>('Noon');
  const [isOverridden, setIsOverridden] = useState(false);
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [moonPhase, setMoonPhase] = useState<{phase: number; phaseName: string; path: string} | null>(null);

  const setWeather = (newWeather: WeatherCondition) => {
    localStorage.setItem('weather-override', newWeather);
    localStorage.setItem('time-override', timeOfDay);
    setWeatherState(newWeather);
    setIsOverridden(true);
  };

  const setTimeOfDay = (newTime: TimeOfDay) => {
    localStorage.setItem('time-override', newTime);
    localStorage.setItem('weather-override', weather);
    setTimeOfDayState(newTime);
    setIsOverridden(true);
  };

  const reset = useCallback(() => {
    localStorage.removeItem('weather-override');
    localStorage.removeItem('time-override');
    setIsOverridden(false);
    const now = new Date();
    setCurrentDate(now);
    setTimeOfDayState(getTimeOfDay(now));
    setWeatherState('Clear'); // Default to clear after reset
  }, []);


  useEffect(() => {
    const weatherOverride = localStorage.getItem('weather-override') as WeatherCondition;
    const timeOverride = localStorage.getItem('time-override') as TimeOfDay;

    let now = new Date();

    if (weatherOverride && timeOverride) {
      setWeatherState(weatherOverride);
      setTimeOfDayState(timeOverride);
      setIsOverridden(true);
    }

    setCurrentDate(now);
    if (!timeOverride) {
        setTimeOfDayState(getTimeOfDay(now));
    }

    setMoonPhase(getMoonPhase(now));

    const interval = setInterval(() => {
      if (!isOverridden) {
        const newDate = new Date();
        setCurrentDate(newDate);
        setTimeOfDayState(getTimeOfDay(newDate));
        setMoonPhase(getMoonPhase(newDate));
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [isOverridden]);

  const isDay = timeOfDay !== 'Night';
  const theme = skyThemes[timeOfDay];

  const skyStyle = {
    background: theme.gradient,
  };

  const celestialStyle = {
    backgroundColor: isDay ? theme.sunColor : theme.moonColor,
    boxShadow: isDay ? theme.sunShadow : theme.moonShadow,
    rotateDeg: currentDate ? getRotationForTime(currentDate) : 0
  };
  
  return {
    weather,
    setWeather,
    timeOfDay,
    setTimeOfDay,
    isDay,
    skyStyle,
    celestialStyle,
    reset,
    isOverridden,
    moonPhase,
  };
};

export type UseWeatherAndTimeReturn = ReturnType<typeof useWeatherAndTime>;
