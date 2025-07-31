
'use client';

import { useState, useEffect, useCallback } from 'react';

export type WeatherCondition = 'Clear' | 'Rainy' | 'Stormy' | 'Snowy' | 'Foggy' | 'Cloudy' | 'Partly Cloudy' | 'Sunny' | string;
export type TimeOfDay = 'Morning' | 'Noon' | 'Evening' | 'Night';

const skyThemes = {
  Morning: {
    gradient: 'linear-gradient(to top, #FFDAB9, #87CEEB)',
    sunColor: '#FFD700',
    sunShadow: '0 0 40px #FFD700',
    rainGradient: 'linear-gradient(to bottom, #6c757d, #adb5bd)',
    stormGradient: 'linear-gradient(to bottom, #343a40, #6c757d)',
  },
  Noon: {
    gradient: 'linear-gradient(to bottom, #87CEEB, #A0C4FF)',
    sunColor: '#FFFFFF',
    sunShadow: '0 0 50px #FFFFFF',
    rainGradient: 'linear-gradient(to bottom, #778da9, #adb5bd)',
    stormGradient: 'linear-gradient(to bottom, #495057, #6c757d)',
  },
  Evening: {
    gradient: 'linear-gradient(to bottom, #4682B4, #FF6347)',
    sunColor: '#FFA500',
    sunShadow: '0 0 40px #FFA500'
  },
  Night: {
    gradient: 'linear-gradient(to bottom, #1E232F, #000033)',
    moonColor: '#FFECB3',
    moonShadow: '0 0 30px #FFECB3'
  },
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

  const dayStart = 6 * 60;
  const dayEnd = 19 * 60;
  const nightStart = dayEnd;
  const nightEnd = dayStart + 24 * 60;

  let progress;
  if (totalMinutes >= dayStart && totalMinutes < dayEnd) {
    progress = (totalMinutes - dayStart) / (dayEnd - dayStart);
    return progress * 180 - 90;
  } else {
    let totalNightMinutes = totalMinutes >= nightStart ? totalMinutes : totalMinutes + 24 * 60;
    progress = (totalNightMinutes - nightStart) / (nightEnd - nightStart);
    return progress * 180 - 90;
  }
};

const getMoonPhase = (date: Date) => {
    const synodicMonth = 29.53058867;
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

    const r = 50;
    const x = 50;
    const y = 50;
    let path;

    if (phase < 0.5) {
        const a = 2 * r * (0.5 - phase);
        path = `M${x},${y-r} A${a},${r} 0 1,0 ${x},${y+r} A${r},${r} 0 1,1 ${x},${y-r}Z`;
    } else {
        const a = 2 * r * (phase - 0.5);
        path = `M${x},${y-r} A${r},${r} 0 1,1 ${x},${y+r} A${a},${r} 0 1,0 ${x},${y-r}Z`;
    }

    return {
      phase: phase,
      phaseName: currentPhaseInfo.name,
      path: path,
    };
};

const mapWeatherCondition = (condition: string): WeatherCondition => {
    const lowerCaseCondition = condition.toLowerCase();
    if (lowerCaseCondition.includes('rain') || lowerCaseCondition.includes('drizzle')) return 'Rainy';
    if (lowerCaseCondition.includes('storm') || lowerCaseCondition.includes('thunder')) return 'Stormy';
    if (lowerCaseCondition.includes('snow') || lowerCaseCondition.includes('sleet') || lowerCaseCondition.includes('blizzard')) return 'Snowy';
    if (lowerCaseCondition.includes('fog') || lowerCaseCondition.includes('mist')) return 'Foggy';
    if (lowerCaseCondition.includes('cloudy') || lowerCaseCondition.includes('overcast')) return 'Cloudy';
    if (lowerCaseCondition.includes('partly cloudy') || lowerCaseCondition.includes('partly clear')) return 'Partly Cloudy';
    if (lowerCaseCondition.includes('sunny')) return 'Sunny';
    if (lowerCaseCondition.includes('clear')) return 'Clear';
    return 'Clear';
};


export const useWeatherAndTime = (liveWeatherCondition?: string) => {
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
    if (liveWeatherCondition) {
      setWeatherState(mapWeatherCondition(liveWeatherCondition));
    }
  }, [liveWeatherCondition]);


  useEffect(() => {
    const weatherOverride = localStorage.getItem('weather-override') as WeatherCondition;
    const timeOverride = localStorage.getItem('time-override') as TimeOfDay;

    let now = new Date();

    if (weatherOverride && timeOverride) {
      setWeatherState(weatherOverride);
      setTimeOfDayState(timeOverride);
      setIsOverridden(true);
    } else if (liveWeatherCondition) {
      setWeatherState(mapWeatherCondition(liveWeatherCondition));
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
  }, [isOverridden, liveWeatherCondition]);

  const isDay = timeOfDay !== 'Night';
  const theme = skyThemes[timeOfDay];

  let displayWeather = weather;
  if(weather === 'Sunny' && !isDay) displayWeather = 'Clear';
  if(weather === 'Clear' && isDay) displayWeather = 'Sunny';

  let backgroundGradient = theme.gradient;
  if (isDay && (timeOfDay === 'Morning' || timeOfDay === 'Noon')) {
    if (weather === 'Rainy') {
      backgroundGradient = theme.rainGradient!;
    } else if (weather === 'Stormy') {
      backgroundGradient = theme.stormGradient!;
    }
  }

  const skyStyle = {
    background: backgroundGradient,
  };

  const celestialStyle = {
    backgroundColor: isDay ? theme.sunColor : theme.moonColor,
    boxShadow: isDay ? theme.sunShadow : theme.moonShadow,
    rotateDeg: currentDate ? getRotationForTime(currentDate) : 0
  };

  return {
    weather: displayWeather,
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
