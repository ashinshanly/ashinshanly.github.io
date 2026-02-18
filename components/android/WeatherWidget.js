import React, { useState, useEffect } from 'react';

export default function WeatherWidget() {
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);

    // Default to Kochi, India
    const lat = 9.9312;
    const lon = 76.2673;

    useEffect(() => {
        const fetchWeather = async () => {
            try {
                const response = await fetch(
                    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
                );
                const data = await response.json();
                setWeather(data.current_weather);
                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch weather:", error);
                setLoading(false);
            }
        };

        fetchWeather();
    }, []);

    const getWeatherIcon = (code) => {
        // WMO Weather interpretation codes (http://www.wmo.int/pages/prog/www/IMOP/meetings/Surface/ET-AWS-5/Doc4(1).pdf)
        // 0: Clear sky
        // 1, 2, 3: Mainly clear, partly cloudy, and overcast
        // 45, 48: Fog and depositing rime fog
        // 51, 53, 55: Drizzle: Light, moderate, and dense intensity
        // 61, 63, 65: Rain: Slight, moderate and heavy intensity
        // 80, 81, 82: Rain showers: Slight, moderate, and violent
        // 95, 96, 99: Thunderstorm: Slight or moderate

        if (code === 0) return "sunny";
        if (code >= 1 && code <= 3) return "partly_cloudy_day";
        if (code >= 51 && code <= 67) return "rainy";
        if (code >= 95) return "thunderstorm";
        return "cloud-queue"; // default
    };

    if (loading) {
        return (
            <div className="w-full h-40 rounded-3xl p-4 glass-card animate-pulse flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!weather) return null;

    const iconName = getWeatherIcon(weather.weathercode);
    const temp = Math.round(weather.temperature);

    return (
        <div className="w-full rounded-3xl p-5 mb-4 glass-card relative overflow-hidden group">
            {/* Background Gradient based on weather (simplified) */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-500/20 opacity-50"></div>

            <div className="relative z-10 flex justify-between items-center">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                        </svg>
                        <span className="text-sm font-medium text-white/90">Kochi, India</span>
                    </div>
                    <div className="flex items-start">
                        <span className="text-5xl font-light text-white">{temp}°</span>
                    </div>
                    <div className="text-sm text-white/70 mt-1">
                        Feels like {temp + 2}° • High {temp + 4}°
                    </div>
                </div>

                <div className="flex flex-col items-end">
                    {/* Animated Icon Container */}
                    <div className="w-16 h-16 relative">
                        {/* Simple SVG icons based on condition */}
                        {iconName === 'sunny' && (
                            <svg className="w-full h-full text-yellow-400 animate-[spin_10s_linear_infinite]" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.79 1.42-1.41zM4 10.5H1v2h3v-2zm9-9.95h-2V3.5h2V.55zm7.45 3.91l-1.41-1.41-1.79 1.79 1.41 1.41 1.79-1.79zm-3.21 13.7l1.79 1.79 1.41-1.41-1.79-1.79-1.41 1.41zM20 10.5v2h3v-2h-3zm-8-5c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm-1 16.95h2V15.5h-2v4.95zm-7.45-3.91l1.41 1.41 1.79-1.8-1.41-1.41-1.79 1.8z" />
                            </svg>
                        )}
                        {iconName === 'rainy' && (
                            <svg className="w-full h-full text-blue-300" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M4.13 12c-.23-.59-.26-1.3-.06-1.99.66-2.27 3.01-3.6 5.28-2.96.22-2.3 2.18-4.05 4.54-4.05 2.52 0 4.56 2.04 4.56 4.56 0 .34-.04.68-.11 1.01 2.21.36 3.79 2.37 3.55 4.62-.21 1.95-1.72 3.51-3.65 3.76l-.16.02-.12.02H7.21a5.006 5.006 0 0 1-3.08-4.99zM12 17h1v4h-1v-4zm-4 1h1v4H8v-4zm8 1h1v4h-1v-4z" />
                            </svg>
                        )}
                        {(iconName !== 'sunny' && iconName !== 'rainy') && (
                            <svg className="w-full h-full text-gray-200" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" />
                            </svg>
                        )}
                    </div>
                    <span className="text-white font-medium capitalize mt-1">
                        {iconName.replace('_', ' ')}
                    </span>
                </div>
            </div>
        </div>
    );
}
