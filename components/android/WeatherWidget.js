import React from 'react';
import useWeather from '../util components/useWeather';

export default function WeatherWidget() {
    const { weather, loading } = useWeather();

    if (loading) {
        return (
            <div className="w-full h-44 rounded-3xl p-5 glass-card animate-pulse flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-purple-500/10"></div>
                <div className="w-10 h-10 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!weather) return null;

    // Dynamic gradient based on weather condition
    const getWeatherGradient = (code) => {
        if (code === 0) return 'from-amber-500/15 via-orange-400/10 to-yellow-300/5'; // Clear
        if (code >= 1 && code <= 3) return 'from-slate-400/15 via-blue-300/10 to-indigo-400/5'; // Cloudy
        if (code >= 45 && code <= 48) return 'from-gray-500/20 via-slate-400/10 to-gray-300/5'; // Fog
        if (code >= 51 && code <= 67) return 'from-blue-500/15 via-cyan-400/10 to-blue-300/5'; // Rain
        if (code >= 71 && code <= 86) return 'from-blue-200/15 via-white/10 to-blue-100/5'; // Snow
        if (code >= 95) return 'from-purple-500/15 via-indigo-500/10 to-blue-500/5'; // Thunder
        return 'from-cyan-500/10 via-blue-400/5 to-purple-500/10';
    };

    // Dynamic glow color
    const getGlowColor = (code) => {
        if (code === 0) return 'rgba(251, 191, 36, 0.15)';
        if (code >= 1 && code <= 3) return 'rgba(148, 163, 184, 0.1)';
        if (code >= 51 && code <= 67) return 'rgba(96, 165, 250, 0.15)';
        if (code >= 95) return 'rgba(139, 92, 246, 0.15)';
        return 'rgba(6, 182, 212, 0.1)';
    };

    return (
        <div
            className="w-full rounded-3xl p-4 relative overflow-hidden group"
            style={{
                background: 'rgba(20, 20, 30, 0.6)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                boxShadow: `0 8px 32px ${getGlowColor(weather.code)}, inset 0 1px 0 rgba(255,255,255,0.05)`
            }}
        >
            {/* Animated gradient overlay */}
            <div className={`absolute inset-0 bg-gradient-to-br ${getWeatherGradient(weather.code)} opacity-80 transition-all duration-1000`}></div>

            {/* Scanline effect */}
            <div className="absolute inset-0 opacity-[0.03]" style={{
                backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)',
            }}></div>

            {/* Floating orb decoration */}
            <div
                className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-20 blur-2xl animate-pulse"
                style={{ background: `radial-gradient(circle, ${weather.code === 0 ? 'rgba(251,191,36,0.4)' : 'rgba(6,182,212,0.3)'}, transparent)` }}
            ></div>

            <div className="relative z-10 flex justify-between items-start">
                {/* Left: Location + Temp */}
                <div className="flex flex-col">
                    {/* Location */}
                    <div className="flex items-center gap-1.5 mb-3">
                        <svg className="w-3 h-3 text-cyan-400/80" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                        </svg>
                        <span className="text-[11px] font-medium text-white/60 tracking-wider uppercase">Kochi, IN</span>
                    </div>

                    {/* Temperature */}
                    <div className="flex items-start gap-1">
                        <span
                            className="text-[42px] font-extralight text-white leading-none tracking-tighter"
                            style={{ textShadow: '0 0 40px rgba(255,255,255,0.1)' }}
                        >
                            {weather.temp}
                        </span>
                        <span className="text-white/40 text-base font-light mt-1">°C</span>
                    </div>

                    {/* Condition label + details */}
                    <div className="mt-1 flex items-center gap-2">
                        <span
                            className="text-[11px] font-medium tracking-widest uppercase px-2 py-0.5 rounded-full"
                            style={{
                                background: 'rgba(255,255,255,0.06)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                color: 'rgba(255,255,255,0.7)',
                            }}
                        >
                            {weather.label}
                        </span>
                        <span className="text-[10px] text-white/30">
                            H:{weather.temp + 4}° L:{weather.temp - 3}°
                        </span>
                    </div>
                </div>

                {/* Right: Weather Icon */}
                <div className="flex flex-col items-center gap-2 mt-1">
                    {/* Large emoji with glow */}
                    <div className="relative">
                        <div
                            className="absolute inset-0 blur-xl opacity-40 scale-150"
                            style={{ background: `radial-gradient(circle, ${weather.code === 0 ? 'rgba(251,191,36,0.5)' : 'rgba(96,165,250,0.4)'}, transparent)` }}
                        ></div>
                        <span className="relative text-4xl" style={{
                            filter: 'drop-shadow(0 0 12px rgba(255,255,255,0.2))'
                        }}>
                            {weather.emoji}
                        </span>
                    </div>

                    {/* Wind speed */}
                    {weather.windSpeed > 0 && (
                        <div className="flex items-center gap-1 text-[10px] text-white/35">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
                            </svg>
                            <span>{weather.windSpeed} km/h</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom: Hourly forecast placeholders */}
            <div className="relative z-10 mt-3 pt-2 border-t border-white/5">
                <div className="flex justify-between items-center">
                    {['Now', '+1h', '+2h', '+3h', '+4h'].map((time, i) => (
                        <div key={i} className="flex flex-col items-center gap-1">
                            <span className="text-[9px] text-white/30 font-medium">{time}</span>
                            <span className="text-sm">{weather.emoji}</span>
                            <span className="text-[10px] text-white/50 font-light">{weather.temp + (i === 0 ? 0 : Math.round(Math.random() * 3 - 1))}°</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
