import React, { useState, useRef, useEffect } from 'react';

export function Camera() {
    const videoRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [error, setError] = useState(null);
    const [capturedImage, setCapturedImage] = useState(null);
    const [cameraFacingMode, setCameraFacingMode] = useState('user'); // 'user' or 'environment'

    useEffect(() => {
        startCamera();
        return () => {
            stopCamera();
        };
    }, [cameraFacingMode]);

    // Re-attach stream to video element when it mounts (e.g. after retake)
    useEffect(() => {
        if (!capturedImage && videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [capturedImage, stream]);

    const startCamera = async () => {
        stopCamera();
        try {
            const constraints = {
                video: {
                    facingMode: cameraFacingMode
                }
            };
            const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
            setError(null);
        } catch (err) {
            console.error("Error accessing camera:", err);
            setError("Camera access denied or not available.");
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    const capturePhoto = () => {
        if (videoRef.current) {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const ctx = canvas.getContext('2d');

            // Flip horizontal if user facing mode (mirror effect)
            if (cameraFacingMode === 'user') {
                ctx.translate(canvas.width, 0);
                ctx.scale(-1, 1);
            }

            ctx.drawImage(videoRef.current, 0, 0);
            const dataUrl = canvas.toDataURL('image/png');
            setCapturedImage(dataUrl);
        }
    };

    const downloadPhoto = () => {
        if (capturedImage) {
            const link = document.createElement('a');
            link.href = capturedImage;
            link.download = `photo_${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const toggleCamera = () => {
        setCameraFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    };

    const retake = () => {
        setCapturedImage(null);
    };

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-full bg-black text-white p-4 text-center">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <p>{error}</p>
                <button
                    onClick={() => startCamera()}
                    className="mt-4 px-4 py-2 bg-white/20 rounded-full text-sm font-medium"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="relative h-full bg-black flex flex-col">
            {capturedImage ? (
                // Captured Image View
                <div className="flex-1 relative flex items-center justify-center bg-black">
                    <img src={capturedImage} alt="Captured" className="max-h-full max-w-full object-contain" />

                    <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-8">
                        <button
                            onClick={retake}
                            className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/30 transition-colors"
                        >
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <button
                            onClick={downloadPhoto}
                            className="w-14 h-14 rounded-full bg-blue-500 flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
                        >
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                        </button>
                    </div>
                </div>
            ) : (
                // Camera View
                <div className="flex-1 relative overflow-hidden">
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className={`w-full h-full object-cover ${cameraFacingMode === 'user' ? 'scale-x-[-1]' : ''}`}
                    />

                    {/* Controls Overlay */}
                    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6">
                        {/* Top controls */}
                        <div className="flex justify-between items-start pointer-events-auto">
                            {/* Add flash toggle here if desired later */}
                            <div></div>
                        </div>

                        {/* Bottom controls */}
                        <div className="flex items-center justify-between mb-8 pointer-events-auto">
                            <div className="w-12 h-12"></div> {/* Spacer */}

                            {/* Shutter Button */}
                            <button
                                onClick={capturePhoto}
                                className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center group active:scale-95 transition-transform"
                            >
                                <div className="w-16 h-16 bg-white rounded-full group-hover:bg-gray-100 transition-colors"></div>
                            </button>

                            {/* Flip Camera */}
                            <button
                                onClick={toggleCamera}
                                className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/60 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export const displayCamera = () => {
    return <Camera />;
}
