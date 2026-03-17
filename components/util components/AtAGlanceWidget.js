import React, { useState, useEffect } from 'react';

export default function AtAGlanceWidget() {
    const [currentTime, setCurrentTime] = useState(new Date());

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
            <div className="flex items-center gap-2 text-white/80 text-sm font-medium mb-1 tracking-wide">
                <span>{formatDate()}</span>
                <span className="text-white/40">•</span>
                <span>24°C</span>
                <span>☀️</span>
            </div>
            <div className="text-white text-6xl font-extralight tracking-tighter leading-none"
                 style={{ textShadow: '0 0 60px rgba(255,255,255,0.08)' }}>
                {formatTime()}
            </div>
        </div>
    );
}
