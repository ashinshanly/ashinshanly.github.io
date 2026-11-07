import React, { useRef, useState } from 'react';

export default function GestureNavBar({ onSwipeUp, onHome }) {
    const touchStartY = useRef(0);
    const [isPressed, setIsPressed] = useState(false);

    const handleTouchStart = (e) => {
        e.stopPropagation();
        setIsPressed(true);
        if (e.touches && e.touches.length > 0) {
            touchStartY.current = e.touches[0].clientY;
        }
    };

    const handleTouchEnd = (e) => {
        e.stopPropagation();
        setIsPressed(false);
        if (!e.changedTouches || e.changedTouches.length === 0) return;
        const touchEndY = e.changedTouches[0].clientY;
        const deltaY = touchStartY.current - touchEndY;

        if (deltaY > 25) {
            if (onSwipeUp) onSwipeUp();
        } else if (Math.abs(deltaY) < 12) {
            if (onHome) onHome();
        }
    };

    return (
        <div
            className="gesture-nav-bar"
            style={
                isPressed
                    ? {
                          transform: 'translateX(-50%) translateY(-2px) scaleX(1.08)',
                          background: 'rgba(255, 255, 255, 0.95)',
                      }
                    : undefined
            }
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onClick={() => onHome && onHome()}
            onDoubleClick={(e) => {
                e.stopPropagation();
                if (onSwipeUp) onSwipeUp();
            }}
            role="button"
            aria-label="Gesture navigation pill - tap for Home, swipe up or double-click for Recents"
        />
    );
}
