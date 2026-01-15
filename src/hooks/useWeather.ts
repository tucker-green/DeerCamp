import { useState, useEffect } from 'react';

// WMO Weather interpretation codes (WW)
// https://open-meteo.com/en/docs
const getWeatherLabel = (code: number): { label: string; icon: string } => {
    switch (code) {
        case 0: return { label: 'Clear sky', icon: 'sun' };
        case 1: return { label: 'Mainly clear', icon: 'cloud-sun' };
        case 2: return { label: 'Partly cloudy', icon: 'cloud-sun' };
        case 3: return { label: 'Overcast', icon: 'cloud' };
        case 45:
        case 48: return { label: 'Fog', icon: 'wind' };
        case 51:
        case 53:
        case 55: return { label: 'Drizzle', icon: 'cloud-rain' };
        case 56:
        case 57: return { label: 'Freezing Drizzle', icon: 'cloud-rain' };
        case 61:
        case 63:
        case 65: return { label: 'Rain', icon: 'cloud-rain' };
        case 66:
        case 67: return { label: 'Freezing Rain', icon: 'cloud-rain' };
        case 71:
        case 73:
        case 75: return { label: 'Snow', icon: 'snowflake' };
        case 77: return { label: 'Snow grains', icon: 'snowflake' };
        case 80:
        case 81:
        case 82: return { label: 'Rain showers', icon: 'cloud-rain' };
        case 85:
        case 86: return { label: 'Snow showers', icon: 'snowflake' };
        case 95: return { label: 'Thunderstorm', icon: 'cloud-lightning' };
        case 96:
        case 99: return { label: 'Thunderstorm', icon: 'cloud-lightning' };
        default: return { label: 'Variable', icon: 'sun' };
    }
};

const getWindDirection = (degrees: number): string => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
};

export interface WeatherData {
    temp: number;
    condition: string;
    precipitationChance: number;
    windSpeed: number;
    windDirection: string;
    isDay: boolean;
}

export const useWeather = (lat?: number, lng?: number) => {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!lat || !lng) {
            setWeather(null);
            return;
        }

        const fetchWeather = async () => {
            setLoading(true);
            setError(null);
            try {
                // Fetch current weather and precipitation probability
                const response = await fetch(
                    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,is_day,precipitation,weather_code,wind_speed_10m,wind_direction_10m&hourly=precipitation_probability&forecast_days=1&temperature_unit=fahrenheit&wind_speed_unit=mph`
                );

                if (!response.ok) {
                    throw new Error('Failed to fetch weather data');
                }

                const data = await response.json();

                // Get current precipitation probability (using the current hour)
                const currentHour = new Date().getHours();
                const precipChance = data.hourly.precipitation_probability[currentHour] || 0;

                const current = data.current;
                const { label } = getWeatherLabel(current.weather_code);

                setWeather({
                    temp: Math.round(current.temperature_2m),
                    condition: label,
                    precipitationChance: precipChance,
                    windSpeed: Math.round(current.wind_speed_10m),
                    windDirection: getWindDirection(current.wind_direction_10m),
                    isDay: !!current.is_day
                });

            } catch (err) {
                console.error('Weather fetch error:', err);
                setError('Could not load weather');
            } finally {
                setLoading(false);
            }
        };

        fetchWeather();

        // Refresh every 30 minutes
        const interval = setInterval(fetchWeather, 30 * 60 * 1000);
        return () => clearInterval(interval);

    }, [lat, lng]);

    return { weather, loading, error };
};
