import React, { useState, useEffect, useRef } from 'react';
import { showToast } from './AndroidToast';

export default function MusicWidget() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const audioRef = useRef(null);

    // Sample audio
    const audioUrl = "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/e9/94/9d/e9949d01-f581-449b-dfa2-87a39ddebffd/mzaf_6930143096293021426.plus.aac.p.m4a";

    useEffect(() => {
        if (audioRef.current) {
            if (isPlaying) {
                const playPromise = audioRef.current.play();
                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        console.error("Audio play failed:", error);
                        setIsPlaying(false);
                        showToast("Failed to play music: " + error.message);
                    });
                }
            } else {
                audioRef.current.pause();
            }
        }
    }, [isPlaying]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const updateProgress = () => {
            if (audio.duration) {
                setProgress((audio.currentTime / audio.duration) * 100);
            }
        };

        const handleEnded = () => {
            setIsPlaying(false);
            setProgress(0);
        };

        const handleError = (e) => {
            console.error("Audio error:", e);
            setIsPlaying(false);
        };

        audio.addEventListener('timeupdate', updateProgress);
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('error', handleError);

        return () => {
            audio.removeEventListener('timeupdate', updateProgress);
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('error', handleError);
        };
    }, []);

    const togglePlay = () => {
        setIsPlaying(!isPlaying);
    };

    return (
        <div
            className="w-full rounded-3xl p-3 mb-2 relative overflow-hidden group"
            style={{
                background: 'rgba(20, 20, 30, 0.6)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                boxShadow: '0 8px 32px rgba(29, 185, 84, 0.15), inset 0 1px 0 rgba(255,255,255,0.05)'
            }}
        >
            {/* Animated gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/15 via-emerald-500/10 to-green-400/5 opacity-80 transition-all duration-1000"></div>

            {/* Scanline effect */}
            <div className="absolute inset-0 opacity-[0.03]" style={{
                backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)'
            }}></div>

            {/* Floating orb decoration */}
            <div
                className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full opacity-20 blur-2xl animate-pulse"
                style={{ background: 'radial-gradient(circle, rgba(29,185,84,0.4), transparent)' }}
            ></div>

            <audio
                ref={audioRef}
                src={audioUrl}
                preload="auto"
                onError={(e) => {
                    console.error("Audio tag error:", e);
                }}
            />

            <div className="relative z-10 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                {/* Album Art */}
                <div className={`w-14 h-14 rounded-2xl overflow-hidden shadow-md relative flex-shrink-0 bg-white/5 ${isPlaying ? 'animate-pulse-subtle' : ''}`}>
                    <img src="./themes/Yaru/apps/spotify.png" alt="Album Art" className="w-full h-full object-cover scale-110" />
                    {isPlaying && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-1 backdrop-blur-[1px]">
                            <div className="w-1 h-3 bg-white animate-bounce" style={{ animationDelay: '0s' }}></div>
                            <div className="w-1 h-5 bg-white animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-1 h-4 bg-white animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="flex-grow min-w-0 flex flex-col justify-center">
                    <div className="flex justify-between items-center mb-0.5">
                        <h3 className="text-white font-semibold text-base truncate" style={{ textShadow: '0 0 10px rgba(255,255,255,0.1)' }}>LOST IN THE WORLD</h3>
                        <svg className="w-4 h-4 text-[#1DB954] flex-shrink-0 drop-shadow-md" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424c-.18.295-.563.387-.857.207-2.35-1.434-5.305-1.76-8.786-.963-.335.077-.67-.133-.746-.469-.077-.335.132-.67.469-.746 3.809-.87 7.077-.496 9.713 1.115.293.179.387.562.207.856zm1.268-2.828c-.225.367-.704.482-1.071.258-2.687-1.65-6.785-2.131-9.965-1.166-.413.127-.84-.106-.967-.518-.126-.413.107-.84.52-.968 3.639-1.106 8.163-.563 11.225 1.323.367.226.482.704.258 1.071zm.105-2.949c-3.21-1.906-8.506-2.083-11.564-1.155-.494.15-1.016-.129-1.166-.623-.149-.495.13-1.016.624-1.167 3.504-1.066 9.351-.864 13.064 1.341.442.264.582.836.319 1.278-.264.443-.836.584-1.277.326z"/>
                        </svg>
                    </div>
                    <p className="text-white/50 text-sm truncate font-medium tracking-wide uppercase">Kanye West</p>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full flex items-center gap-2">
                <span className="text-[10px] text-white/50 font-medium">0:00</span>
                <div className="flex-grow h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-white rounded-full transition-all duration-200 ease-linear relative" style={{ width: `${progress}%` }}></div>
                </div>
                <span className="text-[10px] text-white/50 font-medium">-3:42</span>
            </div>

            {/* Media Controls */}
            <div className="flex items-center justify-center gap-6 mt-0">
                <button className="text-white/50 hover:text-white transition-colors" onClick={() => { if (audioRef.current) { audioRef.current.currentTime = 0; setProgress(0); } }}>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M7 6c.55 0 1 .45 1 1v10c0 .55-.45 1-1 1s-1-.45-1-1V7c0-.55.45-1 1-1zm3.66 6.82l5.77 4.07c.66.47 1.58-.01 1.58-.82V7.93c0-.81-.91-1.28-1.58-.82l-5.77 4.07c-.57.4-.57 1.24 0 1.64z"/></svg>
                </button>

                <button className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-lg" onClick={togglePlay}>
                    {isPlaying ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 19c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2s-2 .9-2 2v10c0 1.1.9 2 2 2zm6-12v10c0 1.1.9 2 2 2s2-.9 2-2V7c0-1.1-.9-2-2-2s-2 .9-2 2z"/></svg>
                    ) : (
                        <svg className="w-5 h-5 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 6.82v10.36c0 .79.87 1.27 1.54.84l8.14-5.18c.62-.39.62-1.29 0-1.69L9.54 5.98C8.87 5.55 8 6.03 8 6.82z"/></svg>
                    )}
                </button>

                <button className="text-white/50 hover:text-white transition-colors" onClick={() => { if (audioRef.current) { audioRef.current.currentTime = 0; setProgress(0); } }}>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M7.58 16.89l5.77-4.07c.56-.4.56-1.24 0-1.63L7.58 7.11C6.91 6.65 6 7.12 6 7.93v8.14c0 .81.91 1.28 1.58.82zM16 7v10c0 .55.45 1 1 1s1-.45 1-1V7c0-.55-.45-1-1-1s-1 .45-1 1z"/></svg>
                </button>
            </div>
            </div>
         </div>
    );
}
