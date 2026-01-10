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
            icon: './images/notifications/notif_portfolio.png',
            title: 'Welcome!',
            message: 'Thanks for visiting. Tap to view Resume.',
            time: 'Just now',
            color: '#8AB4F8',
            action: () => window.open('./files/AshinShanly_RESUME.pdf', '_blank')
        },
        {
            id: 2,
            app: 'GitHub',
            icon: './images/notifications/notif_github.png',
            title: 'New commits',
            message: 'Check out my latest projects',
            time: '2m ago',
            color: '#81C995',
            action: () => window.open('https://github.com/ashinshanly', '_blank')
        },
        {
            id: 3,
            app: 'LinkedIn',
            icon: './images/notifications/notif_linkedin.png',
            title: 'Connect with me',
            message: 'Let\'s connect!',
            time: '5m ago',
            color: '#0A66C2',
            action: () => window.open('https://www.linkedin.com/in/ashin-shanly/', '_blank')
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
                    absolute top-0 left-0 right-0 bg-[#1C1B1F]/95 backdrop-blur-xl
                    rounded-b-3xl shadow-2xl overflow-hidden
                    transition-transform duration-300 ease-out
                    ${isOpen ? 'translate-y-0' : '-translate-y-full'}
                `}
                style={{ maxHeight: '85vh' }}
            >
                {/* Status bar area */}
                <div className="h-6 bg-transparent" />

                {/* Quick settings */}
                <div className="px-4 py-3 flex items-center justify-between border-b border-white/10">
                    <div className="flex items-center gap-4">
                        {/* WiFi */}
                        <div
                            className={`w-12 h-8 rounded-full flex items-center justify-center transition-all ${wifiOn ? 'bg-[#8AB4F8]' : 'bg-white/10'}`}
                            onClick={toggleWifi}
                        >
                            <svg className={`w-5 h-5 ${wifiOn ? 'text-black' : 'text-white'}`} viewBox="0 0 24 24" fill="currentColor">
                                <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z" />
                            </svg>
                        </div>
                        {/* Bluetooth */}
                        <div
                            className={`w-12 h-8 rounded-full flex items-center justify-center transition-all ${btOn ? 'bg-[#8AB4F8]' : 'bg-white/10'}`}
                            onClick={toggleBt}
                        >
                            <svg className={`w-5 h-5 ${btOn ? 'text-black' : 'text-white'}`} viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.71 7.71L12 2h-1v7.59L6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 11 14.41V22h1l5.71-5.71-4.3-4.29 4.3-4.29zM13 5.83l1.88 1.88L13 9.59V5.83zm1.88 10.46L13 18.17v-3.76l1.88 1.88z" />
                            </svg>
                        </div>
                        {/* Flashlight */}
                        <div
                            className={`w-12 h-8 rounded-full flex items-center justify-center transition-all ${flashlightOn ? 'bg-[#8AB4F8]' : 'bg-white/10'}`}
                            onClick={toggleFlashlight}
                        >
                            <svg className={`w-5 h-5 ${flashlightOn ? 'text-black' : 'text-white'}`} viewBox="0 0 24 24" fill="currentColor">
                                <path d="M6 2v6l2 2v12h8V10l2-2V2H6zm6 16c-.83 0-1.5-.67-1.5-1.5S11.17 15 12 15s1.5.67 1.5 1.5S12.83 18 12 18z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Brightness slider */}
                <div className="px-4 py-4 flex items-center gap-3 border-b border-white/10">
                    <svg className="w-5 h-5 text-white/60" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20 8.69V4h-4.69L12 .69 8.69 4H4v4.69L.69 12 4 15.31V20h4.69L12 23.31 15.31 20H20v-4.69L23.31 12 20 8.69zM12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z" />
                    </svg>
                    <input
                        type="range"
                        min="20"
                        max="100"
                        value={brightness}
                        onChange={handleBrightness}
                        className="flex-grow h-1 rounded-full appearance-none bg-white/20"
                        style={{
                            background: `linear-gradient(to right, #8AB4F8 0%, #8AB4F8 ${brightness}%, rgba(255,255,255,0.2) ${brightness}%)`
                        }}
                    />
                </div>

                {/* Notifications header */}
                <div className="px-4 py-2 flex items-center justify-between">
                    <span className="text-white/60 text-sm">Notifications</span>
                    <button className="text-[#8AB4F8] text-sm hover:opacity-80">Clear all</button>
                </div>

                {/* Notifications list */}
                <div className="overflow-y-auto pb-4" style={{ maxHeight: 'calc(85vh - 200px)' }}>
                    {allNotifications.map((notification) => (
                        <div
                            key={notification.id}
                            className="mx-3 mb-2 p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors active:scale-[0.98] duration-200 cursor-pointer"
                            onClick={() => {
                                if (notification.action) {
                                    notification.action();
                                    showToast(`Opening ${notification.app}...`);
                                    onClose();
                                }
                            }}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                                    style={{ backgroundColor: notification.color + '20' }}
                                >
                                    <img
                                        src={notification.icon}
                                        alt={notification.app}
                                        className="w-6 h-6 rounded"
                                        onError={(e) => {
                                            e.target.src = './themes/Yaru/apps/bash.png';
                                        }}
                                    />
                                </div>
                                <div className="flex-grow min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-white/60 text-xs">{notification.app}</span>
                                        <span className="text-white/40 text-xs">{notification.time}</span>
                                    </div>
                                    <div className="text-white font-medium text-sm mb-1">{notification.title}</div>
                                    <div className="text-white/70 text-sm truncate">{notification.message}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-2" />
            </div>
        </div>
    );
}
