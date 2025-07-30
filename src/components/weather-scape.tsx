'use client';

import { useState, useEffect, type FC } from 'react';
import { cn } from '@/lib/utils';
import type { UseWeatherAndTimeReturn } from '@/hooks/use-weather-and-time';

const Effect: FC<{ count: number; className: string; styleGenerator: (i: number) => React.CSSProperties }> = ({ count, className, styleGenerator }) => {
  const [items, setItems] = useState<{ id: number; style: React.CSSProperties }[]>([]);

  useEffect(() => {
    const generateItems = () => {
      const newItems = Array.from({ length: count }).map((_, i) => ({
        id: i,
        style: styleGenerator(i),
      }));
      setItems(newItems);
    };
    generateItems();
  }, [count, styleGenerator]);

  return (
    <>
      {items.map(item => <div key={item.id} className={className} style={item.style} />)}
    </>
  );
};

const MoonPhaseDisplay: FC<{ path: string; shadow: string }> = ({ path, shadow }) => (
  <div className="relative w-full h-full">
    <svg viewBox="0 0 100 100" className="w-full h-full absolute inset-0 -scale-x-100">
      <defs>
        <mask id="moon-mask">
          <rect fill="white" x="0" y="0" width="100" height="100" />
          <path d={path} fill="black" />
        </mask>
      </defs>
      {/* This is the lit part of the moon */}
      <circle cx="50" cy="50" r="50" fill="currentColor" />
      {/* This is the dark part of the moon, revealed by the mask */}
      <circle cx="50" cy="50" r="50" fill="currentColor" fillOpacity="0.3" mask="url(#moon-mask)" />
    </svg>
    <div className="absolute inset-0 rounded-full" style={{ boxShadow: shadow }}></div>
  </div>
);

const WeatherScape: FC<UseWeatherAndTimeReturn> = ({
  weather,
  skyStyle,
  celestialStyle,
  isDay,
  moonPhase,
}) => {
  const showClouds = ['Partly Cloudy', 'Cloudy', 'Rainy', 'Stormy', 'Snowy', 'Foggy'].includes(weather);

  return (
    <div
      className="fixed inset-0 -z-10 w-full h-full transition-all duration-1000 ease-in-out"
      style={skyStyle}
    >
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
        {/* Celestial Body Orbit */}
        <div 
          className="absolute w-[200vw] h-[200vw] sm:w-[150vw] sm:h-[150vw] md:w-[120vw] md:h-[120vw] left-1/2 top-full -translate-x-1/2 -translate-y-[calc(50%-5rem)] transition-transform duration-1000 ease-in-out" 
          style={{ transform: `translateX(-50%) translateY(calc(-50% + 5rem)) rotate(${celestialStyle.rotateDeg || 0}deg)`}}
        >
          <div
            className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 w-16 h-16 sm:w-20 sm:h-20 rounded-full transition-all duration-1000 ease-in-out text-white"
            style={{
              backgroundColor: isDay ? celestialStyle.backgroundColor : undefined,
              color: isDay ? undefined : celestialStyle.backgroundColor,
              boxShadow: isDay ? celestialStyle.boxShadow : undefined,
            }}
          >
            {!isDay && moonPhase && (
              <MoonPhaseDisplay path={moonPhase.path} shadow={celestialStyle.boxShadow || ''} />
            )}
          </div>
        </div>

        {/* Weather Effects */}
        {weather === 'Rainy' && <Effect count={100} className="absolute w-0.5 h-6 bg-gradient-to-b from-white/50 to-transparent animate-rain-fall" styleGenerator={() => ({ left: `${Math.random() * 100}vw`, animationDelay: `${Math.random() * 2}s`, animationDuration: `${0.5 + Math.random() * 0.5}s` })} />}
        {weather === 'Stormy' && <Effect count={150} className="absolute w-0.5 h-8 bg-gradient-to-b from-white/60 to-transparent animate-rain-fall" styleGenerator={() => ({ left: `${Math.random() * 100}vw`, animationDelay: `${Math.random() * 1}s`, animationDuration: `${0.3 + Math.random() * 0.3}s` })} />}
        {weather === 'Snowy' && <Effect count={150} className="absolute w-1.5 h-1.5 bg-white rounded-full animate-snow-fall opacity-0" styleGenerator={() => ({ left: `${Math.random() * 100}vw`, transform: `scale(${0.3 + Math.random() * 0.7})`, animationDelay: `${Math.random() * 10}s`, animationDuration: `${5 + Math.random() * 10}s` })} />}
        {showClouds && <Effect count={15} className={cn("absolute bg-white/40 rounded-full animate-cloud-drift", weather === 'Stormy' || weather === 'Foggy' ? 'bg-gray-500/50' : '')} styleGenerator={() => ({ top: `${5 + Math.random() * 30}%`, left: '0%', width: `${120 + Math.random() * 150}px`, height: `${30 + Math.random() * 60}px`, transform: `scale(${0.5 + Math.random() * 1})`, animationDelay: `${Math.random() * 10}s`, animationDuration: `${40 + Math.random() * 80}s`, opacity: `${0.3 + Math.random() * 0.4}` })} />}
        {weather === 'Foggy' && <div className="absolute inset-0 bg-gray-400/50 backdrop-blur-sm transition-all duration-1000"></div>}
        {weather === 'Stormy' && <div className="absolute inset-0 animate-lightning-flash bg-white/30 opacity-0"></div>}
        {!isDay && <Effect count={100} className="absolute w-0.5 h-0.5 bg-white rounded-full" styleGenerator={() => ({ top: `${Math.random() * 80}%`, left: `${Math.random() * 100}%` })} />}
        {!isDay && <Effect count={1} className="absolute w-20 h-0.5 bg-gradient-to-r from-white to-transparent opacity-0 animate-shooting-star" styleGenerator={() => ({ top: `${Math.random() * 50}%`, left: '0%', animationDelay: `${5 + Math.random() * 15}s`, animationDuration: '3s' })} />}
      </div>
    </div>
  );
};

export default WeatherScape;
