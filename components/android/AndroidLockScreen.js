import React, { useState, useRef } from 'react';

export default function AndroidLockScreen({ onUnlock }) {
    const [isDragging, setIsDragging] = useState(false);
    const [dragProgress, setDragProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(new Date());
    const touchStartY = useRef(0);

    // Update time
    React.useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = () => {
        return currentTime.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: false
        });
    };

    const formatDate = () => {
        return currentTime.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
        });
    };

    const handleTouchStart = (e) => {
        touchStartY.current = e.touches[0].clientY;
        setIsDragging(true);
    };

    const handleTouchMove = (e) => {
        if (!isDragging) return;
        const deltaY = touchStartY.current - e.touches[0].clientY;
        const progress = Math.min(Math.max(deltaY / 200, 0), 1);
        setDragProgress(progress);
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
        if (dragProgress > 0.5) {
            onUnlock();
        } else {
            setDragProgress(0);
        }
    };

    return (
        <div
            className="fixed inset-0 z-[100] flex flex-col items-center justify-between bg-black"
            style={{
                opacity: 1 - dragProgress * 0.5,
                transform: `translateY(${-dragProgress * 100}px)`
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-blue-900/30 via-purple-900/20 to-black" />

            {/* Time and Date */}
            <div className="relative z-10 flex flex-col items-center mt-32">
                <div className="text-8xl font-extralight text-white tracking-tight">
                    {formatTime()}
                </div>
                <div className="text-xl text-white/80 mt-4 font-light">
                    {formatDate()}
                </div>
            </div>

            {/* Notifications placeholder */}
            <div className="relative z-10 flex-grow flex items-center justify-center">
                <div className="text-center text-white/40">
                    <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    <p className="text-sm">No notifications</p>
                </div>
            </div>

            {/* Swipe to unlock */}
            <div className="relative z-10 mb-12 flex flex-col items-center">
                <div
                    className="w-16 h-1 bg-white/40 rounded-full mb-4"
                    style={{
                        transform: `scaleX(${1 + dragProgress * 0.5})`
                    }}
                />
                <div className="flex items-center gap-2 text-white/60 animate-bounce">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                    <span className="text-sm">Swipe up to unlock</span>
                </div>
            </div>

            {/* Bottom shortcuts */}
            <div className="absolute bottom-8 left-0 right-0 flex justify-between px-12">
                <button className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </button>
                <button className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
