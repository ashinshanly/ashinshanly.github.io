"use client";
import React from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

export const AnimatedBorder = ({
    children,
    className,
    containerClassName,
    borderClassName,
    duration = 3,
    rx = "12px",
    ry = "12px",
}) => {
    return (
        <div
            className={cn(
                "relative overflow-hidden w-full h-full p-[2px]",
                containerClassName
            )}
        >
            <div
                className={cn(
                    "absolute inset-0 z-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent bg-opacity-20 opacity-80",
                    borderClassName
                )}
            >
                <motion.div
                    animate={{
                        rotate: 360,
                    }}
                    transition={{
                        duration: duration,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                    className="absolute inset[-200%] w-[200%] h-[200%] left-[-50%] top-[-50%] bg-[conic-gradient(from_0deg_at_50%_50%,#3b82f6_0deg,transparent_60deg,transparent_300deg,#06b6d4_360deg)]"
                />
            </div>
            <div
                className={cn(
                    "relative z-10 w-full h-full bg-black/80 backdrop-blur-3xl rounded-[10px] overflow-hidden",
                    className
                )}
            >
                {children}
            </div>
        </div>
    );
};
