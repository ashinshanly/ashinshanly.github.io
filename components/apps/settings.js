import React from 'react';
import $ from 'jquery';

export function Settings(props) {
    const wallpapers = {
        "wall-1": "./images/wallpapers/wall-1.webp",
        "wall-2": "./images/wallpapers/wall-2.webp",
        "wall-3": "./images/wallpapers/wall-3.webp",
        "wall-4": "./images/wallpapers/wall-4.webp",
        "wall-5": "./images/wallpapers/wall-5.webp",
        "wall-6": "./images/wallpapers/wall-6.webp",
        "wall-7": "./images/wallpapers/wall-7.webp",
        "wall-8": "./images/wallpapers/wall-8.webp",
    };

    let changeBackgroundImage = (e) => {
        props.changeBackgroundImage($(e.target).data("path"));
    }

    // Render the appropriate preview based on the current bg image
    const renderPreview = () => {
        if (props.currBgImgName === "video") {
            return (
                <div className="md:w-2/5 w-2/3 h-1/3 m-auto my-4 relative overflow-hidden rounded-lg">
                    <video
                        className="w-full h-full object-cover"
                        autoPlay
                        loop
                        muted
                        playsInline
                    >
                        <source src="/images/wallpapers/nebula-live-video.mp4" type="video/mp4" />
                    </video>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-white font-bold bg-black bg-opacity-50 px-3 py-1 rounded">Live Wallpaper</span>
                    </div>
                </div>
            );
        }
        if (props.currBgImgName === "animated") {
            return (
                <div className="md:w-2/5 w-2/3 h-1/3 m-auto my-4 bg-gradient-to-r from-indigo-800 via-purple-700 to-blue-800 animate-gradient-x">
                    <div className="w-full h-full flex items-center justify-center">
                        <span className="text-white font-bold">Cosmic Space</span>
                    </div>
                </div>
            );
        }
        return (
            <div className="md:w-2/5 w-2/3 h-1/3 m-auto my-4" style={{ backgroundImage: `url(${wallpapers[props.currBgImgName]})`, backgroundSize: "cover", backgroundRepeat: "no-repeat", backgroundPosition: "center center" }}>
            </div>
        );
    };

    return (
        <div className={"w-full flex-col flex-grow z-20 max-h-full overflow-y-auto windowMainScreen select-none bg-ub-cool-grey"}>
            {renderPreview()}
            <div className="flex flex-wrap justify-center items-center border-t border-gray-900 gap-2 p-2 md:gap-0 md:p-0">
                {/* Static wallpaper options */}
                {
                    Object.keys(wallpapers).map((name, index) => {
                        return (
                            <div key={index} tabIndex="1" onFocus={changeBackgroundImage} data-path={name} className={((name === props.currBgImgName) ? " border-yellow-700 " : " border-transparent ") + " md:px-28 md:py-20 md:m-4 m-1 px-10 py-8 outline-none border-4 border-opacity-80 rounded-lg"} style={{ backgroundImage: `url(${wallpapers[name]})`, backgroundSize: "cover", backgroundRepeat: "no-repeat", backgroundPosition: "center center" }}></div>
                        );
                    })
                }

                {/* Video wallpaper option */}
                <div
                    tabIndex="1"
                    onFocus={changeBackgroundImage}
                    data-path="video"
                    className={(("video" === props.currBgImgName) ? " border-yellow-700 " : " border-transparent ") + " md:px-28 md:py-20 md:m-4 m-2 px-14 py-10 outline-none border-4 border-opacity-80 relative overflow-hidden"}
                >
                    <video
                        className="absolute inset-0 w-full h-full object-cover"
                        autoPlay
                        loop
                        muted
                        playsInline
                    >
                        <source src="/images/wallpapers/nebula-live-video.mp4" type="video/mp4" />
                    </video>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-white text-sm font-semibold px-2 py-1 rounded bg-black bg-opacity-50">
                            Live Wallpaper
                        </span>
                    </div>
                </div>

                {/* Animated wallpaper option */}
                <div
                    tabIndex="1"
                    onFocus={changeBackgroundImage}
                    data-path="animated"
                    className={(("animated" === props.currBgImgName) ? " border-yellow-700 " : " border-transparent ") + " md:px-28 md:py-20 md:m-4 m-2 px-14 py-10 outline-none border-4 border-opacity-80 relative overflow-hidden"}
                >
                    {/* Space background */}
                    <div className="absolute inset-0 bg-gradient-to-b from-[#141428] to-[#0a0a1e]"></div>

                    {/* Static star field effect */}
                    <div className="star-sm absolute top-1/4 left-1/4 w-1 h-1 rounded-full bg-white opacity-80"></div>
                    <div className="star-md absolute top-3/4 left-1/3 w-1.5 h-1.5 rounded-full bg-white opacity-90"></div>
                    <div className="star-md absolute top-1/2 left-2/3 w-1.5 h-1.5 rounded-full bg-white opacity-80"></div>
                    <div className="star-sm absolute top-1/3 left-3/4 w-1 h-1 rounded-full bg-white opacity-70"></div>
                    <div className="star-sm absolute top-2/3 left-1/2 w-1 h-1 rounded-full bg-white opacity-90"></div>
                    <div className="star-lg absolute top-1/5 left-1/2 w-2 h-2 rounded-full bg-white opacity-95 animate-pulse"></div>
                    <div className="star-sm absolute top-3/5 left-1/5 w-1 h-1 rounded-full bg-white opacity-80"></div>

                    {/* Shooting star effect */}
                    <div className="absolute top-1/4 left-0 w-8 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent transform rotate-45 translate-x-full animate-shooting-star"></div>

                    {/* Label */}
                    <div className="relative flex items-center justify-center h-full w-full">
                        <span className="text-white text-sm font-semibold px-2 py-1 rounded bg-black bg-opacity-50">
                            Space Live
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Settings


export const displaySettings = () => {
    return <Settings> </Settings>;
}
