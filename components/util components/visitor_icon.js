import React from 'react';

// Replaces legacy ./themes/Yaru/apps/illuminati.png with a Live Telemetry & Pulse Analytics SVG icon
export function VisitorIcon(props = {}) {
    const isSidebar = props?.size === 'sidebar';
    const isModal = props?.size === 'modal';
    const isHeader = props?.size === 'header';
    const isAndroid = props?.size === 'android';

    const renderTelemetrySvg = (className, suffix = 'main') => (
        <svg
            viewBox="0 0 64 64"
            className={className}
            style={{ display: 'block', borderRadius: 'inherit' }}
            fill="none"
        >
            <defs>
                <linearGradient id={`vsBg-${suffix}`} x1="6" y1="4" x2="58" y2="60" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#0F1C36" />
                    <stop offset="52%" stopColor="#091224" />
                    <stop offset="100%" stopColor="#050913" />
                </linearGradient>
                <linearGradient id={`vsRim-${suffix}`} x1="4" y1="4" x2="60" y2="60" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.75" />
                    <stop offset="50%" stopColor="#34D399" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#818CF8" stopOpacity="0.65" />
                </linearGradient>
                <linearGradient id={`vsBar1-${suffix}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#A5B4FC" />
                    <stop offset="100%" stopColor="#4F46E5" />
                </linearGradient>
                <linearGradient id={`vsBar2-${suffix}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#67E8F9" />
                    <stop offset="100%" stopColor="#0284C7" />
                </linearGradient>
                <linearGradient id={`vsBar3-${suffix}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6EE7B7" />
                    <stop offset="100%" stopColor="#059669" />
                </linearGradient>
                <linearGradient id={`vsBar4-${suffix}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FDE68A" />
                    <stop offset="38%" stopColor="#34D399" />
                    <stop offset="100%" stopColor="#0D9488" />
                </linearGradient>
                <linearGradient id={`vsLine-${suffix}`} x1="12" y1="38" x2="50" y2="16" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#818CF8" />
                    <stop offset="50%" stopColor="#38BDF8" />
                    <stop offset="100%" stopColor="#34D399" />
                </linearGradient>
            </defs>

            {/* Squircle Tile */}
            <rect x="2" y="2" width="60" height="60" rx="15" fill={`url(#vsBg-${suffix})`} />
            <rect x="2.75" y="2.75" width="58.5" height="58.5" rx="14.25" stroke={`url(#vsRim-${suffix})`} strokeWidth="1.5" />

            {/* Subtle Telemetry Grid */}
            <g opacity="0.2" stroke="#38BDF8" strokeWidth="0.75" strokeDasharray="2 2">
                <line x1="10" y1="20" x2="54" y2="20" />
                <line x1="10" y1="31" x2="54" y2="31" />
                <line x1="10" y1="42" x2="54" y2="42" />
            </g>

            {/* Top Live Status Pill */}
            <rect x="10" y="9.5" width="19" height="6" rx="3" fill="#0F292A" stroke="#10B981" strokeOpacity="0.55" strokeWidth="0.8" />
            <circle cx="13.5" cy="12.5" r="1.4" fill="#34D399" />
            <rect x="17" y="11.6" width="9" height="1.8" rx="0.9" fill="#A7F3D0" fillOpacity="0.9" />

            {/* 4 Ascending Telemetry Bars */}
            <rect x="11" y="39" width="7.5" height="13" rx="2.2" fill={`url(#vsBar1-${suffix})`} />
            <rect x="21.5" y="32" width="7.5" height="20" rx="2.2" fill={`url(#vsBar2-${suffix})`} />
            <rect x="32" y="25" width="7.5" height="27" rx="2.2" fill={`url(#vsBar3-${suffix})`} />
            <rect x="42.5" y="18" width="7.5" height="34" rx="2.2" fill={`url(#vsBar4-${suffix})`} />

            {/* Glowing Trend Spline */}
            <path
                d="M14.7 35 C 19 34, 22 27.5, 25.2 26.8 C 29 26, 32.5 21.5, 35.7 20 C 39.5 18.2, 43 14.5, 46.2 13"
                stroke={`url(#vsLine-${suffix})`}
                strokeWidth="2.2"
                strokeLinecap="round"
                fill="none"
            />

            {/* Curve Nodes & Live Beacon */}
            <circle cx="14.7" cy="35" r="1.7" fill="#091224" stroke="#A5B4FC" strokeWidth="1.2" />
            <circle cx="25.2" cy="26.8" r="1.7" fill="#091224" stroke="#67E8F9" strokeWidth="1.2" />
            <circle cx="35.7" cy="20" r="1.7" fill="#091224" stroke="#6EE7B7" strokeWidth="1.2" />
            <circle cx="46.2" cy="13" r="3.8" fill="#10B981" fillOpacity="0.32" />
            <circle cx="46.2" cy="13" r="2.1" fill="#FFFFFF" stroke="#34D399" strokeWidth="1.2" />
        </svg>
    );

    // Desktop workspace launcher: 32px icon + title below matching standard Ubuntu app icons
    if (!props?.size || props?.size === 'desktop') {
        return (
            <div className="relative w-full h-full flex flex-col items-center justify-start select-none group">
                <div className="relative w-8 h-8 mb-1 flex items-center justify-center">
                    <div className="absolute inset-0 bg-blue-500 rounded-full blur-md opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                    {renderTelemetrySvg(
                        'w-8 h-8 rounded-[9px] overflow-hidden shadow-[0_2px_6px_rgba(0,0,0,0.45),0_0_10px_rgba(16,185,129,0.22)] transition-transform duration-300 group-hover:scale-105',
                        'desk'
                    )}
                </div>
                <span className="text-white text-xs font-normal tracking-tight text-center truncate max-w-full">
                    Visitor Stats
                </span>
            </div>
        );
    }

    const sizeClass = isModal
        ? 'w-20 h-20 rounded-[20px]'
        : isHeader
        ? 'w-10 h-10 rounded-[12px]'
        : isSidebar
        ? 'w-full h-full rounded-[22%]'
        : isAndroid
        ? 'w-[52px] h-[52px] rounded-[16px]'
        : 'w-8 h-8 rounded-[9px]';

    return (
        <div
            className={`relative ${sizeClass} flex items-center justify-center select-none group`}
            style={props.style || {}}
        >
            <div className="absolute inset-0 bg-blue-500 rounded-full blur-md opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
            {renderTelemetrySvg(
                'w-full h-full overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.38),0_0_12px_rgba(16,185,129,0.22)]',
                props.size || 'icon'
            )}
        </div>
    );
}

export default VisitorIcon;
