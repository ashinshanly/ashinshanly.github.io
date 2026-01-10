import React, { useState, useEffect } from 'react';
import Ubuntu from '../ubuntu';
import AndroidHome from './AndroidHome';
import { db } from '../../config/firebase';
import { ref, onValue, set, onDisconnect, increment, runTransaction } from 'firebase/database';

const MOBILE_BREAKPOINT = 768;

export default function AndroidWrapper() {
    const [isMobile, setIsMobile] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        // Check initial viewport
        const checkMobile = () => {
            setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
        };

        checkMobile();
        setIsLoaded(true);

        // Listen for resize events
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        let presenceRef = null;
        let heartbeatInterval = null;

        const trackVisitors = () => {
            // 1. Session tracking for Total Visitors
            const visitorCounted = sessionStorage.getItem('visitor_counted');
            if (!visitorCounted) {
                const totalVisitorsRef = ref(db, 'site_stats/total_visitors');
                runTransaction(totalVisitorsRef, (currentValue) => {
                    return (currentValue || 0) + 1;
                }).catch(err => console.error("Total Visitors transaction failed:", err));
                sessionStorage.setItem('visitor_counted', 'true');
            }

            // 2. Presence tracking for Live Viewers
            // Use sessionStorage to keep the same sessionId across reloads but unique to the tab
            let sessionId = sessionStorage.getItem('session_id');
            if (!sessionId) {
                sessionId = Math.random().toString(36).substring(2, 11);
                sessionStorage.setItem('session_id', sessionId);
            }

            presenceRef = ref(db, `site_stats/live_viewers/${sessionId}`);

            const updatePresence = () => {
                const sessionData = {
                    timestamp: Date.now(),
                    browser: navigator.userAgent.split(' ')[0],
                    platform: navigator.platform,
                    joinedAt: new Date().toLocaleTimeString(),
                    isLive: true
                };

                set(presenceRef, sessionData).catch(err => console.error("Presence update failed:", err));
            };

            // Initial set
            updatePresence();
            onDisconnect(presenceRef).remove().catch(err => console.error("onDisconnect failed:", err));

            // Heartbeat every 60 seconds to keep session alive and update timestamp
            heartbeatInterval = setInterval(updatePresence, 60000);
        };

        trackVisitors();

        return () => {
            if (presenceRef) {
                set(presenceRef, null).catch(err => console.error("Cleanup set failed:", err));
            }
            if (heartbeatInterval) {
                clearInterval(heartbeatInterval);
            }
        };
    }, []);

    // Prevent flash of wrong interface
    if (!isLoaded) {
        return (
            <div className="w-screen h-screen bg-black flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    // Render appropriate interface based on viewport
    return isMobile ? <AndroidHome /> : <Ubuntu />;
}
