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

export default function AndroidHome() {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [notificationOpen, setNotificationOpen] = useState(false);
    const [openApp, setOpenApp] = useState(null);
    const [closingApp, setClosingApp] = useState(false);
    const [bgImage, setBgImage] = useState('wall-2');
    const [contextMenu, setContextMenu] = useState({ app: null, position: null });
    const [page, setPage] = useState(0);
    const [hiddenApps, setHiddenApps] = useState([]); // Support uninstalling simulation
    const [brightness, setBrightness] = useState(100); // Brightness state

    const touchStartY = useRef(0);
    const touchStartX = useRef(0);
    const longPressTimer = useRef(null);
    const homeRef = useRef(null);

    // Update time every minute
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
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
            wallpaper.style.transform = `scale(1.1) translate(${x}px, ${y}px)`;
        }
    };

    // Filter apps based on hidden state (simulated uninstall)
    const activeApps = apps.filter(app => !hiddenApps.includes(app.id));
    const homeApps = activeApps.filter(app => app.favourite).slice(4, 12);
    const dockApps = activeApps.filter(app => app.favourite).slice(0, 4);

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

    const handleTouchEnd = (e) => {
        const touchEndY = e.changedTouches[0].clientY;
        const touchEndX = e.changedTouches[0].clientX;
        const deltaY = touchStartY.current - touchEndY;
        const deltaX = touchStartX.current - touchEndX;

        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }

        // Removed drawer open on swipe up logic here


        if (deltaY < -80 && touchStartY.current < 100 && !drawerOpen) {
            vibrate();
            setNotificationOpen(true);
        }

        if (Math.abs(deltaX) > 60 && Math.abs(deltaY) < 50) {
            if (deltaX > 0 && page === 0) {
                setPage(1);
                vibrate();
            } else if (deltaX < 0 && page === 1) {
                setPage(0);
                vibrate();
            }
        }
    };

    const handleAppTouchStart = (e, app) => {
        longPressApp(e, app);
    };

    const longPressApp = (e, app) => {
        longPressTimer.current = setTimeout(() => {
            vibrate();
            const touch = e.touches ? e.touches[0] : e;
            setContextMenu({
                app: app,
                position: { x: touch.clientX, y: touch.clientY }
            });
        }, 500);
    };

    const handleAppTouchEnd = () => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }
    };

    const handleOpenApp = (appId) => {
        if (contextMenu.app) return;

        const app = apps.find(a => a.id === appId);
        if (app) {
            vibrate();
            if (app.type === "external" && app.url) {
                window.open(app.url, "_blank");
                return;
            }
            setOpenApp(app);
            setDrawerOpen(false);
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

    const renderAppIcon = (app, index, inDock = false) => (
        <div
            key={app.id || index}
            className="android-app-icon ripple"
            onClick={() => handleOpenApp(app.id)}
            onTouchStart={(e) => handleAppTouchStart(e, app)}
            onMouseDown={(e) => longPressApp(e, app)}
            onMouseUp={handleAppTouchEnd}
            onTouchEnd={handleAppTouchEnd}
            onTouchMove={handleAppTouchEnd}
            onContextMenu={(e) => {
                e.preventDefault();
            }}
        >
            <img
                src={app.icon}
                alt={app.title}
                draggable={false}
                onError={(e) => {
                    e.target.src = './themes/Yaru/apps/bash.png';
                }}
            />
            {!inDock && <span>{app.title}</span>}
        </div>
    );

    return (
        <div
            className="android-container overflow-hidden"
            ref={homeRef}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onMouseMove={handleMouseMove}
            style={{ filter: `brightness(${brightness}%)` }} // Apply brightness
        >
            <div id="android-wallpaper" className="absolute inset-0 z-0 transition-transform duration-100 ease-out">
                <BackgroundImage img={bgImage} />
            </div>

            <AndroidToast />

            <AndroidStatusBar
                time={currentTime}
                onPullDown={() => setNotificationOpen(true)}
                hasNotifications={true}
            />

            <div
                className="android-home relative z-10 transition-transform duration-300 ease-out"
                style={{ transform: `translateX(${-page * 20}%)`, opacity: page === 1 ? 0.8 : 1 }}
            >
                <div
                    className={`flex flex-col h-full transition-opacity duration-300 ${page === 1 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                >
                    <div className="at-a-glance">
                        <div className="at-a-glance-date">{formatDate()}</div>
                        <div className="at-a-glance-time">{formatTime()}</div>
                    </div>

                    <SearchWidget />

                    <div className="android-app-grid">
                        {homeApps.map((app, index) => renderAppIcon(app, index))}
                    </div>
                </div>
            </div>

            <div
                className={`absolute inset-0 z-10 pt-24 px-4 transition-all duration-300 ${page === 0 ? 'translate-x-[120%] opacity-0' : 'translate-x-0 opacity-100'}`}
            >
                <div className="text-white/60 text-sm font-medium mb-4 pl-2">Widgets</div>
                <WeatherWidget />
                <MusicWidget />

                <div className="mx-4 mb-4 p-4 bg-[#2D2D30]/80 backdrop-blur-xl rounded-2xl border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-500/20 rounded-full text-green-400">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4z" />
                            </svg>
                        </div>
                        <div>
                            <div className="text-white font-medium">Battery</div>
                            <div className="text-white/60 text-sm">85% • About 8 hr left</div>
                        </div>
                    </div>
                    <div className="text-xl font-bold text-white">85%</div>
                </div>
            </div>

            <div className="absolute bottom-[100px] left-0 right-0 flex justify-center gap-2 z-20">
                <div
                    className={`w-2 h-2 rounded-full transition-colors ${page === 0 ? 'bg-white' : 'bg-white/30'}`}
                    onClick={() => setPage(0)}
                />
                <div
                    className={`w-2 h-2 rounded-full transition-colors ${page === 1 ? 'bg-white' : 'bg-white/30'}`}
                    onClick={() => setPage(1)}
                />
            </div>

            <div className="absolute bottom-[12px] left-0 right-0 z-20">
                {/* Removed swipe indicator */}
                <div className="android-dock mx-4">
                    {dockApps.slice(0, 2).map((app, index) => renderAppIcon(app, index, true))}
                    <div className="android-app-icon ripple" onClick={() => {
                        vibrate();
                        setDrawerOpen(true);
                    }}>
                        <img width="32" height="32" src="./themes/Yaru/system/view-app-grid-symbolic.svg" alt="All Apps" />
                    </div>
                    {dockApps.slice(2, 4).map((app, index) => renderAppIcon(app, index + 2, true))}
                </div>
            </div>

            <GestureNavBar
                // Removed onSwipeUp
                onHome={() => {
                    handleCloseApp();
                    setPage(0);
                    vibrate();
                }}
            />

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
                    closing={closingApp}
                />
            )}
        </div>
    );
}
