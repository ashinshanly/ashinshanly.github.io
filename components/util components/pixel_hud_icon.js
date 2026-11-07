import React from 'react';

export function PixelHudIcon(props = {}) {
    const isSidebar = props?.size === 'sidebar';
    const isModal = props?.size === 'modal';
    const isHeader = props?.size === 'header';
    const isAndroid = props?.size === 'android';

    const renderGuestBookSvg = (className, suffix = 'main') => (
        <svg
            viewBox="0 0 64 64"
            className={className}
            style={{ display: 'block', borderRadius: 'inherit' }}
            fill="none"
        >
            <defs>
                <linearGradient id={`guestBookBg-${suffix}`} x1="4" y1="4" x2="60" y2="60" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#1A103C" />
                    <stop offset="52%" stopColor="#0E0B20" />
                    <stop offset="100%" stopColor="#070510" />
                </linearGradient>
                <linearGradient id={`guestBookRim-${suffix}`} x1="4" y1="4" x2="60" y2="60" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.75" />
                    <stop offset="50%" stopColor="#F43F5E" stopOpacity="0.55" />
                    <stop offset="100%" stopColor="#FDE047" stopOpacity="0.65" />
                </linearGradient>
                <linearGradient id={`pageGrad-${suffix}`} x1="11" y1="11" x2="49" y2="51" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#1E1B3A" />
                    <stop offset="100%" stopColor="#121026" />
                </linearGradient>
                <linearGradient id="cyanGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="100%" stopColor="#00f0ff" />
                </linearGradient>
                <linearGradient id="pinkGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f43f5e" />
                    <stop offset="100%" stopColor="#ff007f" />
                </linearGradient>
                <linearGradient id="greenGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#34d399" />
                    <stop offset="100%" stopColor="#00ff66" />
                </linearGradient>
                <linearGradient id="yellowGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fde047" />
                    <stop offset="100%" stopColor="#f59e0b" />
                </linearGradient>
                <linearGradient id={`penBody-${suffix}`} x1="36" y1="36" x2="54" y2="18" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#38BDF8" />
                    <stop offset="55%" stopColor="#818CF8" />
                    <stop offset="100%" stopColor="#F43F5E" />
                </linearGradient>
            </defs>

            {/* Squircle Tile */}
            <rect x="2" y="2" width="60" height="60" rx="15" fill={`url(#guestBookBg-${suffix})`} />
            <rect x="2.75" y="2.75" width="58.5" height="58.5" rx="14.25" stroke={`url(#guestBookRim-${suffix})`} strokeWidth="1.5" />

            {/* Book Cover & Binding Rings */}
            <rect x="11" y="11" width="38" height="41" rx="5.5" fill={`url(#pageGrad-${suffix})`} stroke="#38BDF8" strokeOpacity="0.38" strokeWidth="1.1" />
            <g fill="#38BDF8">
                <rect x="8.5" y="16.5" width="4.8" height="2" rx="1" />
                <rect x="8.5" y="25.5" width="4.8" height="2" rx="1" />
                <rect x="8.5" y="34.5" width="4.8" height="2" rx="1" />
                <rect x="8.5" y="43.5" width="4.8" height="2" rx="1" />
            </g>

            {/* Pixel Art Heart / Mural Mosaic Inside GuestBook */}
            <g>
                {/* Row 1 */}
                <rect x="19" y="17" width="4.6" height="4.6" rx="1.1" fill="url(#pinkGlow)" />
                <rect x="24.4" y="17" width="4.6" height="4.6" rx="1.1" fill="url(#pinkGlow)" />
                <rect x="31.8" y="17" width="4.6" height="4.6" rx="1.1" fill="url(#cyanGlow)" />
                <rect x="37.2" y="17" width="4.6" height="4.6" rx="1.1" fill="url(#cyanGlow)" />

                {/* Row 2 */}
                <rect x="16.3" y="22.4" width="4.6" height="4.6" rx="1.1" fill="url(#pinkGlow)" />
                <rect x="21.7" y="22.4" width="4.6" height="4.6" rx="1.1" fill="url(#yellowGlow)" />
                <rect x="27.1" y="22.4" width="4.6" height="4.6" rx="1.1" fill="#FFFFFF" />
                <rect x="32.5" y="22.4" width="4.6" height="4.6" rx="1.1" fill="url(#greenGlow)" />
                <rect x="37.9" y="22.4" width="4.6" height="4.6" rx="1.1" fill="url(#cyanGlow)" />

                {/* Row 3 */}
                <rect x="19" y="27.8" width="4.6" height="4.6" rx="1.1" fill="url(#yellowGlow)" />
                <rect x="24.4" y="27.8" width="4.6" height="4.6" rx="1.1" fill="url(#pinkGlow)" />
                <rect x="29.8" y="27.8" width="4.6" height="4.6" rx="1.1" fill="url(#cyanGlow)" />
                <rect x="35.2" y="27.8" width="4.6" height="4.6" rx="1.1" fill="url(#greenGlow)" />

                {/* Row 4 */}
                <rect x="24.4" y="33.2" width="4.6" height="4.6" rx="1.1" fill="url(#greenGlow)" />
                <rect x="29.8" y="33.2" width="4.6" height="4.6" rx="1.1" fill="url(#yellowGlow)" />

                {/* Row 5 */}
                <rect x="27.1" y="38.6" width="4.6" height="4.6" rx="1.1" fill="url(#cyanGlow)" />
            </g>

            {/* Signature Wave Line */}
            <path
                d="M16.5 46.8 Q 21 44.5, 25.5 46.8 T 34.5 46.5"
                stroke="#67E8F9"
                strokeWidth="1.3"
                strokeLinecap="round"
                opacity="0.85"
            />

            {/* Glowing Neon Stylus Writing on the GuestBook */}
            <g transform="rotate(42 34.5 46.5)">
                <rect x="31.9" y="22" width="5.2" height="19.8" rx="2" fill={`url(#penBody-${suffix})`} stroke="#FFFFFF" strokeOpacity="0.65" strokeWidth="0.6" />
                <polygon points="31.9,41.2 37.1,41.2 34.5,46.5" fill="#FDE047" />
                <circle cx="34.5" cy="46.5" r="0.9" fill="#FFFFFF" />
            </g>
        </svg>
    );

    // Desktop workspace launcher: 32px icon + title below matching standard Ubuntu app icons
    if (!props?.size || props?.size === 'desktop') {
        return (
            <div className="relative w-full h-full flex flex-col items-center justify-start select-none group">
                <div className="w-8 h-8 mb-1 flex items-center justify-center">
                    {renderGuestBookSvg(
                        'w-8 h-8 rounded-[9px] overflow-hidden shadow-[0_2px_6px_rgba(0,0,0,0.4),0_0_8px_rgba(0,240,255,0.25)] transition-transform duration-300 group-hover:scale-105',
                        'desk'
                    )}
                </div>
                <span className="text-white text-xs font-normal tracking-tight text-center truncate max-w-full">
                    GuestBook
                </span>
            </div>
        );
    }

    const sizeClass = isModal
        ? "w-20 h-20 rounded-[20px]"
        : isHeader
        ? "w-10 h-10 rounded-[12px]"
        : isSidebar
        ? "w-full h-full rounded-[22%]"
        : isAndroid
        ? "w-[52px] h-[52px] rounded-[16px]"
        : "w-8 h-8 rounded-[9px]";

    return (
        <div
            className={`relative ${sizeClass} flex items-center justify-center select-none`}
            style={props.style || {}}
        >
            {renderGuestBookSvg(
                'w-full h-full overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.35),0_0_12px_rgba(0,240,255,0.2)]',
                props.size || 'icon'
            )}
        </div>
    );
}

export default PixelHudIcon;
