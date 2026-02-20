import React, { useState, useRef, useEffect } from 'react';

export default function LockScreen({ isLocked, onUnlock, time }) {
    const [startY, setStartY] = useState(0);
    const [currentY, setCurrentY] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef(null);

    const unlockThreshold = -150; // swipe up by 150px to unlock

    const [selectedNotifications, setSelectedNotifications] = useState([]);

    const notificationsPool = [
        {
            app: "GitHub",
            title: "GitHub",
            time: "2m",
            icon: (
                <div className="glass-notification-icon" style={{ background: 'linear-gradient(135deg, #333 0%, #111 100%)' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                </div>
            ),
            content: <><strong>Linus Torvalds</strong> starred your repository <strong>portfolio</strong></>
        },
        {
            app: "LinkedIn",
            title: "LinkedIn",
            time: "12m",
            icon: (
                <div className="glass-notification-icon" style={{ background: 'linear-gradient(135deg, #0A66C2 0%, #004182 100%)' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                </div>
            ),
            content: <><strong>Elon Musk</strong> sent a message: "Bro where you at? Need you to fix the rocket's CSS asap..."</>
        },
        {
            app: "Google",
            title: "Google Recruiter",
            time: "3m",
            icon: (
                <div className="glass-notification-icon" style={{ background: '#ffffff' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                </div>
            ),
            content: <>We loved your portfolio! Can you invert a binary tree though?</>
        },
        {
            app: "Messages",
            title: "Messages",
            time: "2m",
            icon: (
                <div className="glass-notification-icon" style={{ background: 'linear-gradient(135deg, #34C759 0%, #28cd41 100%)' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                        <path d="M12 2C6.477 2 2 6.134 2 11.232c0 2.872 1.488 5.434 3.791 7.152a9.69 9.69 0 0 1-2.924 3.326c-.443.277.017.962.49.803 3.094-1.037 5.163-2.17 6.326-3.033A10.875 10.875 0 0 0 12 20.464c5.523 0 10-4.134 10-9.232S17.523 2 12 2z" />
                    </svg>
                </div>
            ),
            content: <><strong>Tim Cook</strong>: "Ashin, can you come fix Siri?"</>
        }
    ];

    useEffect(() => {
        if (!isLocked) {
            setCurrentY(0);
            setIsDragging(false);
        } else {
            // When lock screen shows, populate new random notifications
            const shuffled = [...notificationsPool].sort(() => 0.5 - Math.random());
            setSelectedNotifications(shuffled.slice(0, 2));
        }
    }, [isLocked]);

    const handleTouchStart = (e) => {
        setStartY(e.touches ? e.touches[0].clientY : e.clientY);
        setIsDragging(true);
    };

    const handleTouchMove = (e) => {
        if (!isDragging) return;
        const y = e.touches ? e.touches[0].clientY : e.clientY;
        const delta = y - startY;

        // Only allow upward swiping
        if (delta < 0) {
            setCurrentY(delta);
        }
    };

    const handleTouchEnd = () => {
        if (!isDragging) return;
        setIsDragging(false);

        if (currentY < unlockThreshold) {
            onUnlock();
        } else {
            // Snap back
            setCurrentY(0);
        }
    };

    if (!isLocked && currentY === 0 && !isDragging) return null;

    const opac = Math.max(0, 1 - Math.abs(currentY) / 300);
    const blur = Math.max(0, 20 - Math.abs(currentY) / 10);

    const timeStr = time.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: false
    }).replace(' ', '');

    const dateStr = time.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric'
    });

    return (
        <div
            ref={containerRef}
            className={`android-lock-screen ${!isLocked ? 'unlocking' : ''}`}
            style={{
                transform: `translateY(${currentY}px)`,
                transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.3s',
                opacity: isLocked ? opac : 0,
                backdropFilter: `blur(${blur}px)`,
                WebkitBackdropFilter: `blur(${blur}px)`,
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleTouchStart}
            onMouseMove={handleTouchMove}
            onMouseUp={handleTouchEnd}
            onMouseLeave={handleTouchEnd}
        >
            <div className="lock-clock-container" style={{ opacity: opac }}>
                <div className="lock-time">{timeStr}</div>
                <div className="lock-date">{dateStr}</div>
            </div>

            <div className="lock-notifications" style={{ opacity: opac, transform: `translateY(${Math.min(0, currentY / 3)}px)` }}>
                {selectedNotifications.map((notif, index) => (
                    <div key={notif.app + index} className="glass-notification">
                        <div className="glass-notification-header">
                            {notif.icon}
                            <span className="glass-notification-title">{notif.title}</span>
                            <span className="glass-notification-time">{notif.time}</span>
                        </div>
                        <div className="glass-notification-content">
                            {notif.content}
                        </div>
                    </div>
                ))}
            </div>

            <div className="lock-hint" style={{ opacity: opac }}>
                <div className="lock-hint-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                </div>
                <span>Swipe up to open</span>
            </div>
        </div>
    );
}
