import React, { useRef } from 'react';

export default function AndroidStatusBar({
    time,
    onPullDown,
    hasNotifications = false,
    notificationCount = 3,
    wifiOn = true,
    btOn = true,
    dndOn = false
}) {
    const touchStartY = useRef(null);

    const formatTime = () => {
        if (!time) return '12:00';
        return time.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: false
        });
    };

    const handleTouchStart = (e) => {
        if (e.touches && e.touches.length > 0) {
            touchStartY.current = e.touches[0].clientY;
        }
    };

    const handleTouchEnd = (e) => {
        if (touchStartY.current !== null && e.changedTouches && e.changedTouches.length > 0) {
            const deltaY = e.changedTouches[0].clientY - touchStartY.current;
            if (deltaY > 15 && onPullDown) {
                onPullDown();
            }
        }
        touchStartY.current = null;
    };

    const showNotifIcons = hasNotifications && notificationCount > 0;

    return (
        <div
            className="android-status-bar select-none"
            onClick={onPullDown}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            role="button"
            aria-label="Status bar - tap or swipe down for notifications"
        >
            {/* Left side: Time + modern Android notification status icons */}
            <div className="flex items-center gap-2 min-w-0">
                <span className="font-semibold text-[13px] tracking-tight tabular-nums text-white/95">
                    {formatTime()}
                </span>

                {dndOn && (
                    <svg
                        className="w-3.5 h-3.5 text-white/85 flex-shrink-0"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-label="Do Not Disturb active"
                    >
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11H7v-2h10v2z" />
                    </svg>
                )}

                {showNotifIcons && (
                    <div className="flex items-center gap-1.5 text-white/80">
                        {/* Portfolio icon */}
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z" />
                        </svg>
                        {notificationCount >= 2 && (
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.03-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z" />
                            </svg>
                        )}
                        {notificationCount >= 3 && (
                            <span className="w-1 h-1 rounded-full bg-white/80" />
                        )}
                    </div>
                )}
            </div>

            {/* Center camera punch-hole indicator (subtle Pixel aesthetic) */}
            <div className="w-2.5 h-2.5 rounded-full bg-black/50 ring-1 ring-white/10 pointer-events-none hidden sm:block" />

            {/* Right side: System status icons (Bluetooth, Wi-Fi/5G, Signal, Battery) */}
            <div className="android-status-bar-icons">
                {/* Bluetooth active icon */}
                {btOn && (
                    <svg className="w-3.5 h-3.5 text-white/85" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.71 7.71L12 2h-1v7.59L6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 11 14.41V22h1l5.71-5.71-4.3-4.29 4.3-4.29zM13 5.83l1.88 1.88L13 9.59V5.83zm1.88 10.46L13 18.17v-3.76l1.88 1.88z" />
                    </svg>
                )}

                {/* Wi-Fi or 5G indicator */}
                {wifiOn ? (
                    <svg className="w-3.5 h-3.5 text-white/95" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 4C7.31 4 3.07 5.9 0 8.98L12 21 24 8.98C20.93 5.9 16.69 4 12 4z" />
                    </svg>
                ) : (
                    <span className="text-[10px] font-bold tracking-tighter text-white/90 leading-none">5G</span>
                )}

                {/* Cellular Signal Bar */}
                <svg className="w-3.5 h-3.5 text-white/95" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2 22h20V2L2 22zm18-2h-3V9.83l3-3V20z" />
                </svg>

                {/* Modern Android Battery Pill + Percentage */}
                <div className="flex items-center gap-1 ml-0.5">
                    <span className="text-[11.5px] font-semibold tabular-nums text-white/95 leading-none">85%</span>
                    <svg width="11" height="15" viewBox="0 0 12 18" fill="none" className="flex-shrink-0">
                        <rect x="3.5" y="0.5" width="5" height="2" rx="0.8" fill="white" fillOpacity="0.85" />
                        <rect x="1" y="2.5" width="10" height="14.5" rx="2.5" stroke="white" strokeOpacity="0.9" strokeWidth="1.3" />
                        <rect x="2.5" y="5" width="7" height="10.5" rx="1.2" fill="#81C995" />
                    </svg>
                </div>
            </div>
        </div>
    );
}
