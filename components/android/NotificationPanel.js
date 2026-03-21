import React, { useState } from 'react';
import { showToast } from './AndroidToast';

export default function NotificationPanel({ isOpen, onClose, notifications = [], onBrightnessChange }) {
    const [wifiOn, setWifiOn] = useState(true);
    const [btOn, setBtOn] = useState(true);
    const [flashlightOn, setFlashlightOn] = useState(false);
    const [brightness, setBrightness] = useState(100);

    const toggleWifi = () => {
        setWifiOn(!wifiOn);
        showToast(wifiOn ? "Wi-Fi turned off" : "Searching for networks...");
    };

    const toggleBt = () => {
        setBtOn(!btOn);
        showToast(btOn ? "Bluetooth turned off" : "Bluetooth enabled");
    };

    const toggleFlashlight = () => {
        setFlashlightOn(!flashlightOn);
        showToast(flashlightOn ? "Flashlight off" : "Flashlight on");
    };

    const handleBrightness = (e) => {
        const val = e.target.value;
        setBrightness(val);
        if (onBrightnessChange) onBrightnessChange(val);
    };

    // Default notifications with actionable links
    const defaultNotifications = [
        {
            id: 1,
            app: 'Portfolio',
            icon: (
                <svg className="w-3.5 h-3.5 text-[#8AB4F8]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z" />
                </svg>
            ),
            title: 'Welcome!',
            message: 'Thanks for visiting. Tap to view Resume.',
            time: 'Just now',
            color: '#8AB4F8',
            action: () => window.open('./files/AshinShanly_RESUME.pdf', '_blank')
        },
        {
            id: 2,
            app: 'GitHub',
            icon: (
                <svg className="w-3.5 h-3.5 text-[#81C995]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.03-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z" />
                </svg>
            ),
            title: 'New commits',
            message: 'Check out my latest projects',
            time: '2m ago',
            color: '#81C995',
            action: () => window.open('https://github.com/ashinshanly', '_blank')
        },
        {
            id: 3,
            app: 'LinkedIn',
            icon: (
                <svg className="w-3.5 h-3.5 text-[#0A66C2]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
            ),
            title: 'Connect with me',
            message: 'Let\'s connect!',
            time: '5m ago',
            color: '#0A66C2',
            action: () => window.open('https://www.linkedin.com/in/ashinshanly/', '_blank')
        }
    ];

    const allNotifications = notifications.length > 0 ? notifications : defaultNotifications;

    return (
        <div
            className={`
                fixed inset-0 z-[55] transition-all duration-300
                ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}
            `}
        >
            {/* Backdrop */}
            <div
                className={`
                    absolute inset-0 bg-black/60 backdrop-blur-sm
                    transition-opacity duration-300
                    ${isOpen ? 'opacity-100' : 'opacity-0'}
                `}
                onClick={onClose}
            />

            {/* Panel */}
            <div
                className={`
                    absolute top-0 left-0 right-0 glass-panel flex flex-col
                    rounded-b-3xl shadow-2xl overflow-hidden
                    transition-transform duration-300 ease-out
                    ${isOpen ? 'translate-y-0' : '-translate-y-full'}
                `}
                style={{ maxHeight: '85vh' }}
            >
                {/* Status bar area */}
                <div className="h-4 bg-transparent" />

                {/* Quick settings - Material You style grid */}
                <div className="px-3 py-2 grid grid-cols-2 gap-2 border-b border-white/10">
                    {/* WiFi */}
                    <div
                        className={`col-span-1 h-12 rounded-[20px] flex items-center px-3 gap-2 cursor-pointer transition-all ${wifiOn ? 'bg-[#8AB4F8] text-black' : 'bg-white/10 text-white'}`}
                        onClick={toggleWifi}
                    >
                        <div className="flex-shrink-0">
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z" />
                            </svg>
                        </div>
                        <div className="flex flex-col flex-grow truncate">
                            <span className="text-xs font-semibold truncate leading-tight">Internet</span>
                            <span className={`text-[10px] truncate leading-tight ${wifiOn ? 'text-black/70' : 'text-white/60'}`}>{wifiOn ? 'Home WiFi' : 'Off'}</span>
                        </div>
                    </div>

                    {/* Bluetooth */}
                    <div
                        className={`col-span-1 h-12 rounded-[20px] flex items-center px-3 gap-2 cursor-pointer transition-all ${btOn ? 'bg-[#8AB4F8] text-black' : 'bg-white/10 text-white'}`}
                        onClick={toggleBt}
                    >
                        <div className="flex-shrink-0">
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.71 7.71L12 2h-1v7.59L6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 11 14.41V22h1l5.71-5.71-4.3-4.29 4.3-4.29zM13 5.83l1.88 1.88L13 9.59V5.83zm1.88 10.46L13 18.17v-3.76l1.88 1.88z" />
                            </svg>
                        </div>
                        <div className="flex flex-col flex-grow truncate">
                            <span className="text-xs font-semibold truncate leading-tight">Bluetooth</span>
                            <span className={`text-[10px] truncate leading-tight ${btOn ? 'text-black/70' : 'text-white/60'}`}>{btOn ? 'On' : 'Off'}</span>
                        </div>
                    </div>

                    {/* Flashlight */}
                    <div
                        className={`col-span-1 h-12 rounded-[20px] flex items-center px-3 gap-2 cursor-pointer transition-all ${flashlightOn ? 'bg-white text-black' : 'bg-white/10 text-white'}`}
                        onClick={toggleFlashlight}
                    >
                        <div className="flex-shrink-0">
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M6 2v6l2 2v12h8V10l2-2V2H6zm6 16c-.83 0-1.5-.67-1.5-1.5S11.17 15 12 15s1.5.67 1.5 1.5S12.83 18 12 18z" />
                            </svg>
                        </div>
                        <div className="flex flex-col flex-grow truncate">
                            <span className="text-xs font-semibold truncate leading-tight">Flashlight</span>
                            <span className={`text-[10px] truncate leading-tight ${flashlightOn ? 'text-black/70' : 'text-white/60'}`}>{flashlightOn ? 'On' : 'Off'}</span>
                        </div>
                    </div>

                    {/* Do Not Disturb */}
                    <div
                        className="col-span-1 h-12 rounded-[20px] flex items-center px-3 gap-2 cursor-pointer transition-all bg-white/10 text-white hover:bg-white/20"
                    >
                        <div className="flex-shrink-0">
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z" />
                            </svg>
                        </div>
                        <div className="flex flex-col flex-grow truncate">
                            <span className="text-xs font-semibold truncate leading-tight">DND</span>
                            <span className="text-[10px] text-white/60 truncate leading-tight">Off</span>
                        </div>
                    </div>
                </div>

                {/* Brightness slider */}
                <div className="px-4 py-2 border-b border-white/10 relative">
                    <div className="relative w-full h-8 rounded-full bg-white/20 overflow-hidden flex items-center shadow-inner">
                        <div 
                            className="absolute left-0 top-0 bottom-0 bg-[#8AB4F8]" 
                            style={{ width: `${((brightness - 20) / 80) * 100}%` }}
                        />
                        <div className="absolute left-3 pointer-events-none z-10 flex items-center justify-center">
                            <svg className={`w-4 h-4 ${((brightness - 20) / 80) * 100 > 10 ? 'text-black' : 'text-white/60'}`} viewBox="0 0 24 24" fill="currentColor">
                                <path d="M20 8.69V4h-4.69L12 .69 8.69 4H4v4.69L.69 12 4 15.31V20h4.69L12 23.31 15.31 20H20v-4.69L23.31 12 20 8.69zM12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z" />
                            </svg>
                        </div>
                        <input
                            type="range"
                            min="20"
                            max="100"
                            value={brightness}
                            onChange={handleBrightness}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                    </div>
                </div>

                {/* Notifications header */}
                <div className="px-4 py-2 flex items-center justify-between mt-1">
                    <span className="text-white/80 font-medium text-xs">Notifications</span>
                    <button className="text-[#8AB4F8] font-medium text-xs hover:bg-white/10 px-3 py-1 rounded-full transition-all active:scale-95 duration-200">Clear all</button>
                </div>

                {/* Notifications list */}
                <div className="flex-1 min-h-0 overflow-y-auto pb-4 px-2 flex flex-col gap-1.5">
                    {allNotifications.map((notification) => (
                        <div
                            key={notification.id}
                            className="mx-2 p-3 bg-white/5 backdrop-blur-md rounded-[20px] hover:bg-white/10 shadow-sm border border-white/5 transition-all active:scale-[0.98] duration-200 cursor-pointer flex flex-col gap-1.5"
                            onClick={() => {
                                if (notification.action) {
                                    notification.action();
                                    showToast(`Opening ${notification.app}...`);
                                    onClose();
                                }
                            }}
                        >
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                                    style={{ backgroundColor: notification.color + '20' }}
                                >
                                    {typeof notification.icon === 'string' ? (
                                        <img
                                            src={notification.icon}
                                            alt={notification.app}
                                            className="w-3 h-3 rounded-sm"
                                            onError={(e) => {
                                                e.target.src = './themes/Yaru/apps/bash.png';
                                            }}
                                        />
                                    ) : (
                                        notification.icon
                                    )}
                                </div>
                                <span className="text-white/70 text-[10px] font-medium leading-none mt-0.5">{notification.app}</span>
                                <span className="text-white/40 text-[10px] ml-auto leading-none mt-0.5">{notification.time}</span>
                            </div>
                            <div className="flex flex-col pl-7">
                                <div className="text-white font-medium text-xs leading-tight">{notification.title}</div>
                                <div className="text-white/70 text-xs mt-0.5 leading-tight">{notification.message}</div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-2" />
            </div>
        </div>
    );
}
