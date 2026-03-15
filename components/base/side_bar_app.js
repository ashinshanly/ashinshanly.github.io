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

    return (
        <motion.div
            tabIndex="0"
            onClick={handleOpenApp}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            whileHover={{ scale: 1.5 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={`w-10 h-10 p-1.5 outline-none relative flex justify-center items-center hover:bg-white hover:bg-opacity-10 rounded-lg m-1 ${isAppFocused ? "bg-white bg-opacity-10" : ""}`}
            id={"sidebar-" + props.id}
            style={{ overflow: 'visible' }}
        >
            {/* The Icon */}
            <div className="relative flex items-center justify-center w-full h-full">
                {props.custom_icon ? (
                    <props.custom_icon size="sidebar" />
                ) : (
                    <>
                        <img className="w-7 h-7" src={props.icon} alt="Ubuntu App Icon" />
                        <img className={`${isScaling ? "scale" : ""} scalable-app-icon w-7 h-7 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2`} src={props.icon} alt="" />
                    </>
                )}
            </div>

            {/* The dot indicating the app is open */}
            {isAppOpen && (
                <div className="w-1 h-1 absolute left-0 top-1/2 -translate-y-1/2 bg-ub-orange rounded-sm"></div>
            )}

            {/* The Tooltip */}
            <AnimatePresence>
                {isHovered && (
                    <motion.div
                        initial={{ opacity: 0, x: -10, scale: 0.8 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -10, scale: 0.8 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="pointer-events-none absolute top-1/2 left-full ml-3 transform -translate-y-1/2 w-max py-1 px-2.5 text-ubt-grey text-opacity-100 text-sm bg-ub-grey shadow-xl shadow-black/50 border-gray-500 border border-opacity-50 rounded-md z-50 backdrop-blur-sm"
                    >
                        <div className="absolute inset-y-0 left-[-4px] w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-r-[4px] border-r-gray-500/50 transform translate-y-1/2"></div>
                        {props.title}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default SideBarApp;
