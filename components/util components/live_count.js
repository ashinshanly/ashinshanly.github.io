import React, { useState, useEffect } from 'react';
import { db } from '../../config/firebase';
import { ref, onValue } from 'firebase/database';

export default function LiveCount() {
    const [count, setCount] = useState(0);

    useEffect(() => {
        const liveRef = ref(db, 'site_stats/live_viewers');
        const unsub = onValue(liveRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const now = Date.now();
                // Filter out sessions older than 2 minutes
                const activeSessions = Object.values(data).filter(s => (now - s.timestamp) < 120000);
                setCount(activeSessions.length);
            } else {
                setCount(0);
            }
        }, (error) => {
            console.error("Firebase LiveCount error:", error);
            setCount(0);
        });

        return () => unsub();
    }, []);

    // For development/debugging: show 0 if count is 0, but maybe keep it hidden if we want it clean
    // if (count <= 0) return null; 

    return (
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/20 hover:bg-black/30 transition-colors cursor-default group">
            <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </div>
            <span className="text-[11px] font-bold text-green-400 group-hover:text-green-300 transition-colors">
                {count} LIVE
            </span>
        </div>
    );
}
