import React from 'react';

export function PixelHudIcon(props = {}) {
    const isSidebar = props?.size === 'sidebar';
    const isModal = props?.size === 'modal';
    const isHeader = props?.size === 'header';
    const isAndroid = props?.size === 'android';

    // Desktop workspace launcher: 32px icon + title below matching standard Ubuntu app icons
    if (!props?.size || props?.size === 'desktop') {
        return (
            <div className="relative w-full h-full flex flex-col items-center justify-start select-none">
                <div className="w-8 h-8 mb-1 flex items-center justify-center">
                    <svg
                        viewBox="0 0 52 52"
                        className="w-8 h-8 rounded-[9px] overflow-hidden shadow-[0_2px_6px_rgba(0,0,0,0.4),0_0_8px_rgba(0,240,255,0.25)]"
                        style={{ display: 'block' }}
                    >
                        <defs>
                            <linearGradient id="guestBookBgDesk" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#0d1527" />
                                <stop offset="50%" stopColor="#080d1a" />
                                <stop offset="100%" stopColor="#030712" />
                            </linearGradient>
                            <linearGradient id="cyanGlowDesk" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#38bdf8" />
                                <stop offset="100%" stopColor="#00f0ff" />
                            </linearGradient>
                            <linearGradient id="pinkGlowDesk" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#f43f5e" />
                                <stop offset="100%" stopColor="#ff007f" />
                            </linearGradient>
                            <linearGradient id="greenGlowDesk" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#34d399" />
                                <stop offset="100%" stopColor="#00ff66" />
                            </linearGradient>
                            <linearGradient id="yellowGlowDesk" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#fde047" />
                                <stop offset="100%" stopColor="#ffe600" />
                            </linearGradient>
                            <filter id="neonBlurDesk" x="-20%" y="-20%" width="140%" height="140%">
                                <feGaussianBlur stdDeviation="1" result="glow" />
                                <feComposite in="SourceGraphic" in2="glow" operator="over" />
                            </filter>
                        </defs>

                        {/* Background Tile */}
                        <rect width="52" height="52" rx="16" fill="url(#guestBookBgDesk)" />
                        <rect x="0.75" y="0.75" width="50.5" height="50.5" rx="15.25" fill="none" stroke="rgba(0, 240, 255, 0.45)" strokeWidth="1.5" />

                        {/* Matrix Crosshair Grid */}
                        <path d="M7 26 H45 M26 7 V45" stroke="rgba(0, 240, 255, 0.15)" strokeWidth="1" strokeDasharray="2 2" />

                        {/* 4-Sector Mural */}
                        <rect x="9.5" y="9.5" width="14" height="14" rx="3.5" fill="url(#cyanGlowDesk)" filter="url(#neonBlurDesk)" />
                        <rect x="28.5" y="9.5" width="14" height="14" rx="3.5" fill="url(#pinkGlowDesk)" filter="url(#neonBlurDesk)" />
                        <rect x="9.5" y="28.5" width="14" height="14" rx="3.5" fill="url(#greenGlowDesk)" filter="url(#neonBlurDesk)" />
                        <rect x="28.5" y="28.5" width="14" height="14" rx="3.5" fill="url(#yellowGlowDesk)" filter="url(#neonBlurDesk)" />

                        {/* Core */}
                        <rect x="23.5" y="23.5" width="5" height="5" rx="1.5" fill="#ffffff" filter="url(#neonBlurDesk)" />
                    </svg>
                </div>
                <span className="text-white text-xs font-normal tracking-tight text-center truncate max-w-full">GuestBook</span>
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
            <svg
                viewBox="0 0 52 52"
                className="w-full h-full overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.35),0_0_12px_rgba(0,240,255,0.2)]"
                style={{ display: 'block', borderRadius: 'inherit' }}
            >
                <defs>
                    <linearGradient id="guestBookBg" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#0d1527" />
                        <stop offset="50%" stopColor="#080d1a" />
                        <stop offset="100%" stopColor="#030712" />
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
                        <stop offset="100%" stopColor="#ffe600" />
                    </linearGradient>
                    <filter id="neonBlur" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="1" result="glow" />
                        <feComposite in="SourceGraphic" in2="glow" operator="over" />
                    </filter>
                </defs>

                {/* Background Tile */}
                <rect width="52" height="52" rx="16" fill="url(#guestBookBg)" />
                <rect x="0.75" y="0.75" width="50.5" height="50.5" rx="15.25" fill="none" stroke="rgba(0, 240, 255, 0.45)" strokeWidth="1.5" />

                {/* Subtle Matrix Crosshair Grid */}
                <path d="M7 26 H45 M26 7 V45" stroke="rgba(0, 240, 255, 0.15)" strokeWidth="1" strokeDasharray="2 2" />

                {/* 4-Sector Vibrant Glowing Pixel Mural */}
                {/* Sector Alpha: Cyan */}
                <rect x="9.5" y="9.5" width="14" height="14" rx="3.5" fill="url(#cyanGlow)" filter="url(#neonBlur)" />
                {/* Sector Beta: Neon Pink */}
                <rect x="28.5" y="9.5" width="14" height="14" rx="3.5" fill="url(#pinkGlow)" filter="url(#neonBlur)" />
                {/* Sector Gamma: Neon Green */}
                <rect x="9.5" y="28.5" width="14" height="14" rx="3.5" fill="url(#greenGlow)" filter="url(#neonBlur)" />
                {/* Sector Delta: Electric Yellow */}
                <rect x="28.5" y="28.5" width="14" height="14" rx="3.5" fill="url(#yellowGlow)" filter="url(#neonBlur)" />

                {/* Center Core Accent */}
                <rect x="23.5" y="23.5" width="5" height="5" rx="1.5" fill="#ffffff" filter="url(#neonBlur)" />
            </svg>
        </div>
    );
}

export default PixelHudIcon;
