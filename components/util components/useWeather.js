import { useState, useEffect } from 'react';

// WMO Weather interpretation codes → emoji mapping
const weatherCodeToEmoji = (code, isNight = false) => {
    if (code === 0) return isNight ? '🌙' : '☀️';
    if (code >= 1 && code <= 2) return isNight ? '☁️' : '⛅';
    if (code === 3) return '☁️';
    if (code >= 45 && code <= 48) return '🌫️';
    if (code >= 51 && code <= 57) return '🌦️';
    if (code >= 61 && code <= 67) return '🌧️';
    if (code >= 71 && code <= 77) return '🌨️';
    if (code >= 80 && code <= 82) return '🌧️';
    if (code >= 85 && code <= 86) return '🌨️';
    if (code >= 95) return '⛈️';
    return '☁️';
};

const weatherCodeToLabel = (code) => {
    if (code === 0) return 'Clear';
    if (code >= 1 && code <= 2) return 'Partly Cloudy';
    if (code === 3) return 'Overcast';
    if (code >= 45 && code <= 48) return 'Foggy';
    if (code >= 51 && code <= 57) return 'Drizzle';
    if (code >= 61 && code <= 67) return 'Rain';
    if (code >= 71 && code <= 77) return 'Snow';
    if (code >= 80 && code <= 82) return 'Showers';
    if (code >= 85 && code <= 86) return 'Snow Showers';
    if (code >= 95) return 'Thunderstorm';
    return 'Cloudy';
};

export default function useWeather() {
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWeather = async () => {
            try {
                // Try to get user's location, fallback to Kochi, India
                let lat = 9.9312;
                let lon = 76.2673;

                if (navigator.geolocation) {
                    try {
                        const pos = await new Promise((resolve, reject) =>
                            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 3000 })
                        );
                        lat = pos.coords.latitude;
                        lon = pos.coords.longitude;
                    } catch {
                        // Use default Kochi coordinates
                    }
                }

                const response = await fetch(
                    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
                );
                const data = await response.json();
                const cw = data.current_weather;

                // Determine if night (simple: 6pm-6am)
                const hour = new Date().getHours();
                const isNight = hour < 6 || hour >= 18;

                setWeather({
                    temp: Math.round(cw.temperature),
                    code: cw.weathercode,
                    emoji: weatherCodeToEmoji(cw.weathercode, isNight),
                    label: weatherCodeToLabel(cw.weathercode),
                    windSpeed: cw.windspeed,
                });
            } catch (error) {
                console.error('Weather fetch failed:', error);
                // Fallback weather
                setWeather({
                    temp: 24,
                    code: 0,
                    emoji: '☀️',
                    label: 'Clear',
                    windSpeed: 0,
                });
            } finally {
                setLoading(false);
            }
        };

        fetchWeather();
        // Refresh weather every 30 minutes
        const interval = setInterval(fetchWeather, 30 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    return { weather, loading };
}
