import React from 'react'
import AnimatedWallpaper from './animated-wallpaper'
import VideoWallpaper from './video-wallpaper'

export default function BackgroundImage(props) {
    const bg_images = {
        "wall-1": "./images/wallpapers/wall-1.webp",
        "wall-2": "./images/wallpapers/wall-2.webp",
        "wall-3": "./images/wallpapers/wall-3.webp",
        "wall-4": "./images/wallpapers/wall-4.webp",
        "wall-5": "./images/wallpapers/wall-5.webp",
        "wall-6": "./images/wallpapers/wall-6.webp",
        "wall-7": "./images/wallpapers/wall-7.webp",
        "wall-8": "./images/wallpapers/wall-8.webp",
        "animated": "animated",
        "video": "video",
    };
    
    // Check if the wallpaper is the video one
    if (props.img === "video") {
        return <VideoWallpaper />
    }
    
    // Check if the wallpaper is the animated one
    if (props.img === "animated") {
        return <AnimatedWallpaper />
    }
    
    // Otherwise return regular image wallpaper
    return (
        <div style={{ backgroundImage: `url(${bg_images[props.img]})`, backgroundSize: "cover", backgroundRepeat: "no-repeat", backgroundPositionX: "center" }} className="bg-ubuntu-img absolute -z-10 top-0 right-0 overflow-hidden h-full w-full">
        </div>
    )
}
