import React, { useState, useEffect, useCallback } from 'react';

// This is a singleton-like event emitter for Toasts
const toastEvents = {
    emit: null
};

export const showToast = (message) => {
    if (toastEvents.emit) {
        toastEvents.emit(message);
    }
};

export default function AndroidToast() {
    const [toasts, setToasts] = useState([]);

    useEffect(() => {
        toastEvents.emit = (message) => {
            const id = Date.now();
            setToasts(prev => [...prev, { id, message }]);

            // Auto remove after 3s
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== id));
            }, 3000);
        };

        return () => {
            toastEvents.emit = null;
        };
    }, []);

    return (
        <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-[200] flex flex-col items-center gap-2 pointer-events-none">
            {toasts.map(toast => (
                <div
                    key={toast.id}
                    className="bg-[#2D2D30] text-white px-6 py-3 rounded-full shadow-lg border border-white/10 text-sm font-medium animate-toast-slide-up"
                    style={{
                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                    }}
                >
                    {toast.message}
                </div>
            ))}
        </div>
    );
}
