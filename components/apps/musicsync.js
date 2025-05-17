import React, { useEffect } from 'react';

export function MusicSyncApp() {
    useEffect(() => {
        // Open the MusicSync app in a new tab when the component mounts
        window.open("https://ashinshanly.github.io/musicsync/", "_blank");
        
        // Signal to the parent (window manager) that this window should be closed
        if (window.addToStack) {
            const intervalID = setInterval(() => {
                try {
                    window.hideApp('musicsync');
                    window.setWallpaper(window.hideWindow('musicsync'));
                    clearInterval(intervalID);
                } catch (error) {
                    // Console logging for debugging
                    console.log('Waiting for methods to be available...');
                }
            }, 100);
        }
    }, []);
    
    // Return null to not render anything while we wait for window to close
    return null;
}

export function displayMusicSync() {
    return <MusicSyncApp />;
}

export default displayMusicSync;
