import React, { useRef, useState } from 'react';

export default function AndroidApp({
    app,
    onClose,
    onOpenApp,
    onOpenRecents,
    closing,
    ...props
}) {
    const touchStartX = useRef(0);
    const isEdgeSwipe = useRef(false);
    const [backDragX, setBackDragX] = useState(0);

    const handleTouchStart = (e) => {
        if (!e.touches || e.touches.length === 0) return;
        const startX = e.touches[0].clientX;
        touchStartX.current = startX;
        isEdgeSwipe.current = startX < 36;
        setBackDragX(0);
    };

    const handleTouchMove = (e) => {
        if (!isEdgeSwipe.current || !e.touches || e.touches.length === 0) return;
        const deltaX = Math.max(0, e.touches[0].clientX - touchStartX.current);
        setBackDragX(Math.min(140, deltaX));
    };

    const handleTouchEnd = (e) => {
        if (isEdgeSwipe.current && e.changedTouches && e.changedTouches.length > 0) {
            const deltaX = e.changedTouches[0].clientX - touchStartX.current;
            if (deltaX > 75) {
                setBackDragX(0);
                isEdgeSwipe.current = false;
                onClose();
                return;
            }
        }
        setBackDragX(0);
        isEdgeSwipe.current = false;
    };

    const renderAppContent = () => {
        if (!app.screen) {
            return (
                <div className="flex items-center justify-center h-full text-white/50">
                    <p>No content available</p>
                </div>
            );
        }

        const ScreenComponent = app.screen;

        return (
            <div className="h-full bg-ub-cool-grey">
                <ScreenComponent openApp={onOpenApp} onClose={onClose} {...props} />
            </div>
        );
    };

    const predictiveScale = backDragX > 0 ? 1 - Math.min(backDragX, 120) / 1200 : 1;
    const predictiveRadius = backDragX > 10 ? '28px' : '0px';

    return (
        <div
            className={`android-app-window ${closing ? 'closing' : 'open'}`}
            style={
                backDragX > 0
                    ? {
                          transform: `translateX(${Math.min(backDragX * 0.25, 28)}px) scale(${predictiveScale})`,
                          borderRadius: predictiveRadius,
                          overflow: 'hidden',
                      }
                    : undefined
            }
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {/* Android 14 Predictive Back Gesture Pill */}
            {backDragX > 12 && (
                <div
                    className="fixed left-2 top-1/2 -translate-y-1/2 z-[150] flex items-center justify-center rounded-full bg-[#A8C7FA] text-[#062E6F] shadow-[0_6px_20px_rgba(0,0,0,0.5)] pointer-events-none transition-transform duration-75"
                    style={{
                        width: `${Math.min(44, 24 + backDragX * 0.2)}px`,
                        height: '52px',
                        transform: `translate(${Math.min(18, backDragX * 0.15)}px, -50%)`,
                    }}
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                </div>
            )}

            {/* Modern Material You App Top Bar */}
            <div className="android-app-header justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                    <button
                        type="button"
                        className="android-app-header-back"
                        onClick={onClose}
                        aria-label="Back to Home"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                    </button>
                    {app.icon && !app.custom_icon && (
                        <img
                            src={app.icon}
                            alt={app.title}
                            className="w-5 h-5 rounded-md object-contain flex-shrink-0"
                            onError={(e) => {
                                e.target.src = './themes/Yaru/apps/bash.png';
                            }}
                        />
                    )}
                    <div className="android-app-header-title truncate">{app.title}</div>
                </div>

                {/* Quick Recents / App Switcher Button */}
                {onOpenRecents && (
                    <button
                        type="button"
                        onClick={onOpenRecents}
                        aria-label="Recent apps"
                        title="Recent apps"
                        className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/15 flex items-center justify-center text-white/80 transition-colors flex-shrink-0"
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="6" y="5" width="12" height="14" rx="2.5" />
                            <path d="M3 8v8M21 8v8" strokeLinecap="round" />
                        </svg>
                    </button>
                )}
            </div>

            {/* App Content */}
            <div className="android-app-content">
                {renderAppContent()}
            </div>
        </div>
    );
}
