import React, { useState, useRef, useEffect } from 'react';

export default function LockScreen({ isLocked, onUnlock, time }) {
    const [startY, setStartY] = useState(0);
    const [currentY, setCurrentY] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef(null);

    const unlockThreshold = -150; // swipe up by 150px to unlock
    
    useEffect(() => {
        if (!isLocked) {
             setCurrentY(0);
             setIsDragging(false);
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

            {/* Simulated Notifications area could go here */}

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
