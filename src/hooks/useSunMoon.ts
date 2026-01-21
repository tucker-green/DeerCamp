import { useMemo } from 'react';

export interface SunMoonData {
  sunrise: string;      // HH:MM AM/PM format
  sunset: string;       // HH:MM AM/PM format
  dayLength: string;    // X hrs Y min format
  moonPhase: MoonPhase;
  moonIllumination: number; // 0-100%
}

export type MoonPhase = 
  | 'new'
  | 'waxing-crescent'
  | 'first-quarter'
  | 'waxing-gibbous'
  | 'full'
  | 'waning-gibbous'
  | 'last-quarter'
  | 'waning-crescent';

/**
 * Calculate sunrise and sunset times using the sunrise equation
 * Based on NOAA Solar Calculator algorithms
 */
function calculateSunTimes(lat: number, lng: number, date: Date): { sunrise: Date; sunset: Date } {
  const dayOfYear = getDayOfYear(date);
  const zenith = 90.833; // Official zenith for sunrise/sunset
  
  // Convert latitude to radians
  const latRad = lat * (Math.PI / 180);
  
  // Calculate the sun's declination
  const declination = 23.45 * Math.sin((360 / 365) * (dayOfYear - 81) * (Math.PI / 180));
  const decRad = declination * (Math.PI / 180);
  
  // Calculate the hour angle
  const cosHourAngle = (Math.cos(zenith * (Math.PI / 180)) - Math.sin(latRad) * Math.sin(decRad)) / 
                       (Math.cos(latRad) * Math.cos(decRad));
  
  // Clamp to valid range for acos
  const clampedCos = Math.max(-1, Math.min(1, cosHourAngle));
  const hourAngle = Math.acos(clampedCos) * (180 / Math.PI);
  
  // Calculate solar noon (in hours, local time approximation)
  const solarNoon = 12 - (lng / 15); // Rough approximation
  
  // Calculate sunrise and sunset times (in hours)
  const sunriseHours = solarNoon - (hourAngle / 15);
  const sunsetHours = solarNoon + (hourAngle / 15);
  
  // Convert to Date objects
  const sunrise = new Date(date);
  sunrise.setHours(Math.floor(sunriseHours), Math.round((sunriseHours % 1) * 60), 0, 0);
  
  const sunset = new Date(date);
  sunset.setHours(Math.floor(sunsetHours), Math.round((sunsetHours % 1) * 60), 0, 0);
  
  return { sunrise, sunset };
}

/**
 * Get day of year (1-365/366)
 */
function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

/**
 * Calculate moon phase using Conway's algorithm
 * Returns a value from 0-29 representing the lunar day
 */
function calculateMoonDay(date: Date): number {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  let r = year % 100;
  r %= 19;
  if (r > 9) r -= 19;
  r = ((r * 11) % 30) + month + day;
  if (month < 3) r += 2;
  r -= ((year < 2000) ? 4 : 8.3);
  r = Math.floor(r + 0.5) % 30;
  return (r < 0) ? r + 30 : r;
}

/**
 * Convert lunar day to moon phase name
 */
function getMoonPhase(lunarDay: number): MoonPhase {
  if (lunarDay < 1 || lunarDay >= 29) return 'new';
  if (lunarDay < 7) return 'waxing-crescent';
  if (lunarDay < 8) return 'first-quarter';
  if (lunarDay < 14) return 'waxing-gibbous';
  if (lunarDay < 16) return 'full';
  if (lunarDay < 22) return 'waning-gibbous';
  if (lunarDay < 23) return 'last-quarter';
  return 'waning-crescent';
}

/**
 * Calculate moon illumination percentage
 */
function getMoonIllumination(lunarDay: number): number {
  // Approximate illumination based on lunar day
  // Full moon at day 15, new moon at day 0/30
  const normalized = lunarDay / 29.5;
  const illumination = (1 - Math.cos(normalized * 2 * Math.PI)) / 2;
  return Math.round(illumination * 100);
}

/**
 * Format time as HH:MM AM/PM
 */
function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Calculate day length string
 */
function formatDayLength(sunrise: Date, sunset: Date): string {
  const diffMs = sunset.getTime() - sunrise.getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.round((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
}

/**
 * Hook to get sunrise, sunset, and moon phase data
 * @param lat Latitude of the location
 * @param lng Longitude of the location
 * @param date Optional date (defaults to today)
 */
export function useSunMoon(lat?: number, lng?: number, date?: Date): SunMoonData | null {
  return useMemo(() => {
    // Default to a central US location if no coordinates provided
    const latitude = lat ?? 39.8283;
    const longitude = lng ?? -98.5795;
    const targetDate = date ?? new Date();
    
    try {
      const { sunrise, sunset } = calculateSunTimes(latitude, longitude, targetDate);
      const lunarDay = calculateMoonDay(targetDate);
      
      return {
        sunrise: formatTime(sunrise),
        sunset: formatTime(sunset),
        dayLength: formatDayLength(sunrise, sunset),
        moonPhase: getMoonPhase(lunarDay),
        moonIllumination: getMoonIllumination(lunarDay)
      };
    } catch (error) {
      console.error('Error calculating sun/moon data:', error);
      return null;
    }
  }, [lat, lng, date]);
}

/**
 * Get a human-readable moon phase name
 */
export function getMoonPhaseName(phase: MoonPhase): string {
  const names: Record<MoonPhase, string> = {
    'new': 'New Moon',
    'waxing-crescent': 'Waxing Crescent',
    'first-quarter': 'First Quarter',
    'waxing-gibbous': 'Waxing Gibbous',
    'full': 'Full Moon',
    'waning-gibbous': 'Waning Gibbous',
    'last-quarter': 'Last Quarter',
    'waning-crescent': 'Waning Crescent'
  };
  return names[phase];
}
