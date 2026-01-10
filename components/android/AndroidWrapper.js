import React, { useState, useEffect } from 'react';
import Ubuntu from '../ubuntu';
import AndroidHome from './AndroidHome';

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
