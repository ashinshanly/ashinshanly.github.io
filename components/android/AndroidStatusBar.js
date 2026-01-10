import React from 'react';

export default function AndroidStatusBar({ time, onPullDown, hasNotifications = false }) {
    const formatTime = () => {
        return time.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: false
        });
    };

    return (
        <div
            className="android-status-bar"
            onClick={onPullDown}
        >
            {/* Left side - Time and notification dot */}
            <div className="flex items-center gap-2">
                <span className="font-medium">{formatTime()}</span>
                {hasNotifications && (
                    <div className="w-1.5 h-1.5 rounded-full bg-[#8AB4F8]"></div>
                )}
            </div>

            {/* Right side - Icons */}
            <div className="android-status-bar-icons">
                {/* WiFi Icon */}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                    <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z" />
                </svg>

                {/* Signal Icon */}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                    <path d="M2 22h20V2L2 22zm18-2h-3V9.83l3-3V20z" />
                </svg>

                {/* Battery Icon */}
                <div className="flex items-center gap-1">
                    <svg width="20" height="12" viewBox="0 0 24 14" fill="none">
                        <rect x="0.5" y="0.5" width="20" height="13" rx="2.5" stroke="white" />
                        <rect x="2" y="2" width="14" height="10" rx="1" fill="white" />
                        <rect x="21" y="4" width="3" height="6" rx="1" fill="white" />
                    </svg>
                    <span className="text-xs">85</span>
                </div>
            </div>
        </div>
    );
}
