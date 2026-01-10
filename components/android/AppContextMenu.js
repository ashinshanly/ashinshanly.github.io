import React, { useState } from 'react';
import { showToast } from './AndroidToast';

export default function AppContextMenu({ app, position, onClose, onOpenApp, onUninstall }) {
    if (!app || !position) return null;

    const [showInfo, setShowInfo] = useState(false);

    // Filter menu items based on app state or type
    const menuItems = [
        {
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            label: 'App info',
            action: () => {
                setShowInfo(true);
            }
        },
        {
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
            ),
            label: 'Widgets',
            action: () => {
                showToast("No widgets available for " + app.title);
                onClose();
            }
        },
        {
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
            ),
            label: 'Add to Home',
            action: () => {
                showToast("Shortcut added to Home Screen");
                onClose();
            }
        },
        {
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
            ),
            label: 'Uninstall',
            action: () => {
                // In a real app, this would modify state
                if (onUninstall) onUninstall(app.id);
                showToast("Uninstalled " + app.title);
                onClose();
            },
            destructive: true
        }
    ];

    if (showInfo) {
        return (
            <>
                <div className="fixed inset-0 z-[80] bg-black/50" onClick={onClose} />
                <div
                    className="fixed z-[90] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#2D2D30] rounded-2xl w-[80%] max-w-sm overflow-hidden shadow-2xl"
                >
                    <div className="p-6 flex flex-col items-center">
                        <img src={app.icon} alt={app.title} className="w-20 h-20 mb-4" />
                        <h2 className="text-xl font-bold text-white mb-1">{app.title}</h2>
                        <p className="text-white/60 text-sm mb-6">Version 2.0.0 • 45 MB</p>

                        <div className="w-full grid grid-cols-2 gap-3 mb-6">
                            <div className="bg-white/10 rounded-xl p-3 text-center">
                                <div className="text-white font-bold">0</div>
                                <div className="text-xs text-white/50">Notifications</div>
                            </div>
                            <div className="bg-white/10 rounded-xl p-3 text-center">
                                <div className="text-white font-bold">None</div>
                                <div className="text-xs text-white/50">Permissions</div>
                            </div>
                        </div>

                        <div className="flex gap-3 w-full">
                            <button
                                className="flex-1 py-2 rounded-full border border-white/20 text-white font-medium"
                                onClick={onClose}
                            >
                                Close
                            </button>
                            <button
                                className="flex-1 py-2 rounded-full bg-[#8AB4F8] text-black font-medium"
                                onClick={() => {
                                    onOpenApp(app.id);
                                    onClose();
                                }}
                            >
                                Open
                            </button>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-[70]"
                onClick={onClose}
            />

            {/* Menu */}
            <div
                className="fixed z-[80] bg-[#2D2D30] rounded-2xl shadow-2xl overflow-hidden min-w-[200px] context-menu"
                style={{
                    left: Math.min(position.x, window.innerWidth - 220),
                    top: Math.min(position.y, window.innerHeight - 300),
                }}
            >
                {/* App header */}
                <div className="flex items-center gap-3 p-3 border-b border-white/10">
                    <img
                        src={app.icon}
                        alt={app.title}
                        className="w-10 h-10 rounded-xl"
                    />
                    <span className="text-white font-medium text-sm">{app.title}</span>
                </div>

                {/* Menu items */}
                <div className="py-1">
                    {menuItems.map((item, index) => (
                        <button
                            key={index}
                            onClick={item.action}
                            className={`
                                w-full flex items-center gap-3 px-4 py-3
                                hover:bg-white/10 transition-colors
                                ${item.destructive ? 'text-red-400' : 'text-white'}
                            `}
                        >
                            {item.icon}
                            <span className="text-sm">{item.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </>
    );
}
