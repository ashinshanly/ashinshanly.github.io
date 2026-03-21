import React, { useState, useEffect } from 'react';
import useWeather from './useWeather';

export default function AtAGlanceWidget() {
    const [currentTime, setCurrentTime] = useState(new Date());
    const { weather } = useWeather();

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const formatDate = () => {
        return currentTime.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTime = () => {
        return currentTime.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        }).replace(' ', '');
    };

    return (
        <div className="absolute top-12 left-20 z-10 pointer-events-none select-none">
            <div className="at-a-glance-date flex items-center gap-2 text-white/80 text-sm font-medium mb-1 tracking-wide transition-all duration-300">
                <span>{formatDate()}</span>
                <span className="text-white/40">•</span>
                <span>{weather ? `${weather.emoji} ${weather.temp}°C` : '☀ 24°C'}</span>
            </div>
            <div className="at-a-glance-clock text-white text-6xl font-extralight tracking-tighter leading-none transition-all duration-300"
                style={{ textShadow: '0 0 60px rgba(255,255,255,0.08)' }}>
                {formatTime()}
            </div>
        </div>
    );
}
