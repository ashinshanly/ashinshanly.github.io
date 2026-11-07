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
        if (!db) return;
        let presenceRef = null;
        let heartbeatInterval = null;

        const trackVisitors = () => {
            try {
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

                const detectBrowser = (ua) => {
                    if (!ua) return 'Browser';
                    if (ua.includes('Edg/')) return 'Edge';
                    if (ua.includes('OPR/') || ua.includes('Opera')) return 'Opera';
                    if (ua.includes('Chrome/') && !ua.includes('Edg/')) return 'Chrome';
                    if (ua.includes('Firefox/')) return 'Firefox';
                    if (ua.includes('Safari/') && !ua.includes('Chrome/')) return 'Safari';
                    return 'Web Client';
                };

                const detectOS = (ua, platform) => {
                    const str = `${ua || ''} ${platform || ''}`;
                    if (/Android/i.test(str)) return 'Android';
                    if (/iPhone|iPad|iPod/i.test(str)) return 'iOS';
                    if (/Mac/i.test(str)) return 'macOS';
                    if (/Win/i.test(str)) return 'Windows';
                    if (/Linux/i.test(str)) return 'Linux';
                    return platform || 'Desktop';
                };

                const updatePresence = () => {
                    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
                    const plat = typeof navigator !== 'undefined' ? navigator.platform : '';
                    const tz =
                        typeof Intl !== 'undefined'
                            ? Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
                            : 'UTC';
                    const sessionData = {
                        timestamp: Date.now(),
                        browser: detectBrowser(ua),
                        platform: detectOS(ua, plat),
                        shell: window.innerWidth < MOBILE_BREAKPOINT ? 'Android 14 UI' : 'Ubuntu 24.04 UI',
                        timezone: tz,
                        screen: `${window.innerWidth}×${window.innerHeight}`,
                        joinedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        isLive: true
                    };

                    set(presenceRef, sessionData).catch(err => console.error("Presence update failed:", err));
                };

                // Initial set
                updatePresence();
                onDisconnect(presenceRef).remove().catch(err => console.error("onDisconnect failed:", err));

                // Heartbeat every 60 seconds to keep session alive and update timestamp
                heartbeatInterval = setInterval(updatePresence, 60000);
            } catch (e) {
                console.error("Tracking error:", e);
            }
        };

        trackVisitors();

        return () => {
            if (presenceRef && db) {
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
