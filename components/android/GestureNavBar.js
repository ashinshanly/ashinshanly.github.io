import React, { useRef } from 'react';

export default function GestureNavBar({ onSwipeUp, onHome }) {
    const touchStartY = useRef(0);

    const handleTouchStart = (e) => {
        e.stopPropagation();
        touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e) => {
        e.stopPropagation();
        const touchEndY = e.changedTouches[0].clientY;
        const deltaY = touchStartY.current - touchEndY;

        if (deltaY > 30) {
            onSwipeUp && onSwipeUp();
        } else if (Math.abs(deltaY) < 10) {
            // Tap on the bar - go home
            onHome && onHome();
        }
    };

    return (
        <div
            className="gesture-nav-bar"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onClick={() => onHome && onHome()}
        />
    );
}
