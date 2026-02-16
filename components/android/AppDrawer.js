import React, { useState } from 'react';

export default function AppDrawer({ isOpen, onClose, apps, onOpenApp }) {
    const [searchQuery, setSearchQuery] = useState('');

    // Filter apps based on search
    const filteredApps = apps.filter(app =>
        app.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Handle app click
    const handleAppClick = (appId) => {
        onOpenApp(appId);
        setSearchQuery('');
    };

    return (
        <div className={`app-drawer ${isOpen ? 'open' : ''}`}>
            {/* Search Bar */}
            <div className="app-drawer-search">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                    type="text"
                    placeholder="Search apps"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                    <button
                        onClick={() => setSearchQuery('')}
                        className="p-1 rounded-full hover:bg-white/10"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                        </svg>
                    </button>
                )}
            </div>

            {/* App Grid */}
            <div className="app-drawer-grid">
                {filteredApps.map((app, index) => (
                    <div
                        key={app.id || index}
                        className="android-app-icon ripple"
                        onClick={() => handleAppClick(app.id)}
                    >
                        <img
                            src={app.icon}
                            alt={app.title}
                            onError={(e) => {
                                e.target.src = './themes/Yaru/apps/default.png';
                            }}
                        />
                        <span>{app.title}</span>
                    </div>
                ))}
            </div>

            {/* Close Button */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
                <button
                    onClick={onClose}
                    className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 hover:bg-white/20 active:scale-95 transition-all"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
