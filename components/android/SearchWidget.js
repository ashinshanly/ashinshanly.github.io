import React, { useState } from 'react';

export default function SearchWidget({ onSearch }) {
    const [query, setQuery] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (query.trim()) {
            // Open Google search in new tab
            window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
            setQuery('');
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className={`
                mx-4 mb-4 flex items-center gap-3 px-4 py-3
                bg-white/10 backdrop-blur-xl rounded-full
                border border-white/10
                transition-all duration-200
                ${isFocused ? 'bg-white/20 border-white/20' : ''}
            `}
        >
            {/* Google "G" logo */}
            <div className="w-6 h-6 flex items-center justify-center">
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
                placeholder="Search or type URL"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className="flex-grow bg-transparent text-white placeholder-white/50 outline-none text-base"
            />

            {/* Mic icon */}
            <button type="button" className="w-6 h-6 flex items-center justify-center">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" fill="#EA4335" />
                    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" fill="#4285F4" />
                </svg>
            </button>

            {/* Lens icon */}
            <button type="button" className="w-6 h-6 flex items-center justify-center">
                <svg className="w-5 h-5" viewBox="0 0 192 192" fill="none">
                    <rect x="42" y="42" width="40" height="40" rx="10" fill="#4285F4" />
                    <rect x="110" y="42" width="40" height="40" rx="20" fill="#EA4335" />
                    <rect x="42" y="110" width="40" height="40" rx="10" fill="#34A853" />
                    <rect x="110" y="110" width="40" height="40" rx="10" fill="#FBBC05" />
                </svg>
            </button>
        </form>
    );
}
