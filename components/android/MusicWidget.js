import React, { useState, useEffect, useRef } from 'react';
import { showToast } from './AndroidToast';

export default function MusicWidget() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const audioRef = useRef(null);

    // Sample audio
    const audioUrl = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";

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
        <div className="mx-4 mb-4 p-4 bg-[#2D2D30]/80 backdrop-blur-xl rounded-3xl border border-white/5 flex gap-4 items-center">
            <audio
                ref={audioRef}
                src={audioUrl}
                preload="auto"
                onError={(e) => {
                    console.error("Audio tag error:", e);
                    // setPlaying(false); // Can't define setPlaying if not used directly
                }}
            />

            {/* Album Art */}
            <div className={`
                w-20 h-20 rounded-2xl overflow-hidden shadow-lg relative flex-shrink-0
                ${isPlaying ? 'animate-pulse-subtle' : ''}
            `}>
                <img
                    src="./themes/Yaru/apps/spotify.png"
                    alt="Album Art"
                    className="w-full h-full object-cover"
                />

                {/* Playing indicator overlay */}
                {isPlaying && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center gap-1">
                        <div className="w-1 h-3 bg-white animate-bounce" style={{ animationDelay: '0s' }}></div>
                        <div className="w-1 h-5 bg-white animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-1 h-4 bg-white animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                )}
            </div>

            {/* Controls & Info */}
            <div className="flex-grow min-w-0">
                <div className="flex justify-between items-start mb-1">
                    <div>
                        <h3 className="text-white font-medium text-lg leading-tight truncate">SoundHelix Song 1</h3>
                        <p className="text-white/60 text-sm truncate">Demo Artist • Coding Mode</p>
                    </div>
                    <img src="./themes/Yaru/apps/spotify.png" alt="Source" className="w-5 h-5 rounded-full opacity-50" />
                </div>

                {/* Progress Bar (Squiggly Android 13 style simulated) */}
                <div className="h-1 bg-white/10 rounded-full mb-3 overflow-hidden">
                    <div
                        className="h-full bg-[#8AB4F8] rounded-full transition-all duration-200 ease-linear"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* Media Controls */}
                <div className="flex items-center justify-between px-2">
                    <button className="text-white/70 hover:text-white">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
                        </svg>
                    </button>

                    <button
                        className="w-10 h-10 bg-[#8AB4F8] text-[#1C1B1F] rounded-full flex items-center justify-center hover:scale-105 transition-transform"
                        onClick={togglePlay}
                    >
                        {isPlaying ? (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        )}
                    </button>

                    <button
                        className="text-white/70 hover:text-white"
                        onClick={() => {
                            if (audioRef.current) {
                                audioRef.current.currentTime = 0;
                                setProgress(0);
                            }
                        }}
                    >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
