import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export const SideBarApp = (props) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isScaling, setIsScaling] = useState(false);

    const handleOpenApp = () => {
        if (!props.isMinimized[props.id] && props.isClose[props.id]) {
            setIsScaling(true);
            setTimeout(() => setIsScaling(false), 1000);
        }
        props.openApp(props.id);
        setIsHovered(false);
    };

    const isAppFocused = props.isClose[props.id] === false && props.isFocus[props.id];
    const isAppOpen = props.isClose[props.id] === false;

    const itemSize = props.dimensions?.itemSize || 36;
    const iconSize = props.dimensions?.iconSize || 24;
    const marginY = props.dimensions?.marginY || 2;
    const dotSize = props.dimensions?.dotSize || 3;

    return (
        <motion.div
            tabIndex="0"
            onClick={handleOpenApp}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            whileHover={{ scale: 1.18 }}
            whileTap={{ scale: 0.94 }}
            transition={{ type: "spring", stiffness: 350, damping: 22 }}
            className={`outline-none relative flex justify-center items-center hover:bg-white hover:bg-opacity-10 rounded-lg cursor-pointer ${isAppFocused ? "bg-white bg-opacity-10" : ""}`}
            id={"sidebar-" + props.id}
            style={{
                width: `${itemSize}px`,
                height: `${itemSize}px`,
                marginTop: `${marginY}px`,
                marginBottom: `${marginY}px`,
                overflow: 'visible',
                zIndex: isHovered ? 45 : 1,
            }}
        >
            {/* The Icon */}
            <div
                className="relative flex items-center justify-center pointer-events-none"
                style={{
                    width: `${iconSize}px`,
                    height: `${iconSize}px`,
                }}
            >
                {props.custom_icon ? (
                    <props.custom_icon
                        size="sidebar"
                        style={{
                            width: `${iconSize}px`,
                            height: `${iconSize}px`,
                        }}
                    />
                ) : (
                    <>
                        <img
                            style={{
                                width: `${iconSize}px`,
                                height: `${iconSize}px`,
                                objectFit: 'contain',
                            }}
                            src={props.icon}
                            alt="Ubuntu App Icon"
                            draggable={false}
                        />
                        <img
                            className={`${isScaling ? "scale" : ""} scalable-app-icon absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2`}
                            style={{
                                width: `${iconSize}px`,
                                height: `${iconSize}px`,
                                objectFit: 'contain',
                            }}
                            src={props.icon}
                            alt=""
                            draggable={false}
                        />
                    </>
                )}
            </div>

            {/* The dot indicating the app is open */}
            {isAppOpen && (
                <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 bg-ub-orange rounded-r-full"
                    style={{
                        width: `${dotSize}px`,
                        height: `${Math.round(dotSize * 1.6)}px`,
                    }}
                />
            )}

            {/* The Tooltip */}
            <AnimatePresence>
                {isHovered && (
                    <motion.div
                        initial={{ opacity: 0, x: -8, scale: 0.85 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -8, scale: 0.85 }}
                        transition={{ type: "spring", stiffness: 350, damping: 25 }}
                        className="pointer-events-none absolute top-1/2 left-full ml-3 transform -translate-y-1/2 w-max py-1 px-2.5 text-ubt-grey text-opacity-100 text-xs font-medium bg-ub-grey shadow-xl shadow-black/60 border-gray-500 border border-opacity-50 rounded-md z-50 backdrop-blur-sm"
                    >
                        <div className="absolute inset-y-0 left-[-4px] w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-r-[4px] border-r-gray-500/50 transform translate-y-1/2" />
                        {props.title}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default SideBarApp;
