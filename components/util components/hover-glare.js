"use client";
import { useRef, useState, useEffect } from "react";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";

export const HoverGlare = ({ children, className }) => {
    const containerRef = useRef(null);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const [isHovered, setIsHovered] = useState(false);

    function handleMouseMove({ currentTarget, clientX, clientY }) {
        const { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }

    return (
        <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`group relative overflow-hidden rounded-md border border-white border-opacity-10 bg-black/20 m-1 transition-transform duration-300 hover:scale-105 hover:bg-black/40 ${className}`}
        >
            <motion.div
                className="pointer-events-none absolute -inset-[100%] opacity-0 transition duration-300 group-hover:opacity-100"
                style={{
                    background: useMotionTemplate`
            radial-gradient(
              150px circle at ${mouseX}px ${mouseY}px,
              rgba(255,255,255,0.4),
              transparent 80%
            )
          `,
                }}
            />
            <div className="relative z-10 flex h-full w-full items-center justify-center pointer-events-none">
                {children}
            </div>
        </div>
    );
};
