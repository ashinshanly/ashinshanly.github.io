import React, { useState, useMemo } from 'react';
import { showToast } from './AndroidToast';

const PORTFOLIO_SHORTCUTS = [
    { id: 'about-ashin', label: 'Projects & Research', subtitle: 'About Ashin • Deep Learning & CV', badge: 'Portfolio' },
    { id: 'about-ashin', label: 'Work Experience', subtitle: 'About Ashin • Software Engineering', badge: 'Portfolio' },
    { id: 'about-ashin', label: 'Technical Skills', subtitle: 'Python, C++, Spark, Distributed Systems', badge: 'Portfolio' },
    { id: 'pixel-hud', label: 'GuestBook Matrix', subtitle: '64×64 Collaborative Neon Canvas', badge: 'Interactive' },
    { id: 'terminal', label: 'Bash Terminal', subtitle: 'Run shell commands (ls, cd, code)', badge: 'System' },
    { id: 'gedit', label: 'Contact Ashin', subtitle: 'Send a direct message', badge: 'Contact' },
];

export default function SearchWidget({ apps = [], onOpenApp, onOpenOrby }) {
    const [query, setQuery] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    const matchingResults = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return [];

        const appMatches = apps
            .filter((app) => app.title.toLowerCase().includes(q) || app.id.toLowerCase().includes(q))
            .slice(0, 4)
            .map((app) => ({
                key: `app-${app.id}`,
                appId: app.id,
                title: app.title,
                subtitle: app.type === 'external' ? 'External Web App' : 'Installed App',
                icon: app.icon,
                badge: 'App',
            }));

        const shortcutMatches = PORTFOLIO_SHORTCUTS.filter(
            (item) =>
                item.label.toLowerCase().includes(q) ||
                item.subtitle.toLowerCase().includes(q)
        )
            .slice(0, 3)
            .map((item, idx) => ({
                key: `shortcut-${idx}`,
                appId: item.id,
                title: item.label,
                subtitle: item.subtitle,
                icon: './themes/Yaru/system/user-home.png',
                badge: item.badge,
            }));

        return [...appMatches, ...shortcutMatches].slice(0, 5);
    }, [query, apps]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const trimmed = query.trim();
        if (!trimmed) return;

        if (matchingResults.length > 0 && onOpenApp) {
            onOpenApp(matchingResults[0].appId);
            setQuery('');
            setIsFocused(false);
            return;
        }

        window.open(`https://www.google.com/search?q=${encodeURIComponent(trimmed)}`, '_blank');
        setQuery('');
        setIsFocused(false);
    };

    const handleSelectResult = (appId) => {
        if (onOpenApp) {
            onOpenApp(appId);
        }
        setQuery('');
        setIsFocused(false);
    };

    return (
        <div className="relative mx-4 mb-4 z-30">
            <form
                onSubmit={handleSubmit}
                className={`
                    flex items-center gap-3 px-4 py-3
                    bg-[#1E1C24]/85 backdrop-blur-2xl rounded-full
                    border transition-all duration-200
                    ${
                        isFocused
                            ? 'bg-[#282530]/95 border-[#A8C7FA]/60 shadow-[0_8px_28px_rgba(0,0,0,0.5)]'
                            : 'border-white/12 shadow-[0_4px_16px_rgba(0,0,0,0.3)]'
                    }
                `}
            >
                {/* Google "G" logo */}
                <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                    <svg viewBox="0 0 24 24" className="w-5 h-5">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                </div>

                {/* Search input */}
                <input
                    type="text"
                    placeholder="Search apps, projects, or web"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setTimeout(() => setIsFocused(false), 180)}
                    className="flex-grow bg-transparent text-white placeholder-[#CAC4D0]/70 outline-none text-sm font-normal min-w-0"
                />

                {query ? (
                    <button
                        type="button"
                        onClick={() => setQuery('')}
                        aria-label="Clear search"
                        className="w-6 h-6 rounded-full hover:bg-white/10 flex items-center justify-center text-white/70"
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                        </svg>
                    </button>
                ) : (
                    <div className="flex items-center gap-2.5 flex-shrink-0">
                        {/* Pixel Voice Search Icon (Launches Orby Voice AI) */}
                        <button
                            type="button"
                            onClick={() => {
                                if (onOpenOrby) {
                                    onOpenOrby();
                                } else if (typeof window !== 'undefined') {
                                    window.dispatchEvent(new CustomEvent('portfolio-open-orby'));
                                } else {
                                    showToast('Try typing "Projects", "Chess", or "Terminal"');
                                }
                            }}
                            aria-label="Voice search hint"
                            title="Talk to Orby — Voice AI Assistant"
                            className="w-6 h-6 flex items-center justify-center text-[#A8C7FA] hover:opacity-80 transition-opacity"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z" />
                            </svg>
                        </button>
                        {/* Pixel Lens Icon */}
                        <button
                            type="button"
                            onClick={() => onOpenApp && onOpenApp('about-ashin')}
                            aria-label="Quick open About Ashin"
                            className="w-6 h-6 flex items-center justify-center text-[#81C995] hover:opacity-80 transition-opacity"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 9c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3zm7-4h-3.17L14 3H10L8.17 5H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 14H5V7h4.05l1.83-2h2.24l1.83 2H19v12z" />
                            </svg>
                        </button>
                    </div>
                )}
            </form>

            {/* Instant Material You Search Results Dropdown */}
            {isFocused && query.trim().length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-[#1D1B22]/95 backdrop-blur-2xl rounded-[24px] border border-white/10 shadow-[0_16px_40px_rgba(0,0,0,0.75)] overflow-hidden py-2">
                    {matchingResults.map((item) => (
                        <button
                            key={item.key}
                            type="button"
                            onMouseDown={() => handleSelectResult(item.appId)}
                            onClick={() => handleSelectResult(item.appId)}
                            className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-white/10 active:bg-white/15 text-left transition-colors"
                        >
                            <img
                                src={item.icon}
                                alt={item.title}
                                className="w-7 h-7 rounded-lg object-contain flex-shrink-0"
                                onError={(e) => {
                                    e.target.src = './themes/Yaru/apps/bash.png';
                                }}
                            />
                            <div className="flex flex-col min-w-0 flex-grow">
                                <span className="text-xs font-semibold text-white truncate">{item.title}</span>
                                <span className="text-[11px] text-[#CAC4D0] truncate">{item.subtitle}</span>
                            </div>
                            <span className="px-2 py-0.5 rounded-full bg-[#A8C7FA]/15 text-[#A8C7FA] text-[10px] font-semibold">
                                {item.badge}
                            </span>
                        </button>
                    ))}

                    <button
                        type="button"
                        onMouseDown={handleSubmit}
                        onClick={handleSubmit}
                        className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-white/10 text-left border-t border-white/5 mt-1"
                    >
                        <div className="w-7 h-7 rounded-full bg-[#A8C7FA]/20 text-[#A8C7FA] flex items-center justify-center flex-shrink-0">
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                            </svg>
                        </div>
                        <span className="text-xs text-[#A8C7FA] font-medium truncate">
                            Search Google for &ldquo;{query.trim()}&rdquo;
                        </span>
                    </button>
                </div>
            )}
        </div>
    );
}
