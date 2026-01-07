import React, { useState, useEffect } from 'react';
import { db } from '../../config/firebase';
import { ref, onValue } from 'firebase/database';

const BASE_VISITOR_COUNT = 10567;

export function VisitorStats() {
    const [stats, setStats] = useState({
        live: 0,
        total: BASE_VISITOR_COUNT
    });
    const [recentViewers, setRecentViewers] = useState([]);

    useEffect(() => {
        const liveRef = ref(db, 'site_stats/live_viewers');
        const totalRef = ref(db, 'site_stats/total_visitors');

        const unsubLive = onValue(liveRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const now = Date.now();
                // Filter out sessions older than 2 minutes
                const sessions = Object.values(data).filter(s => (now - s.timestamp) < 120000);
                setStats(prev => ({ ...prev, live: sessions.length }));
                setRecentViewers(sessions.sort((a, b) => b.timestamp - a.timestamp).slice(0, 5));
            } else {
                setStats(prev => ({ ...prev, live: 0 }));
                setRecentViewers([]);
            }
        }, (error) => {
            console.error("Firebase VisitorStats (live) error:", error);
        });

        const unsubTotal = onValue(totalRef, (snapshot) => {
            if (snapshot.exists()) {
                setStats(prev => ({ ...prev, total: BASE_VISITOR_COUNT + snapshot.val() }));
            } else {
                setStats(prev => ({ ...prev, total: BASE_VISITOR_COUNT }));
            }
        }, (error) => {
            console.error("Firebase VisitorStats (total) error:", error);
        });

        return () => {
            unsubLive();
            unsubTotal();
        };
    }, []);

    const StatCard = ({ label, value, color, icon }) => (
        <div className="flex flex-col items-center justify-center p-6 bg-gray-900 bg-opacity-40 rounded-2xl border border-gray-700 backdrop-blur-md transform transition-all hover:scale-105 hover:bg-opacity-60 group">
            <div className={`text-4xl mb-4 ${color} group-hover:scale-110 transition-transform duration-300`}>
                {icon}
            </div>
            <div className="text-sm font-medium text-gray-400 uppercase tracking-widest mb-2">{label}</div>
            <div className="text-5xl font-bold text-white tabular-nums tracking-tighter animate-pulse-subtle">
                {value.toLocaleString()}
            </div>
        </div>
    );

    return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-ub-grey to-gray-800 p-8 text-white select-none">
            <div className="max-w-4xl w-full">
                <header className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 mb-2">
                        Portfolio Insights
                    </h1>
                    <p className="text-gray-400 text-lg">Real-time engagement analytics</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <StatCard
                        label="Live Viewers"
                        value={stats.live}
                        color="text-green-400"
                        icon={
                            <div className="relative">
                                <div className="absolute inset-0 bg-green-400 blur-lg opacity-20"></div>
                                👥
                            </div>
                        }
                    />
                    <StatCard
                        label="Total Visitors"
                        value={stats.total}
                        color="text-blue-400"
                        icon={
                            <div className="relative">
                                <div className="absolute inset-0 bg-blue-400 blur-lg opacity-20"></div>
                                🚀
                            </div>
                        }
                    />
                </div>

                {recentViewers.length > 0 && (
                    <div className="mt-12 w-full animate-fade-in">
                        <h2 className="text-xl font-bold text-gray-300 mb-4 px-2 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            Recent Activity
                        </h2>
                        <div className="space-y-3">
                            {recentViewers.map((viewer, idx) => (
                                <div key={idx} className="flex items-center justify-between p-4 bg-gray-800 bg-opacity-30 rounded-xl border border-gray-700 hover:bg-opacity-50 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xl">
                                            {viewer.platform?.includes('Win') ? '🪟' : viewer.platform?.includes('Mac') ? '🍎' : '🐧'}
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-white uppercase tracking-tight">
                                                Active Session
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                {viewer.browser} on {viewer.platform}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs font-mono text-green-400">JOINED {viewer.joinedAt}</div>
                                        <div className="text-[10px] text-gray-500 uppercase tracking-tighter">Real-time Connection</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <footer className="mt-12 text-center text-gray-500 text-sm animate-fade-in">
                    <div className="flex items-center justify-center gap-2">
                        <span className="flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        Live updates enabled
                    </div>
                </footer>
            </div>
        </div>
    );
}

export default VisitorStats;
