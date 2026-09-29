import React, { useState, useEffect, useCallback } from 'react';
import SideBarApp from '../base/side_bar_app';

const renderApps = (props, dimensions) => {
    let sideBarAppsJsx = [];
    props.apps.forEach((app, index) => {
        if (props.favourite_apps[app.id] === false) return;
        sideBarAppsJsx.push(
            <SideBarApp
                key={index}
                id={app.id}
                title={app.title}
                icon={app.icon}
                custom_icon={app.custom_icon}
                isClose={props.closed_windows}
                isFocus={props.focused_windows}
                openApp={props.openAppByAppId}
                isMinimized={props.isMinimized}
                openFromMinimised={props.openFromMinimised}
                dimensions={dimensions}
            />
        );
    });
    return sideBarAppsJsx;
};

export default function SideBar(props) {
    const [dimensions, setDimensions] = useState({
        itemSize: 38,
        iconSize: 24,
        marginY: 2,
        dockWidth: 48,
        dotSize: 3,
        slotHeight: 42,
    });

    const updateDimensions = useCallback(() => {
        if (typeof window === 'undefined') return;
        const windowHeight = window.innerHeight;
        // Top navbar height is ~28px, bottom padding is ~6px
        const navbarHeight = 28;
        const bottomSafetyPadding = 6;
        const availableHeight = Math.max(180, windowHeight - navbarHeight - bottomSafetyPadding);

        // Count visible favourite apps + 1 for AllApps button
        const visibleApps = props.apps.filter(app => props.favourite_apps[app.id] !== false);
        const totalItems = Math.max(1, visibleApps.length + 1);

        // Height available per slot (item + top & bottom margin)
        const rawSlot = availableHeight / totalItems;
        const slotHeight = Math.min(46, Math.max(16, rawSlot));

        // Margin Y: scales with slot height
        const marginY = slotHeight >= 42 ? 3 : slotHeight >= 30 ? 2 : 1;

        // Item container button size (square)
        const itemSize = Math.max(15, Math.min(40, Math.floor(slotHeight - (marginY * 2))));

        // Icon image size inside the button
        const iconSize = Math.max(11, Math.min(26, Math.round(itemSize * 0.68)));

        // Dock total width: proportional to item size with comfortable padding
        const dockWidth = Math.max(32, Math.min(52, itemSize + 12));

        // Open indicator dot size
        const dotSize = itemSize >= 34 ? 4 : itemSize >= 24 ? 3 : 2;

        setDimensions({
            itemSize,
            iconSize,
            marginY,
            dockWidth,
            dotSize,
            slotHeight,
        });
    }, [props.apps, props.favourite_apps]);

    useEffect(() => {
        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        return () => window.removeEventListener('resize', updateDimensions);
    }, [updateDimensions]);

    function showSideBar() {
        props.hideSideBar(null, false);
    }

    function hideSideBar() {
        setTimeout(() => {
            props.hideSideBar(null, true);
        }, 2000);
    }

    return (
        <>
            {/* Desktop Left Dock */}
            <div
                className={
                    (props.hide ? " -translate-x-full " : "") +
                    " absolute top-0 left-0 h-full transform duration-300 select-none z-40 " +
                    " flex flex-col justify-start items-center border-r border-black border-opacity-40 bg-black/60 backdrop-blur-md " +
                    " pt-7 pb-1"
                }
                style={{
                    width: `${dimensions.dockWidth}px`,
                    '--dock-item-size': `${dimensions.itemSize}px`,
                    '--dock-icon-size': `${dimensions.iconSize}px`,
                    '--dock-margin-y': `${dimensions.marginY}px`,
                    '--dock-width': `${dimensions.dockWidth}px`,
                    '--dock-dot-size': `${dimensions.dotSize}px`,
                    maxHeight: '100vh',
                    overflow: 'hidden',
                }}
            >
                {/* Apps container - strictly contained so it never overflows */}
                <div
                    className="flex flex-col items-center w-full overflow-hidden flex-shrink-0"
                    style={{
                        maxHeight: `calc(100vh - 28px - ${dimensions.itemSize + dimensions.marginY * 2}px - 6px)`,
                    }}
                >
                    {
                        Object.keys(props.closed_windows).length !== 0
                            ? renderApps(props, dimensions)
                            : null
                    }
                </div>
                <AllApps showApps={props.showAllApps} dimensions={dimensions} />
            </div>
            {/* Hover area for revealing hidden sidebar */}
            <div
                onMouseEnter={showSideBar}
                onMouseLeave={hideSideBar}
                className="w-1.5 h-full absolute top-0 left-0 bg-transparent z-50 pointer-events-auto"
            />
        </>
    );
}

export function AllApps(props) {
    const [title, setTitle] = useState(false);
    const itemSize = props.dimensions?.itemSize || 36;
    const iconSize = props.dimensions?.iconSize || 24;
    const marginY = props.dimensions?.marginY || 2;

    return (
        <div
            className="outline-none relative rounded hover:bg-white hover:bg-opacity-10 flex items-center justify-center flex-shrink-0 cursor-pointer transition-colors duration-150"
            style={{
                width: `${itemSize}px`,
                height: `${itemSize}px`,
                marginTop: 'auto',
                marginBottom: `${marginY}px`,
            }}
            onMouseEnter={() => setTitle(true)}
            onMouseLeave={() => setTitle(false)}
            onClick={props.showApps}
        >
            <div className="relative flex items-center justify-center w-full h-full">
                <img
                    style={{
                        width: `${iconSize}px`,
                        height: `${iconSize}px`,
                        objectFit: 'contain',
                    }}
                    src="./themes/Yaru/system/view-app-grid-symbolic.svg"
                    alt="Ubuntu view app"
                    draggable={false}
                />
                {title && (
                    <div className="pointer-events-none w-max py-1 px-2.5 absolute hidden md:block top-1/2 left-full ml-3 transform -translate-y-1/2 text-ubt-grey text-opacity-100 text-xs font-medium bg-ub-grey shadow-xl shadow-black/60 border-gray-500 border border-opacity-50 rounded-md z-50 backdrop-blur-sm">
                        Show Applications
                    </div>
                )}
            </div>
        </div>
    );
}