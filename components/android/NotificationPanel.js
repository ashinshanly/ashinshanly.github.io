import React, { useState, useRef } from 'react';
import { showToast } from './AndroidToast';

const DEFAULT_NOTIFICATIONS = [
    {
        id: 1,
        app: 'Portfolio',
        category: 'Career • Resume',
        icon: (
            <svg className="w-4 h-4 text-[#A8C7FA]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z" />
            </svg>
        ),
        title: 'Welcome to Ashin’s Portfolio',
        message: 'Explore my AI/ML projects, experience, or view my latest resume.',
        actionLabel: 'Open Resume',
        time: 'now',
        color: '#A8C7FA',
        action: () => window.open('./files/AshinShanly_RESUME.pdf', '_blank')
    },
    {
        id: 2,
        app: 'GitHub',
        category: 'ashinshanly',
        icon: (
            <svg className="w-4 h-4 text-[#81C995]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.03-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z" />
            </svg>
        ),
        title: 'Recent Repositories & Commits',
        message: 'Check out open-source repositories, ML pipelines, and experiments.',
        actionLabel: 'View GitHub',
        time: '2m',
        color: '#81C995',
        action: () => window.open('https://github.com/ashinshanly', '_blank')
    },
    {
        id: 3,
        app: 'LinkedIn',
        category: 'Network',
        icon: (
            <svg className="w-4 h-4 text-[#7FC1FF]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
        ),
        title: 'Let’s Connect on LinkedIn',
        message: 'Open to software engineering, data science, and AI collaborations.',
        actionLabel: 'Connect',
        time: '5m',
        color: '#7FC1FF',
        action: () => window.open('https://www.linkedin.com/in/ashinshanly/', '_blank')
    }
];

export default function NotificationPanel({
    isOpen,
    onClose,
    notifications = [],
    onBrightnessChange,
    onOpenSettings,
    time,
    wifiOn: externalWifiOn,
    onToggleWifi,
    btOn: externalBtOn,
    onToggleBt,
    dndOn: externalDndOn,
    onToggleDnd,
    onNotificationsCountChange
}) {
    const [internalWifiOn, setInternalWifiOn] = useState(true);
    const [internalBtOn, setInternalBtOn] = useState(true);
    const [flashlightOn, setFlashlightOn] = useState(false);
    const [internalDndOn, setInternalDndOn] = useState(false);
    const [brightness, setBrightness] = useState(100);
    const [dismissedIds, setDismissedIds] = useState([]);
    const [expandedIds, setExpandedIds] = useState([1]);

    const panelTouchStartY = useRef(null);

    const wifiOn = externalWifiOn !== undefined ? externalWifiOn : internalWifiOn;
    const btOn = externalBtOn !== undefined ? externalBtOn : internalBtOn;
    const dndOn = externalDndOn !== undefined ? externalDndOn : internalDndOn;

    const currentTime = time || new Date();

    const formatHeaderTime = () => {
        return currentTime.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: false
        });
    };

    const formatHeaderDate = () => {
        return currentTime.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    };

    const toggleWifi = () => {
        const next = !wifiOn;
        if (onToggleWifi) onToggleWifi(next);
        else setInternalWifiOn(next);
        showToast(next ? 'Connected to Pixel_5G' : 'Wi-Fi turned off');
    };

    const toggleBt = () => {
        const next = !btOn;
        if (onToggleBt) onToggleBt(next);
        else setInternalBtOn(next);
        showToast(next ? 'Bluetooth enabled' : 'Bluetooth turned off');
    };

    const toggleFlashlight = () => {
        const next = !flashlightOn;
        setFlashlightOn(next);
        showToast(next ? 'Flashlight turned on' : 'Flashlight turned off');
    };

    const toggleDnd = () => {
        const next = !dndOn;
        if (onToggleDnd) onToggleDnd(next);
        else setInternalDndOn(next);
        showToast(next ? 'Do Not Disturb turned on' : 'Do Not Disturb turned off');
    };

    const handleBrightness = (e) => {
        const val = Math.max(20, Math.min(100, Number(e.target.value)));
        setBrightness(val);
        if (onBrightnessChange) onBrightnessChange(val);
    };

    const sourceNotifications = notifications.length > 0 ? notifications : DEFAULT_NOTIFICATIONS;
    const visibleNotifications = sourceNotifications.filter((n) => !dismissedIds.includes(n.id));

    const updateCount = (nextDismissed) => {
        if (onNotificationsCountChange) {
            const remaining = sourceNotifications.filter((n) => !nextDismissed.includes(n.id)).length;
            onNotificationsCountChange(remaining);
        }
    };

    const handleDismissOne = (e, id) => {
        e.stopPropagation();
        const next = [...dismissedIds, id];
        setDismissedIds(next);
        updateCount(next);
    };

    const handleClearAll = () => {
        const allIds = sourceNotifications.map((n) => n.id);
        setDismissedIds(allIds);
        updateCount(allIds);
        showToast('All notifications cleared');
    };

    const handleRestoreNotifications = () => {
        setDismissedIds([]);
        updateCount([]);
        showToast('Notifications restored');
    };

    const toggleExpand = (e, id) => {
        e.stopPropagation();
        setExpandedIds((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    const handlePanelTouchStart = (e) => {
        if (e.touches && e.touches.length > 0) {
            panelTouchStartY.current = e.touches[0].clientY;
        }
    };

    const handlePanelTouchEnd = (e) => {
        if (panelTouchStartY.current !== null && e.changedTouches && e.changedTouches.length > 0) {
            const deltaY = e.changedTouches[0].clientY - panelTouchStartY.current;
            if (deltaY < -60 && onClose) {
                onClose();
            }
        }
        panelTouchStartY.current = null;
    };

    const fillPercent = ((brightness - 20) / 80) * 100;

    return (
        <div
            className={`
                fixed inset-0 z-[250] transition-all duration-300
                ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}
            `}
            aria-hidden={!isOpen}
        >
            {/* Scrim Backdrop */}
            <div
                className={`
                    absolute inset-0 bg-black/70 backdrop-blur-md
                    transition-opacity duration-300
                    ${isOpen ? 'opacity-100' : 'opacity-0'}
                `}
                onClick={onClose}
            />

            {/* Modern Android 14/15 Shade Container */}
            <div
                className={`
                    absolute top-0 left-0 right-0 flex flex-col
                    bg-[#141318]/95 backdrop-blur-2xl
                    rounded-b-[32px] border-b border-white/10 shadow-[0_24px_60px_rgba(0,0,0,0.75)]
                    overflow-hidden transition-transform duration-300 cubic-bezier(0.2, 0.8, 0.2, 1)
                    ${isOpen ? 'translate-y-0' : '-translate-y-full'}
                `}
                style={{ maxHeight: '88vh' }}
                onTouchStart={handlePanelTouchStart}
                onTouchEnd={handlePanelTouchEnd}
            >
                {/* Top Shade Header: Clock, Date, System Status, Settings Gear */}
                <div className="px-5 pt-4 pb-3 flex items-center justify-between">
                    <div className="flex items-baseline gap-2.5">
                        <span className="text-[22px] font-semibold tracking-tight text-white tabular-nums leading-none">
                            {formatHeaderTime()}
                        </span>
                        <span className="text-xs font-medium text-[#CAC4D0] tracking-wide">
                            {formatHeaderDate()}
                        </span>
                    </div>

                    <div className="flex items-center gap-2.5">
                        {/* Mini status cluster inside shade */}
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.06] text-white/85 text-[11px] font-medium">
                            <span>{wifiOn ? '5G • Wi-Fi' : '5G'}</span>
                            <span className="text-white/30">•</span>
                            <span className="text-[#81C995] font-semibold">85%</span>
                        </div>

                        {/* Settings shortcut button */}
                        <button
                            type="button"
                            onClick={() => {
                                if (onOpenSettings) onOpenSettings();
                                if (onClose) onClose();
                            }}
                            aria-label="Open Settings"
                            className="w-8 h-8 rounded-full bg-[#2B2930] hover:bg-[#3A3840] active:scale-95 flex items-center justify-center text-white/90 transition-all"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.488.488 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 00-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Material You Quick Settings 2x2 Pill Grid */}
                <div className="px-4 py-1.5 grid grid-cols-2 gap-2.5">
                    {/* Internet Tile */}
                    <button
                        type="button"
                        onClick={toggleWifi}
                        className={`col-span-1 h-[58px] rounded-[24px] flex items-center px-3.5 gap-3 text-left transition-all active:scale-[0.97] ${
                            wifiOn
                                ? 'bg-[#A8C7FA] text-[#062E6F] shadow-sm'
                                : 'bg-[#2B2930] text-[#E6E1E5] border border-white/5 hover:bg-[#35333B]'
                        }`}
                    >
                        <div className="flex-shrink-0">
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z" />
                            </svg>
                        </div>
                        <div className="flex flex-col flex-grow min-w-0">
                            <span className="text-[13px] font-semibold truncate leading-tight">Internet</span>
                            <span className={`text-[11px] truncate leading-tight mt-0.5 ${wifiOn ? 'text-[#062E6F]/80' : 'text-[#CAC4D0]'}`}>
                                {wifiOn ? 'Pixel_5G' : 'Off'}
                            </span>
                        </div>
                        <svg className={`w-4 h-4 flex-shrink-0 ${wifiOn ? 'text-[#062E6F]/70' : 'text-white/40'}`} viewBox="0 0 24 24" fill="currentColor">
                            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                        </svg>
                    </button>

                    {/* Bluetooth Tile */}
                    <button
                        type="button"
                        onClick={toggleBt}
                        className={`col-span-1 h-[58px] rounded-[24px] flex items-center px-3.5 gap-3 text-left transition-all active:scale-[0.97] ${
                            btOn
                                ? 'bg-[#A8C7FA] text-[#062E6F] shadow-sm'
                                : 'bg-[#2B2930] text-[#E6E1E5] border border-white/5 hover:bg-[#35333B]'
                        }`}
                    >
                        <div className="flex-shrink-0">
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.71 7.71L12 2h-1v7.59L6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 11 14.41V22h1l5.71-5.71-4.3-4.29 4.3-4.29zM13 5.83l1.88 1.88L13 9.59V5.83zm1.88 10.46L13 18.17v-3.76l1.88 1.88z" />
                            </svg>
                        </div>
                        <div className="flex flex-col flex-grow min-w-0">
                            <span className="text-[13px] font-semibold truncate leading-tight">Bluetooth</span>
                            <span className={`text-[11px] truncate leading-tight mt-0.5 ${btOn ? 'text-[#062E6F]/80' : 'text-[#CAC4D0]'}`}>
                                {btOn ? 'Connected' : 'Off'}
                            </span>
                        </div>
                        <svg className={`w-4 h-4 flex-shrink-0 ${btOn ? 'text-[#062E6F]/70' : 'text-white/40'}`} viewBox="0 0 24 24" fill="currentColor">
                            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                        </svg>
                    </button>

                    {/* Flashlight Tile */}
                    <button
                        type="button"
                        onClick={toggleFlashlight}
                        className={`col-span-1 h-[58px] rounded-[24px] flex items-center px-3.5 gap-3 text-left transition-all active:scale-[0.97] ${
                            flashlightOn
                                ? 'bg-[#FFE082] text-[#3E2723] shadow-[0_0_20px_rgba(255,224,130,0.3)]'
                                : 'bg-[#2B2930] text-[#E6E1E5] border border-white/5 hover:bg-[#35333B]'
                        }`}
                    >
                        <div className="flex-shrink-0">
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M6 2h12v3l-2 3v14H8V8L6 5V2zm2 2v.38l2 3V20h4V7.38l2-3V4H8zm4 7c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z" />
                            </svg>
                        </div>
                        <div className="flex flex-col flex-grow min-w-0">
                            <span className="text-[13px] font-semibold truncate leading-tight">Flashlight</span>
                            <span className={`text-[11px] truncate leading-tight mt-0.5 ${flashlightOn ? 'text-[#3E2723]/80' : 'text-[#CAC4D0]'}`}>
                                {flashlightOn ? 'On' : 'Off'}
                            </span>
                        </div>
                    </button>

                    {/* Do Not Disturb Tile */}
                    <button
                        type="button"
                        onClick={toggleDnd}
                        className={`col-span-1 h-[58px] rounded-[24px] flex items-center px-3.5 gap-3 text-left transition-all active:scale-[0.97] ${
                            dndOn
                                ? 'bg-[#A8C7FA] text-[#062E6F] shadow-sm'
                                : 'bg-[#2B2930] text-[#E6E1E5] border border-white/5 hover:bg-[#35333B]'
                        }`}
                    >
                        <div className="flex-shrink-0">
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11H7v-2h10v2z" />
                            </svg>
                        </div>
                        <div className="flex flex-col flex-grow min-w-0">
                            <span className="text-[13px] font-semibold truncate leading-tight">Do Not Disturb</span>
                            <span className={`text-[11px] truncate leading-tight mt-0.5 ${dndOn ? 'text-[#062E6F]/80' : 'text-[#CAC4D0]'}`}>
                                {dndOn ? 'On' : 'Off'}
                            </span>
                        </div>
                    </button>
                </div>

                {/* Material You Thick Pill Brightness Slider */}
                <div className="px-4 py-2.5">
                    <div className="relative w-full h-11 rounded-full bg-[#2B2930] overflow-hidden flex items-center border border-white/5">
                        <div
                            className="absolute left-0 top-0 bottom-0 bg-[#A8C7FA] rounded-full transition-all duration-75"
                            style={{ width: `${Math.max(12, fillPercent)}%` }}
                        />
                        <div className="relative z-10 flex items-center justify-between w-full px-4 pointer-events-none">
                            <svg
                                className={`w-5 h-5 transition-colors ${
                                    fillPercent > 14 ? 'text-[#062E6F]' : 'text-[#E6E1E5]'
                                }`}
                                viewBox="0 0 24 24"
                                fill="currentColor"
                            >
                                <path d="M20 8.69V4h-4.69L12 .69 8.69 4H4v4.69L.69 12 4 15.31V20h4.69L12 23.31 15.31 20H20v-4.69L23.31 12 20 8.69zM12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm0-10c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z" />
                            </svg>
                            <span
                                className={`text-xs font-semibold tabular-nums transition-colors ${
                                    fillPercent > 88 ? 'text-[#062E6F]' : 'text-white/75'
                                }`}
                            >
                                {brightness}%
                            </span>
                        </div>
                        <input
                            type="range"
                            min="20"
                            max="100"
                            value={brightness}
                            onChange={handleBrightness}
                            aria-label="Screen brightness"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                        />
                    </div>
                </div>

                {/* Notifications Section Header */}
                <div className="px-5 pt-1 pb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-[#CAC4D0] font-semibold text-xs tracking-wide">
                            Notifications
                        </span>
                        {visibleNotifications.length > 0 && (
                            <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-white/10 text-white/80 tabular-nums">
                                {visibleNotifications.length}
                            </span>
                        )}
                    </div>
                    {visibleNotifications.length > 0 && (
                        <button
                            type="button"
                            onClick={handleClearAll}
                            className="text-[#A8C7FA] font-semibold text-xs hover:bg-[#A8C7FA]/10 px-3 py-1 rounded-full transition-all active:scale-95"
                        >
                            Clear all
                        </button>
                    )}
                </div>

                {/* Notifications List (Material You Grouped Cards) */}
                <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-3 flex flex-col gap-2">
                    {visibleNotifications.length === 0 ? (
                        <div className="py-8 px-4 flex flex-col items-center justify-center text-center rounded-[24px] bg-[#211F26]/70 border border-white/5">
                            <svg className="w-8 h-8 text-white/30 mb-2" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
                            </svg>
                            <p className="text-white/70 text-xs font-medium">No notifications</p>
                            <button
                                type="button"
                                onClick={handleRestoreNotifications}
                                className="mt-2.5 px-3.5 py-1.5 rounded-full bg-[#2B2930] hover:bg-[#35333B] text-[#A8C7FA] text-xs font-medium transition-all active:scale-95"
                            >
                                Restore welcome cards
                            </button>
                        </div>
                    ) : (
                        visibleNotifications.map((notification, idx) => {
                            const isExpanded = expandedIds.includes(notification.id);
                            const isFirst = idx === 0;
                            const isLast = idx === visibleNotifications.length - 1;
                            const radiusClass =
                                visibleNotifications.length === 1
                                    ? 'rounded-[24px]'
                                    : isFirst
                                    ? 'rounded-t-[24px] rounded-b-[12px]'
                                    : isLast
                                    ? 'rounded-t-[12px] rounded-b-[24px]'
                                    : 'rounded-[12px]';

                            return (
                                <div
                                    key={notification.id}
                                    className={`p-3.5 bg-[#25232A]/95 hover:bg-[#2E2C35] border border-white/[0.06] ${radiusClass} transition-all active:scale-[0.99] cursor-pointer flex flex-col gap-1.5`}
                                    onClick={() => {
                                        if (notification.action) {
                                            notification.action();
                                            showToast(`Opening ${notification.app}...`);
                                            onClose();
                                        }
                                    }}
                                >
                                    {/* Top row: Icon, App name, Dot, Time, Expand/Dismiss buttons */}
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                                            style={{ backgroundColor: (notification.color || '#A8C7FA') + '24' }}
                                        >
                                            {typeof notification.icon === 'string' ? (
                                                <img
                                                    src={notification.icon}
                                                    alt={notification.app}
                                                    className="w-3.5 h-3.5 rounded-sm"
                                                    onError={(e) => {
                                                        e.target.src = './themes/Yaru/apps/bash.png';
                                                    }}
                                                />
                                            ) : (
                                                notification.icon
                                            )}
                                        </div>

                                        <span className="text-[#E6E1E5] text-xs font-semibold leading-none">
                                            {notification.app}
                                        </span>
                                        {notification.category && (
                                            <span className="text-[#938F99] text-[11px] leading-none truncate">
                                                • {notification.category}
                                            </span>
                                        )}
                                        <span className="text-[#938F99] text-[11px] leading-none ml-auto">
                                            {notification.time}
                                        </span>

                                        {/* Expand chevron */}
                                        <button
                                            type="button"
                                            onClick={(e) => toggleExpand(e, notification.id)}
                                            aria-label={isExpanded ? 'Collapse notification' : 'Expand notification'}
                                            className="w-6 h-6 rounded-full bg-white/[0.06] hover:bg-white/15 flex items-center justify-center text-[#CAC4D0] transition-transform"
                                        >
                                            <svg
                                                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                                                    isExpanded ? 'rotate-180' : ''
                                                }`}
                                                viewBox="0 0 24 24"
                                                fill="currentColor"
                                            >
                                                <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
                                            </svg>
                                        </button>

                                        {/* Dismiss single notification */}
                                        <button
                                            type="button"
                                            onClick={(e) => handleDismissOne(e, notification.id)}
                                            aria-label={`Dismiss ${notification.app} notification`}
                                            className="w-6 h-6 rounded-full hover:bg-white/15 flex items-center justify-center text-[#938F99] hover:text-white transition-colors"
                                        >
                                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                                            </svg>
                                        </button>
                                    </div>

                                    {/* Content body */}
                                    <div className="pl-8 pr-2 flex flex-col">
                                        <div className="text-[#E6E1E5] font-semibold text-[13px] leading-snug">
                                            {notification.title}
                                        </div>
                                        <div
                                            className={`text-[#CAC4D0] text-xs mt-0.5 leading-relaxed ${
                                                isExpanded ? '' : 'line-clamp-1'
                                            }`}
                                        >
                                            {notification.message}
                                        </div>

                                        {isExpanded && notification.actionLabel && (
                                            <div className="mt-2.5 flex items-center gap-2">
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#A8C7FA]/15 text-[#A8C7FA] text-xs font-semibold">
                                                    {notification.actionLabel}
                                                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3m-2 16H5V5h7V3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7h-2v7z" />
                                                    </svg>
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Bottom Shade Grab Handle */}
                <div
                    className="py-2.5 flex justify-center cursor-pointer"
                    onClick={onClose}
                    role="button"
                    aria-label="Close notifications"
                >
                    <div className="w-11 h-1 bg-white/30 rounded-full" />
                </div>
            </div>
        </div>
    );
}
