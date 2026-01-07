import React, { useState, useEffect } from 'react';
import { db } from '../../config/firebase';
import { ref, onValue } from 'firebase/database';

export function VisitorIcon(props) {
    const [liveCount, setLiveCount] = useState(0);

    useEffect(() => {
        const liveRef = ref(db, 'site_stats/live_viewers');
        const unsub = onValue(liveRef, (snapshot) => {
            if (snapshot.exists()) {
                setLiveCount(Object.keys(snapshot.val()).length);
            } else {
                setLiveCount(0);
            }
        }, (error) => {
            console.error("Firebase VisitorIcon error:", error);
            setLiveCount(0);
        });

        return () => unsub();
    }, []);

    const isSidebar = props.size === 'sidebar';
    const imgSize = isSidebar ? "w-7" : "w-10";
    const badgeSize = isSidebar ? "text-[8px] px-1 py-0" : "text-[10px] px-1.5 py-0.5";

    return (
        <div className={`relative w-full h-full flex flex-col items-center justify-center ${isSidebar ? 'p-0' : ''}`}>
            <div className="relative group">
                <div className={`absolute inset-0 bg-blue-500 rounded-full blur-md opacity-0 group-hover:opacity-20 transition-opacity duration-300`}></div>
                <img
                    className={`${imgSize} relative transition-transform duration-300 group-hover:scale-110`}
                    src="./themes/Yaru/apps/illuminati.png"
                    alt="Visitor Stats"
                />
                {liveCount > 0 && (
                    <div className={`absolute -top-1.5 -right-2 bg-gradient-to-r from-red-600 to-red-500 text-white font-black rounded-full border-2 border-white shadow-lg animate-pulse-subtle flex items-center justify-center min-w-[18px] h-[18px] ${badgeSize}`}>
                        {liveCount}
                    </div>
                )}
            </div>
            {!isSidebar && <span className="text-white text-[10px] sm:text-xs mt-1 font-medium tracking-tight">Visitor Stats</span>}
        </div>
    );
}

export default VisitorIcon;
