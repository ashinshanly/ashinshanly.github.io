import React, { useEffect } from 'react';
import Clock from '../util components/clock';

export default function LockScreen(props) {
    const wallpapers = {
        "wall-1": "./images/wallpapers/wall-1.webp",
        "wall-2": "./images/wallpapers/wall-2.webp",
        "wall-3": "./images/wallpapers/wall-3.webp",
        "wall-4": "./images/wallpapers/wall-4.webp",
        "wall-5": "./images/wallpapers/wall-5.webp",
        "wall-6": "./images/wallpapers/wall-6.webp",
        "wall-7": "./images/wallpapers/wall-7.webp",
        "wall-8": "./images/wallpapers/wall-8.webp",
    };

    useEffect(() => {
        if (props.isLocked) {
            window.addEventListener('click', props.unLockScreen);
            window.addEventListener('keypress', props.unLockScreen);
        }
        return () => {
            window.removeEventListener('click', props.unLockScreen);
            window.removeEventListener('keypress', props.unLockScreen);
        };
    }, [props.isLocked, props.unLockScreen]);

    const renderBackground = () => {
        if (props.bgImgName === "video") {
            return (
                <video
                    className="absolute top-0 left-0 w-full h-full object-cover z-20 blur-md scale-105"
                    autoPlay
                    loop
                    muted
                    playsInline
                >
                    <source src="/images/wallpapers/nebula-live-video.mp4" type="video/mp4" />
                </video>
            );
        } else if (props.bgImgName === "animated") {
            return <div className="absolute top-0 left-0 w-full h-full z-20 blur-md bg-gradient-to-b from-indigo-900 to-purple-900" />;
        } else {
            const bgUrl = wallpapers[props.bgImgName] || wallpapers["wall-2"];
            return (
                <div
                    style={{
                        backgroundImage: `url(${bgUrl})`,
                        backgroundSize: "cover",
                        backgroundRepeat: "no-repeat",
                        backgroundPositionX: "center"
                    }}
                    className="absolute top-0 left-0 w-full h-full transform z-20 blur-md scale-105"
                />
            );
        }
    };

    return (
        <div
            id="ubuntu-lock-screen"
            style={{ zIndex: "100" }}
            className={
                (props.isLocked ? " visible translate-y-0 " : " invisible -translate-y-full ") +
                " absolute outline-none bg-black bg-opacity-90 transform duration-500 select-none top-0 right-0 overflow-hidden m-0 p-0 h-screen w-screen"
            }
        >
            {renderBackground()}
            <div className="absolute inset-0 z-30 bg-gradient-to-b from-black/40 via-black/55 to-black/80" />

            <div className="w-full h-full z-50 overflow-hidden relative flex flex-col justify-between items-center py-16 text-white">
                {/* Top Clock & Date */}
                <div className="flex flex-col items-center mt-6">
                    <div className="text-7xl font-light tracking-tight drop-shadow-lg">
                        <Clock onlyTime={true} />
                    </div>
                    <div className="mt-3 text-lg font-medium text-cyan-200/90 tracking-wide">
                        <Clock onlyDay={true} />
                    </div>
                </div>

                {/* Center GDM User Avatar Card with Ubuntu Circle of Friends SVG Profile Picture */}
                <div className="flex flex-col items-center gap-3 p-6 rounded-3xl bg-white/[0.06] backdrop-blur-2xl border border-white/15 shadow-2xl">
                    <div className="w-20 h-20 rounded-full p-1 bg-white/10 ring-2 ring-[#E95420]/60 shadow-[0_0_24px_rgba(233,84,32,0.35)] flex items-center justify-center">
                        <svg
                            viewBox="0 0 100 100"
                            className="w-full h-full rounded-full"
                            role="img"
                            aria-label="Ubuntu Logo Profile Picture"
                        >
                            <defs>
                                <linearGradient id="ubuntuLockAvatarGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                                    <stop offset="0%" stopColor="#E95420" />
                                    <stop offset="65%" stopColor="#C7432B" />
                                    <stop offset="100%" stopColor="#77216F" />
                                </linearGradient>
                                <mask id="ubuntuLockFriendsMask">
                                    <rect width="100" height="100" fill="white" />
                                    <circle cx="50" cy="50" r="14.5" fill="black" />
                                    <line x1="50" y1="50" x2="88" y2="50" stroke="black" strokeWidth="4" />
                                    <line x1="50" y1="50" x2="31" y2="17.1" stroke="black" strokeWidth="4" />
                                    <line x1="50" y1="50" x2="31" y2="82.9" stroke="black" strokeWidth="4" />
                                    <circle cx="21" cy="50" r="8.8" fill="black" />
                                    <circle cx="64.5" cy="24.9" r="8.8" fill="black" />
                                    <circle cx="64.5" cy="75.1" r="8.8" fill="black" />
                                </mask>
                            </defs>
                            <circle cx="50" cy="50" r="48" fill="url(#ubuntuLockAvatarGrad)" />
                            <circle cx="50" cy="50" r="24" fill="white" mask="url(#ubuntuLockFriendsMask)" />
                            <circle cx="21" cy="50" r="5.6" fill="white" />
                            <circle cx="64.5" cy="24.9" r="5.6" fill="white" />
                            <circle cx="64.5" cy="75.1" r="5.6" fill="white" />
                        </svg>
                    </div>
                    <div className="text-center">
                        <div className="text-base font-semibold text-white">Ashin Shanly</div>
                        <div className="text-xs text-white/60">Ubuntu 24.04 LTS • GNOME 46</div>
                    </div>
                    <button
                        type="button"
                        onClick={props.unLockScreen}
                        className="mt-1 px-5 py-2 rounded-full bg-[#E95420] hover:bg-[#f26330] text-white font-semibold text-xs tracking-wide transition shadow-[0_0_16px_rgba(233,84,32,0.5)] cursor-pointer"
                    >
                        Unlock Workspace
                    </button>
                </div>

                {/* Bottom Hint */}
                <div className="text-xs text-white/60 tracking-wider uppercase">
                    Click anywhere or press any key to unlock
                </div>
            </div>
        </div>
    );
}
