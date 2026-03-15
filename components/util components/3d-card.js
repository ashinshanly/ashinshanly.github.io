import React, { createContext, useState, useContext, useRef, useEffect } from "react";

const MouseEnterContext = createContext();

export const CardContainer = ({ children, className, containerClassName }) => {
    const containerRef = useRef(null);
    const [isMouseEntered, setIsMouseEntered] = useState(false);

    const handleMouseMove = (e) => {
        if (!containerRef.current) return;
        const { left, top, width, height } = containerRef.current.getBoundingClientRect();
        const x = (e.clientX - left - width / 2) / 25;
        const y = (e.clientY - top - height / 2) / 25;
        containerRef.current.style.transform = `rotateY(${x}deg) rotateX(${-y}deg)`;
    };

    const handleMouseEnter = (e) => {
        setIsMouseEntered(true);
        if (!containerRef.current) return;
    };

    const handleMouseLeave = (e) => {
        if (!containerRef.current) return;
        setIsMouseEntered(false);
        containerRef.current.style.transform = `rotateY(0deg) rotateX(0deg)`;
    };

    return (
        <MouseEnterContext.Provider value={[isMouseEntered, setIsMouseEntered]}>
            <div
                className={`flex items-center justify-center ${containerClassName}`}
                style={{
                    perspective: "1000px",
                }}
            >
                <div
                    ref={containerRef}
                    onMouseEnter={handleMouseEnter}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    className={`flex items-center justify-center relative transition-all duration-200 ease-linear ${className}`}
                    style={{
                        transformStyle: "preserve-3d",
                        pointerEvents: "auto",
                    }}
                >
                    {children}
                </div>
            </div>
        </MouseEnterContext.Provider>
    );
};

export const CardBody = ({ children, className }) => {
    return (
        <div
            className={`h-full w-full [transform-style:preserve-3d] >*:[transform-style:preserve-3d] pointer-events-none ${className}`}
        >
            {children}
        </div>
    );
};

export const CardItem = ({
    as: Tag = "div",
    children,
    className,
    translateX = 0,
    translateY = 0,
    translateZ = 0,
    rotateX = 0,
    rotateY = 0,
    rotateZ = 0,
    ...rest
}) => {
    const ref = useRef(null);
    const [isMouseEntered] = useMouseEnter();

    useEffect(() => {
        handleAnimations();
    }, [isMouseEntered]);

    const handleAnimations = () => {
        if (!ref.current) return;
        if (isMouseEntered) {
            ref.current.style.transform = `translateX(${translateX}px) translateY(${translateY}px) translateZ(${translateZ}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg)`;
        } else {
            ref.current.style.transform = `translateX(0px) translateY(0px) translateZ(0px) rotateX(0deg) rotateY(0deg) rotateZ(0deg)`;
        }
    };

    const handleClick = (e) => {
        if (Tag === "a" && rest.href) {
            e.preventDefault();
            e.stopPropagation();
            window.open(rest.href, rest.target || "_self");
        } else if (rest.onClick) {
            rest.onClick(e);
        }
    };

    return (
        <Tag
            ref={ref}
            className={`transition duration-200 ease-linear ${className}`}
            style={{ pointerEvents: Tag === "a" || Tag === "button" ? "auto" : "none" }}
            onClick={handleClick}
            {...rest}
        >
            {children}
        </Tag>
    );
};

export const useMouseEnter = () => {
    const context = useContext(MouseEnterContext);
    if (context === undefined) {
        throw new Error("useMouseEnter must be used within a MouseEnterProvider");
    }
    return context;
};
