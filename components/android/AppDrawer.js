import React, { useState, useMemo } from 'react';

export default function AppDrawer({ isOpen, onClose, apps, onOpenApp }) {
    const [searchQuery, setSearchQuery] = useState('');

    // Filter apps based on search
    const filteredApps = apps.filter(app =>
        app.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const suggestedApps = useMemo(() => {
        const preferredIds = ['about-ashin', 'pixel-hud', 'terminal', 'chess'];
        return preferredIds
            .map(id => apps.find(a => a.id === id))
            .filter(Boolean);
    }, [apps]);

    const touchStartPos = React.useRef({ x: 0, y: 0 });
    const lastOpenedTime = React.useRef(0);

    // Handle app click
    const handleAppClick = (appId) => {
        const now = Date.now();
        if (now - lastOpenedTime.current < 500) return;
        lastOpenedTime.current = now;

        onOpenApp(appId);
        setSearchQuery('');
    };

    const handleTouchStart = (e) => {
        if (e.touches && e.touches.length > 0) {
            touchStartPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        } else if (e.clientX !== undefined) {
            touchStartPos.current = { x: e.clientX, y: e.clientY };
        }
    };

    const handleTouchEnd = (e, appId) => {
        if (e && e.type === 'touchend' && e.changedTouches && e.changedTouches.length > 0) {
            const touch = e.changedTouches[0];
            const distance = Math.sqrt(
                Math.pow(touch.clientX - touchStartPos.current.x, 2) +
                Math.pow(touch.clientY - touchStartPos.current.y, 2)
            );

            if (distance < 15) {
                handleAppClick(appId);
                if (e.cancelable) e.preventDefault();
            }
        }
    };

    const renderAppItem = (app, index, keyPrefix = 'all') => {
        const CustomIcon = app.custom_icon;
        return (
            <div
                key={`${keyPrefix}-${app.id || index}`}
                className="android-app-icon ripple"
                onClick={() => handleAppClick(app.id)}
                onTouchStart={handleTouchStart}
                onTouchEnd={(e) => handleTouchEnd(e, app.id)}
            >
                {CustomIcon ? (
                    <div className="w-[52px] h-[52px] flex items-center justify-center mb-2">
                        <CustomIcon size="android" />
                    </div>
                ) : (
                    <img
                        src={app.icon}
                        alt={app.title}
                        onError={(e) => {
                            e.target.src = './themes/Yaru/apps/bash.png';
                        }}
                    />
                )}
                <span>{app.title}</span>
            </div>
        );
    };

    return (
        <div className={`app-drawer ${isOpen ? 'open' : ''}`}>
            {/* Top Drag Pill Handle */}
            <div
                className="pt-2 pb-1 flex justify-center cursor-pointer flex-shrink-0"
                onClick={onClose}
                role="button"
                aria-label="Close app drawer"
            >
                <div className="w-10 h-1 rounded-full bg-white/30" />
            </div>

            {/* Search Bar */}
            <div className="app-drawer-search flex-shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                    type="text"
                    placeholder="Search apps and tools"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                    <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="p-1 rounded-full hover:bg-white/10"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                        </svg>
                    </button>
                )}
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto pb-28 scrollbar-hide">
                {/* Suggested Apps Row (Pixel Launcher style) */}
                {!searchQuery.trim() && suggestedApps.length > 0 && (
                    <div className="px-4 pt-1 pb-3 border-b border-white/10 mx-2 mb-2">
                        <div className="flex items-center justify-between px-2 mb-1">
                            <span className="text-[11px] font-semibold tracking-wider uppercase text-[#A8C7FA]">
                                Suggested
                            </span>
                            <span className="text-[10px] text-white/40">AI Predictions</span>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                            {suggestedApps.map((app, index) => renderAppItem(app, index, 'suggested'))}
                        </div>
                    </div>
                )}

                {/* All Apps Header */}
                <div className="px-6 pt-1 pb-1 flex items-center justify-between">
                    <span className="text-[11px] font-semibold tracking-wider uppercase text-white/60">
                        {searchQuery.trim() ? `Results (${filteredApps.length})` : 'All Apps'}
                    </span>
                </div>

                {/* App Grid */}
                <div className="app-drawer-grid">
                    {filteredApps.map((app, index) => renderAppItem(app, index, 'all'))}
                </div>
            </div>

            {/* Bottom Docked Close Button with Fade Scrim */}
            <div className="absolute bottom-0 left-0 right-0 pt-6 pb-7 bg-gradient-to-t from-[#0E0E14] via-[#0E0E14]/85 to-transparent flex justify-center items-center pointer-events-none z-20">
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close all apps"
                    className="pointer-events-auto w-12 h-12 bg-[#2B2930]/95 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/20 hover:bg-[#3A3842] active:scale-95 transition-all shadow-[0_8px_24px_rgba(0,0,0,0.6)]"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
