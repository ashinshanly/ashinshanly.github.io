import React, { useRef } from 'react';

export default function AndroidApp({ app, onClose, onOpenApp, closing }) {
    const touchStartX = useRef(0);

    // Handle back gesture (swipe from left edge)
    const handleTouchStart = (e) => {
        touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = (e) => {
        const touchEndX = e.changedTouches[0].clientX;
        const deltaX = touchEndX - touchStartX.current;

        // Swipe from left edge to go back
        if (touchStartX.current < 30 && deltaX > 80) {
            onClose();
        }
    };

    // Render the app's screen component
    const renderAppContent = () => {
        if (!app.screen) {
            return (
                <div className="flex items-center justify-center h-full text-white/50">
                    <p>No content available</p>
                </div>
            );
        }

        // Get the screen component
        const ScreenComponent = app.screen;

        return (
            <div className="h-full bg-ub-cool-grey">
                <ScreenComponent openApp={onOpenApp} />
            </div>
        );
    };

    return (
        <div
            className={`android-app-window ${closing ? 'closing' : 'open'}`}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            {/* App Header */}
            <div className="android-app-header">
                <div
                    className="android-app-header-back"
                    onClick={onClose}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                </div>
                <div className="android-app-header-title">{app.title}</div>
            </div>

            {/* App Content */}
            <div className="android-app-content">
                {renderAppContent()}
            </div>
        </div>
    );
}
