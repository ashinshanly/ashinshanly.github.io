import React, { useState, useEffect, useRef } from 'react';
import apps from '../../apps.config';
import AndroidStatusBar from './AndroidStatusBar';
import AppDrawer from './AppDrawer';
import GestureNavBar from './GestureNavBar';
import NotificationPanel from './NotificationPanel';
import AndroidApp from './AndroidApp';
import SearchWidget from './SearchWidget';
import AppContextMenu from './AppContextMenu';
import BackgroundImage from '../util components/background-image';
import MusicWidget from './MusicWidget';
import WeatherWidget from './WeatherWidget';
import AndroidToast, { showToast } from './AndroidToast';
import LockScreen from './LockScreen';
import useWeather from '../util components/useWeather';
import OrbyAssistant, { OrbyFloatingLauncher } from '../util components/orby_assistant';

const MATERIAL_THEMES = [
    { id: 'blue', name: 'Pixel Blue', primary: '#A8C7FA', wall: 'wall-2' },
    { id: 'mint', name: 'Emerald Mint', primary: '#81C995', wall: 'wall-4' },
    { id: 'violet', name: 'Cosmic Violet', primary: '#D0BCFF', wall: 'wall-1' },
    { id: 'coral', name: 'Sunset Coral', primary: '#FFB4AB', wall: 'wall-6' },
];

export default function AndroidHome() {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [notificationOpen, setNotificationOpen] = useState(false);
    const [recentsOpen, setRecentsOpen] = useState(false);
    const [styleSheetOpen, setStyleSheetOpen] = useState(false);
    const [recentAppIds, setRecentAppIds] = useState(['about-ashin', 'terminal', 'vscode']);
    const [themeId, setThemeId] = useState('blue');
    const [openApp, setOpenApp] = useState(null);
    const [closingApp, setClosingApp] = useState(false);
    const [bgImage, setBgImage] = useState('wall-2');
    const [contextMenu, setContextMenu] = useState({ app: null, position: null });
    const [page, setPage] = useState(0);
    const [swipeX, setSwipeX] = useState(0); // Track real-time swipe position
    const [hiddenApps, setHiddenApps] = useState([]); // Support uninstalling simulation
    const [brightness, setBrightness] = useState(100); // Brightness state
    const [isLocked, setIsLocked] = useState(true);
    const [tilt, setTilt] = useState({ x: 0, y: 0 });
    const [wifiOn, setWifiOn] = useState(true);
    const [btOn, setBtOn] = useState(true);
    const [dndOn, setDndOn] = useState(false);
    const [notificationCount, setNotificationCount] = useState(3);
    const [orbyOpen, setOrbyOpen] = useState(false);
    const { weather } = useWeather();

    const touchStartY = useRef(0);
    const touchStartX = useRef(0);
    const longPressTimer = useRef(null);
    const homeRef = useRef(null);

    // Update time every minute + listen for global Orby voice assistant open events
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        const handleOpenOrby = () => setOrbyOpen(true);
        window.addEventListener('portfolio-open-orby', handleOpenOrby);
        return () => {
            clearInterval(timer);
            window.removeEventListener('portfolio-open-orby', handleOpenOrby);
        };
    }, []);

    // Gyroscope Parallax Logic
    useEffect(() => {
        const handleOrientation = (e) => {
            // beta is front-to-back tilt in degrees, where front is positive (-180 to 180)
            // gamma is left-to-right tilt in degrees, where right is positive (-90 to 90)

            let x = 0;
            let y = 0;

            // Constrain the values to avoid extreme movement
            // When device is flat on table, beta/gamma are close to 0
            if (e.gamma !== null && e.beta !== null) {
                // Map a 45 degree tilt to about 25px translation
                x = Math.max(-25, Math.min(25, (e.gamma / 45) * 25));

                // For beta, standard viewing angle is around 45 degrees, so let's normalize around that
                const normalizedBeta = e.beta - 45;
                y = Math.max(-25, Math.min(25, (normalizedBeta / 45) * 25));

                setTilt({ x: -x, y: -y }); // Invert so wallpaper moves opposite to direction of tilt
            }
        };

        if (window.DeviceOrientationEvent && typeof window.DeviceOrientationEvent.requestPermission === 'function') {
            // iOS 13+ requires explicit permission, but we skip requesting it automatically 
            // to avoid confusing popups. It'll just silently fail or work if already granted.
        }

        window.addEventListener('deviceorientation', handleOrientation);
        return () => window.removeEventListener('deviceorientation', handleOrientation);
    }, []);

    const vibrate = () => {
        if (navigator.vibrate) navigator.vibrate(10);
    };

    const handleMouseMove = (e) => {
        if (!homeRef.current) return;
        const x = (window.innerWidth - e.pageX * 2) / 100;
        const y = (window.innerHeight - e.pageY * 2) / 100;

        const wallpaper = document.getElementById("android-wallpaper");
        if (wallpaper) {
            // Apply both mouse parallax (for desktop) and gyro parallax (for mobile)
            wallpaper.style.transform = `scale(1.1) translate(${x + tilt.x}px, ${y + tilt.y}px)`;
        }
    };

    // Apply gyro parallax even when mouse isn't moving
    useEffect(() => {
        const wallpaper = document.getElementById("android-wallpaper");
        if (wallpaper) {
            wallpaper.style.transform = `scale(1.1) translate(${tilt.x}px, ${tilt.y}px)`;
        }
    }, [tilt]);

    // Filter apps based on hidden state (simulated uninstall)
    const activeApps = apps.filter(app => !hiddenApps.includes(app.id) && !app.disabled);
    const dockAppIds = ['chrome', 'terminal', 'vscode', 'spotify'];
    const dockApps = dockAppIds.map(id => activeApps.find(a => a.id === id)).filter(Boolean);
    const nonDockApps = activeApps.filter(app => !dockAppIds.includes(app.id));
    
    // Screen 1: Top 8 non-dock favorite apps
    const homeApps = nonDockApps.filter(app => app.favourite && app.id !== 'pixel-hud').slice(0, 8);
    const homeAppIds = homeApps.map(a => a.id);

    // Screen 3: GuestBook + remaining active apps
    const screen3Apps = nonDockApps.filter(app => !homeAppIds.includes(app.id));

    const handleUninstall = (appId) => {
        setHiddenApps(prev => [...prev, appId]);
    };

    const formatDate = () => {
        const options = { weekday: 'long', month: 'long', day: 'numeric' };
        return currentTime.toLocaleDateString('en-US', options);
    };

    const formatTime = () => {
        return currentTime.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        }).replace(' ', '');
    };

    const handleTouchStart = (e) => {
        touchStartY.current = e.touches[0].clientY;
        touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e) => {
        if (drawerOpen || notificationOpen || isLocked || contextMenu.app) return;
        const currentX = e.touches[0].clientX;
        const currentY = e.touches[0].clientY;
        const deltaX = currentX - touchStartX.current;
        const deltaY = currentY - touchStartY.current;

        // If mostly scrolling vertically, ignore horizontal swipe
        if (Math.abs(deltaY) > Math.abs(deltaX)) return;

        // Resistance on boundaries: page 0 swiping right (deltaX > 0) or page 2 swiping left (deltaX < 0)
        if ((page === 0 && deltaX > 0) || (page === 2 && deltaX < 0)) {
            setSwipeX(deltaX * 0.2);
        } else {
            setSwipeX(deltaX);
        }
    };

    const handleTouchEnd = (e) => {
        const touchEndY = e.changedTouches[0].clientY;
        const touchEndX = e.changedTouches[0].clientX;
        const deltaY = touchStartY.current - touchEndY;
        const deltaX = touchStartX.current - touchEndX;

        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }

        if (deltaY < -80 && touchStartY.current < 100 && !drawerOpen) {
            vibrate();
            setNotificationOpen(true);
        }

        const screenWidth = window.innerWidth;
        const swipeThreshold = screenWidth * 0.15; // 15% of screen width to register turn

        if (Math.abs(swipeX) > swipeThreshold && Math.abs(deltaY) < 50) {
            if (swipeX < 0 && page < 2) {
                setPage((prev) => Math.min(2, prev + 1));
                vibrate();
            } else if (swipeX > 0 && page > 0) {
                setPage((prev) => Math.max(0, prev - 1));
                vibrate();
            }
        }
        setSwipeX(0); // reset swipe distance on release for animating snap
    };

    const appTouchStartPos = useRef({ x: 0, y: 0 });
    const isAppLongPress = useRef(false);

    const handleAppTouchStart = (e, app) => {
        if (e.touches && e.touches.length > 0) {
            appTouchStartPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        } else if (e.clientX !== undefined) {
            appTouchStartPos.current = { x: e.clientX, y: e.clientY };
        }
        isAppLongPress.current = false;
        longPressApp(e, app);
    };

    const longPressApp = (e, app) => {
        longPressTimer.current = setTimeout(() => {
            isAppLongPress.current = true;
            vibrate();
            const touch = e.touches ? e.touches[0] : e;
            setContextMenu({
                app: app,
                position: { x: touch.clientX, y: touch.clientY }
            });
        }, 500);
    };

    const handleAppTouchEnd = (e, app) => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }

        if (e && e.type === 'touchend' && e.changedTouches && e.changedTouches.length > 0) {
            const touch = e.changedTouches[0];
            const distance = Math.sqrt(
                Math.pow(touch.clientX - appTouchStartPos.current.x, 2) +
                Math.pow(touch.clientY - appTouchStartPos.current.y, 2)
            );

            if (distance < 15 && !isAppLongPress.current && !contextMenu.app) {
                handleOpenApp(app.id);
                if (e.cancelable) e.preventDefault();
            }
        }
    };

    const lastOpenedTime = useRef(0);

    const handleOpenApp = (appId) => {
        const now = Date.now();
        if (now - lastOpenedTime.current < 500) return;
        lastOpenedTime.current = now;

        if (contextMenu.app) return;

        const app = apps.find(a => a.id === appId);
        if (app) {
            vibrate();
            if (app.type === "external" && app.url) {
                window.open(app.url, "_blank");
                return;
            }
            setRecentAppIds(prev => [app.id, ...prev.filter(id => id !== app.id)].slice(0, 6));
            setOpenApp(app);
            setDrawerOpen(false);
            setRecentsOpen(false);
        }
    };

    const handleCloseApp = () => {
        setClosingApp(true);
        vibrate();
        setTimeout(() => {
            setOpenApp(null);
            setClosingApp(false);
        }, 300);
    };

    const closeDrawer = () => setDrawerOpen(false);
    const closeNotifications = () => setNotificationOpen(false);
    const closeContextMenu = () => setContextMenu({ app: null, position: null });

    const renderAppIcon = (app, index, inDock = false) => {
        const CustomIcon = app.custom_icon;
        return (
            <div
                key={app.id || index}
                className="android-app-icon ripple"
                onClick={() => handleOpenApp(app.id)}
                onTouchStart={(e) => handleAppTouchStart(e, app)}
                onMouseDown={(e) => handleAppTouchStart(e, app)}
                onMouseUp={(e) => handleAppTouchEnd(e, app)}
                onTouchEnd={(e) => handleAppTouchEnd(e, app)}
                onTouchMove={() => {
                    if (longPressTimer.current) {
                        clearTimeout(longPressTimer.current);
                        longPressTimer.current = null;
                    }
                }}
                onContextMenu={(e) => {
                    e.preventDefault();
                }}
            >
                {CustomIcon ? (
                    <div className={`flex items-center justify-center ${inDock ? 'w-[clamp(36px,12vw,48px)] h-[clamp(36px,12vw,48px)]' : 'w-[52px] h-[52px] mb-2'}`}>
                        <CustomIcon size="sidebar" />
                    </div>
                ) : (
                    <img
                        src={app.icon}
                        alt={app.title}
                        draggable={false}
                        onError={(e) => {
                            e.target.src = './themes/Yaru/apps/bash.png';
                        }}
                    />
                )}
                {!inDock && <span>{app.title}</span>}
            </div>
        );
    };

    return (
        <div
            className="android-container overflow-hidden"
            ref={homeRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseMove={handleMouseMove}
            style={{ filter: `brightness(${brightness}%)` }} // Apply brightness
        >
            <div id="android-wallpaper" className={`absolute inset-0 z-0 ${tilt.x !== 0 ? 'wallpaper-transition' : 'transition-transform duration-100 ease-out'}`}>
                <BackgroundImage img={bgImage} />
            </div>

            <LockScreen
                isLocked={isLocked}
                onUnlock={() => {
                    setIsLocked(false);
                    vibrate();
                }}
                time={currentTime}
            />

            <AndroidToast />

            <AndroidStatusBar
                time={currentTime}
                onPullDown={() => {
                    vibrate();
                    setNotificationOpen(true);
                }}
                hasNotifications={notificationCount > 0}
                notificationCount={notificationCount}
                wifiOn={wifiOn}
                btOn={btOn}
                dndOn={dndOn}
            />

            {/* Screen 1: Page 0 (Main Home) */}
            <div
                className={`absolute top-[var(--android-status-bar-height,36px)] bottom-0 left-0 right-0 z-10 pt-2 pb-[130px] px-2 overflow-y-auto ${swipeX === 0 ? 'transition-transform duration-300 ease-out' : ''}`}
                style={{
                    transform: `translateX(calc(${(0 - page) * 100}% + ${swipeX}px))`,
                    pointerEvents: page === 0 ? 'auto' : 'none',
                    visibility: Math.abs(page - 0) > 1 && swipeX === 0 ? 'hidden' : 'visible',
                }}
            >
                <div className="at-a-glance">
                    <div className="flex items-center justify-between w-full mb-1">
                        <div className="at-a-glance-date">{formatDate()}</div>
                        <div className="flex items-center gap-1.5 text-white/80 text-sm">
                            <span>{weather ? `${weather.emoji} ${weather.temp}°` : '☀️ 24°'}</span>
                        </div>
                    </div>
                    <div className="at-a-glance-time">{formatTime()}</div>
                </div>

                <SearchWidget
                    apps={activeApps}
                    onOpenApp={handleOpenApp}
                    onOpenOrby={() => setOrbyOpen(true)}
                />

                <div className="flex justify-center mb-3 px-4">
                    <OrbyFloatingLauncher
                        onClick={() => setOrbyOpen(true)}
                        label="Talk to Orby — Ashin's Voice AI"
                    />
                </div>

                <div className="android-app-grid">
                    {homeApps.map((app, index) => renderAppIcon(app, index))}
                </div>
            </div>

            {/* Screen 2: Page 1 (Widgets Screen) */}
            <div
                className={`absolute top-[var(--android-status-bar-height,36px)] bottom-0 left-0 right-0 z-10 pt-5 pb-[130px] px-6 flex flex-col gap-5 overflow-y-auto ${swipeX === 0 ? 'transition-transform duration-300 ease-out' : ''}`}
                style={{
                    transform: `translateX(calc(${(1 - page) * 100}% + ${swipeX}px))`,
                    pointerEvents: page === 1 ? 'auto' : 'none',
                    visibility: Math.abs(page - 1) > 1 && swipeX === 0 ? 'hidden' : 'visible',
                }}
            >
                <div className="mb-2">
                    <WeatherWidget />
                </div>
                <MusicWidget />
            </div>

            {/* Screen 3: Page 2 (More Apps Screen) */}
            <div
                className={`absolute top-[var(--android-status-bar-height,36px)] bottom-0 left-0 right-0 z-10 pt-4 pb-[130px] px-2 flex flex-col overflow-y-auto ${swipeX === 0 ? 'transition-transform duration-300 ease-out' : ''}`}
                style={{
                    transform: `translateX(calc(${(2 - page) * 100}% + ${swipeX}px))`,
                    pointerEvents: page === 2 ? 'auto' : 'none',
                    visibility: Math.abs(page - 2) > 1 && swipeX === 0 ? 'hidden' : 'visible',
                }}
            >
                <div className="px-4 pt-2 pb-1 flex items-center justify-between">
                    <h2 className="text-white/90 text-sm font-semibold tracking-wider uppercase">More Apps</h2>
                    <span className="text-white/40 text-xs">{screen3Apps.length} apps</span>
                </div>
                <div className="android-app-grid">
                    {screen3Apps.map((app, index) => renderAppIcon(app, index))}
                </div>
            </div>

            {/* Persistent Dock & 3-Dot Pagination */}
            <div className="absolute bottom-[24px] left-0 right-0 z-20 w-full flex flex-col items-center">
                <div className="flex justify-center items-center gap-2 mb-3">
                    {[0, 1, 2].map((dotIndex) => (
                        <button
                            key={dotIndex}
                            type="button"
                            aria-label={`Go to screen ${dotIndex + 1}`}
                            className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                                page === dotIndex
                                    ? 'w-4 bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]'
                                    : 'w-1.5 bg-white/30'
                            }`}
                            onClick={() => {
                                setPage(dotIndex);
                                vibrate();
                            }}
                        />
                    ))}
                </div>

                <div className="android-dock w-[calc(100%-32px)]">
                    {dockApps.slice(0, 2).map((app, index) => renderAppIcon(app, index, true))}
                    <div
                        className="android-app-icon ripple"
                        onClick={() => {
                            vibrate();
                            setDrawerOpen(true);
                        }}
                    >
                        <img width="32" height="32" src="./themes/Yaru/system/view-app-grid-symbolic.svg" alt="All Apps" />
                    </div>
                    {dockApps.slice(2, 4).map((app, index) => renderAppIcon(app, index + 2, true))}
                </div>
            </div>

            <GestureNavBar
                onSwipeUp={() => {
                    vibrate();
                    setDrawerOpen(false);
                    setNotificationOpen(false);
                    setRecentsOpen(prev => !prev);
                }}
                onHome={() => {
                    handleCloseApp();
                    setDrawerOpen(false);
                    setNotificationOpen(false);
                    setRecentsOpen(false);
                    setStyleSheetOpen(false);
                    setContextMenu({ app: null, position: null });
                    setPage(0);
                    vibrate();
                }}
            />

            {/* Android 14 Recents / Multitasking Carousel */}
            {recentsOpen && (
                <div
                    className="fixed top-[var(--android-status-bar-height,36px)] bottom-0 left-0 right-0 z-[200] bg-black/80 backdrop-blur-2xl flex flex-col justify-between pt-5 pb-10 px-5 animate-fade-in"
                    onClick={() => setRecentsOpen(false)}
                >
                    <div className="flex items-center justify-between px-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-[#CAC4D0]">
                            Recent Apps ({recentAppIds.length})
                        </span>
                        {recentAppIds.length > 0 && (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setRecentAppIds([]);
                                    handleCloseApp();
                                    setRecentsOpen(false);
                                    showToast('Cleared all recent apps');
                                }}
                                className="px-3.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-[#A8C7FA] text-xs font-semibold transition-all"
                            >
                                Clear all
                            </button>
                        )}
                    </div>

                    {/* Horizontal Card Deck */}
                    <div
                        className="flex items-center gap-4 overflow-x-auto py-4 px-2 scrollbar-hide"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {recentAppIds.length === 0 ? (
                            <div className="w-full py-20 text-center text-white/60 text-sm">
                                No recent items
                            </div>
                        ) : (
                            recentAppIds.map((id) => {
                                const recentApp = apps.find((a) => a.id === id);
                                if (!recentApp) return null;
                                return (
                                    <div
                                        key={recentApp.id}
                                        onClick={() => handleOpenApp(recentApp.id)}
                                        className="flex-shrink-0 w-[230px] h-[360px] rounded-[28px] bg-[#211F26]/95 border border-white/15 shadow-2xl flex flex-col overflow-hidden cursor-pointer active:scale-[0.98] transition-transform"
                                    >
                                        {/* App Header inside Recents Card */}
                                        <div className="px-4 py-3 flex items-center justify-between bg-[#2B2930]">
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <img
                                                    src={recentApp.icon}
                                                    alt={recentApp.title}
                                                    className="w-5 h-5 rounded-md object-contain"
                                                    onError={(e) => {
                                                        e.target.src = './themes/Yaru/apps/bash.png';
                                                    }}
                                                />
                                                <span className="text-xs font-semibold text-white truncate">
                                                    {recentApp.title}
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                aria-label={`Close ${recentApp.title}`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setRecentAppIds((prev) => prev.filter((item) => item !== recentApp.id));
                                                    if (openApp && openApp.id === recentApp.id) {
                                                        handleCloseApp();
                                                    }
                                                }}
                                                className="w-6 h-6 rounded-full hover:bg-white/15 flex items-center justify-center text-white/60 hover:text-white"
                                            >
                                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                                                </svg>
                                            </button>
                                        </div>

                                        {/* Live Stylized Preview Surface */}
                                        <div className="flex-1 p-4 flex flex-col justify-between bg-gradient-to-br from-[#1A1822] via-[#141318] to-[#252232]">
                                            <div className="space-y-2">
                                                <div className="h-2.5 w-2/3 rounded-full bg-white/15" />
                                                <div className="h-2 w-1/2 rounded-full bg-white/10" />
                                                <div className="mt-4 p-3 rounded-2xl bg-white/[0.04] border border-white/5 flex items-center justify-center h-36">
                                                    <img
                                                        src={recentApp.icon}
                                                        alt={recentApp.title}
                                                        className="w-14 h-14 object-contain opacity-90 drop-shadow-lg"
                                                        onError={(e) => {
                                                            e.target.src = './themes/Yaru/apps/bash.png';
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between text-[11px] text-[#A8C7FA] font-medium">
                                                <span>Tap to resume</span>
                                                <span>Active</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Android 14 Recents Bottom Action Bar */}
                    <div
                        className="flex items-center justify-center gap-3 pt-2"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={() => {
                                showToast('Screenshot saved to gallery');
                                setRecentsOpen(false);
                            }}
                            className="px-4 py-2.5 rounded-full bg-[#2B2930] hover:bg-[#383540] border border-white/10 text-xs font-semibold text-white flex items-center gap-2 active:scale-95 transition-all"
                        >
                            <svg className="w-4 h-4 text-[#A8C7FA]" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5.04-6.71l-2.75 3.54-1.96-2.36L6.5 17h11l-3.54-4.71z" />
                            </svg>
                            Screenshot
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setRecentsOpen(false);
                                setStyleSheetOpen(true);
                            }}
                            className="px-4 py-2.5 rounded-full bg-[#2B2930] hover:bg-[#383540] border border-white/10 text-xs font-semibold text-white flex items-center gap-2 active:scale-95 transition-all"
                        >
                            <svg className="w-4 h-4 text-[#81C995]" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8z" />
                            </svg>
                            Wallpaper &amp; style
                        </button>
                    </div>
                </div>
            )}

            {/* Material You "Wallpaper & Style" Bottom Sheet */}
            {styleSheetOpen && (
                <div
                    className="fixed inset-0 z-[230] bg-black/60 backdrop-blur-md flex items-end"
                    onClick={() => setStyleSheetOpen(false)}
                >
                    <div
                        className="w-full rounded-t-[32px] bg-[#1C1B1F] border-t border-white/15 p-5 pb-9 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="w-10 h-1 rounded-full bg-white/30 mx-auto mb-4" />
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-base font-semibold text-white">Wallpaper &amp; style</h3>
                                <p className="text-xs text-[#CAC4D0]">Material You Dynamic Color Palette</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setStyleSheetOpen(false)}
                                className="px-3 py-1 rounded-full bg-white/10 text-xs text-white"
                            >
                                Done
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-2.5">
                            {MATERIAL_THEMES.map((theme) => {
                                const active = themeId === theme.id;
                                return (
                                    <button
                                        key={theme.id}
                                        type="button"
                                        onClick={() => {
                                            setThemeId(theme.id);
                                            setBgImage(theme.wall);
                                            document.documentElement.style.setProperty('--android-primary', theme.primary);
                                            showToast(`Applied ${theme.name} theme`);
                                        }}
                                        className={`p-3 rounded-[20px] flex items-center gap-3 border text-left transition-all ${
                                            active
                                                ? 'bg-white/15 border-white/40'
                                                : 'bg-[#2B2930] border-white/5 hover:bg-[#35333C]'
                                        }`}
                                    >
                                        <span
                                            className="w-7 h-7 rounded-full flex-shrink-0 border border-white/20 shadow-inner"
                                            style={{ backgroundColor: theme.primary }}
                                        />
                                        <div className="min-w-0">
                                            <div className="text-xs font-semibold text-white truncate">{theme.name}</div>
                                            <div className="text-[10px] text-[#CAC4D0]">{theme.wall}</div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            <AppDrawer
                isOpen={drawerOpen}
                onClose={closeDrawer}
                apps={activeApps}
                onOpenApp={handleOpenApp}
            />

            <NotificationPanel
                isOpen={notificationOpen}
                onClose={closeNotifications}
                onBrightnessChange={setBrightness}
                onOpenSettings={() => handleOpenApp('settings')}
                time={currentTime}
                wifiOn={wifiOn}
                onToggleWifi={setWifiOn}
                btOn={btOn}
                onToggleBt={setBtOn}
                dndOn={dndOn}
                onToggleDnd={setDndOn}
                onNotificationsCountChange={setNotificationCount}
            />

            <AppContextMenu
                app={contextMenu.app}
                position={contextMenu.position}
                onClose={closeContextMenu}
                onOpenApp={handleOpenApp}
                onUninstall={handleUninstall}
            />

            <div
                className={`android-backdrop ${(drawerOpen || notificationOpen) ? 'visible' : ''}`}
                onClick={() => {
                    closeDrawer();
                    closeNotifications();
                }}
            />

            {openApp && (
                <AndroidApp
                    app={openApp}
                    onClose={handleCloseApp}
                    onOpenApp={handleOpenApp}
                    onOpenRecents={() => {
                        vibrate();
                        setRecentsOpen(true);
                    }}
                    closing={closingApp}
                    changeBackgroundImage={setBgImage}
                    currBgImgName={bgImage}
                />
            )}

            <OrbyAssistant
                isOpen={orbyOpen}
                onClose={() => setOrbyOpen(false)}
                onOpenApp={handleOpenApp}
            />
        </div>
    );
}
