import React, { useRef, useEffect } from 'react';

const VideoWallpaper = ({ videoSrc = "/images/wallpapers/nebula-live-video.mp4" }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      // Ensure video plays automatically and loops
      video.play().catch(error => {
        console.log("Video autoplay failed:", error);
      });
    }
  }, []);

  return (
    <div className="absolute -z-10 top-0 right-0 overflow-hidden h-full w-full">
      <video
        ref={videoRef}
        className="object-cover w-full h-full"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
      >
        <source src={videoSrc} type="video/mp4" />
        {/* Fallback message */}
        <div className="w-full h-full bg-gradient-to-b from-indigo-900 to-purple-900 flex items-center justify-center">
          <p className="text-white text-center">
            Your browser does not support video wallpapers.
            <br />
            Using fallback background.
          </p>
        </div>
      </video>
    </div>
  );
};

export default VideoWallpaper;
