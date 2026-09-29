import React from 'react';

export function VisitorIcon(props = {}) {
    const isSidebar = props?.size === 'sidebar';
    const imgSize = isSidebar ? "w-7" : "w-10";

    return (
        <div
            className={`relative w-full h-full flex flex-col items-center justify-center ${isSidebar ? 'p-0' : ''}`}
            style={props.style || {}}
        >
            <div className="relative group flex items-center justify-center w-full h-full">
                <div className={`absolute inset-0 bg-blue-500 rounded-full blur-md opacity-0 group-hover:opacity-20 transition-opacity duration-300`}></div>
                <img
                    className={`${isSidebar ? 'w-full h-full object-contain' : imgSize} relative transition-transform duration-300 group-hover:scale-110`}
                    src="./themes/Yaru/apps/illuminati.png"
                    alt="Visitor Stats"
                    style={props.style || {}}
                    draggable={false}
                />
            </div>
            {!isSidebar && <span className="text-white text-[10px] sm:text-xs mt-1 font-medium tracking-tight">Visitor Stats</span>}
        </div>
    );
}

export default VisitorIcon;
