import React, { useState } from 'react';
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
        // Find the data-path attribute from the closest interactive wrapper if clicking inner elements
        const target = $(e.currentTarget);
        props.changeBackgroundImage(target.data("path"));
    }

    // Render the appropriate preview based on the current bg image
    const renderPreview = () => {
        if (props.currBgImgName === "video") {
            return (
                <div className="w-full aspect-video md:aspect-[21/9] rounded-2xl relative overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-white/10 mt-2 mb-6 group">
                    <video className="w-full h-full object-cover" autoPlay loop muted playsInline>
                        <source src="/images/wallpapers/nebula-live-video.mp4" type="video/mp4" />
                    </video>
                    <div className="absolute top-4 left-4">
                        <span className="text-white text-xs font-bold bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">Active: Live Nebula</span>
                    </div>
                </div>
            );
        }
        if (props.currBgImgName === "animated") {
            return (
                <div className="w-full aspect-video md:aspect-[21/9] rounded-2xl relative overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-white/10 mt-2 mb-6 group bg-gradient-to-r from-indigo-800 via-purple-700 to-blue-800 animate-gradient-x">
                    <div className="absolute top-4 left-4 z-10">
                        <span className="text-white text-xs font-bold bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">Active: Cosmic Space</span>
                    </div>
                </div>
            );
        }
        return (
            <div className="w-full aspect-video md:aspect-[21/9] rounded-2xl relative overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.3)] ring-1 ring-white/10 mt-2 mb-6"
                style={{ backgroundImage: `url(${wallpapers[props.currBgImgName]})`, backgroundSize: "cover", backgroundPosition: "center" }}>
                <div className="absolute top-4 left-4">
                    <span className="text-white text-xs font-bold bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">Active Wallpaper</span>
                </div>
            </div>
        );
    };


    const [activePage, setActivePage] = useState("main");

    const renderNetworkPage = () => (
        <div className="p-4 md:p-8 space-y-6 max-w-3xl mx-auto animate-[fadeIn_0.3s_ease-out]">
            <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 shadow-2xl backdrop-blur-md">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-xl font-bold text-white mb-1">Wi-Fi</h2>
                        <p className="text-sm text-gray-400">Connected to the multiverse</p>
                    </div>
                </div>

                <div className="space-y-3">
                    <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest opacity-80 mb-2">Networks</h3>

                    <div className="flex items-center gap-4 p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl relative">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-400 rounded-l-2xl"></div>
                        <h4 className="text-white font-medium flex-1">Starlink-5G</h4>
                        <p className="text-xs text-cyan-300">Ping: -1ms</p>
                    </div>

                    <div className="flex items-center gap-4 p-4 hover:bg-white/5 rounded-2xl">
                        <h4 className="text-white font-medium flex-1">FBI Surveillance Van #4</h4>
                        <p className="text-xs text-gray-500">Secured with Hope</p>
                    </div>

                    <div className="flex items-center gap-4 p-4 hover:bg-white/5 rounded-2xl">
                        <h4 className="text-white font-medium flex-1">Pretty Fly for a WiFi</h4>
                        <p className="text-xs text-gray-500">Saved</p>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderBatteryPage = () => (
        <div className="p-4 md:p-8 space-y-6 max-w-3xl mx-auto animate-[fadeIn_0.3s_ease-out]">
            <div className="bg-gradient-to-br from-green-500/10 to-emerald-900/20 border border-green-500/20 rounded-3xl p-8 text-center">
                <div className="text-4xl font-black text-white mb-2">85<span className="text-2xl text-green-400">%</span></div>
                <h2 className="text-xl font-bold text-white mb-2">About 100 years left</h2>
                <p className="text-sm text-green-300/80 max-w-xs mx-auto">Powered by a tiny arc reactor. Do not drop.</p>
            </div>

            <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 shadow-2xl">
                <h3 className="text-xs font-bold text-green-400 uppercase tracking-widest opacity-80 mb-6">Usage</h3>
                <div className="space-y-5">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-white">Chrome (2 tabs)</span>
                        <span className="text-orange-400">150%</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-white">Existential Dread</span>
                        <span className="text-purple-400">20%</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-white">Settings App</span>
                        <span className="text-blue-400">0.001%</span>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderSystemPage = () => (
        <div className="p-4 md:p-8 space-y-6 max-w-3xl mx-auto animate-[fadeIn_0.3s_ease-out]">
            <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-orange-500/20 rounded-3xl p-8 text-center">
                <h2 className="text-3xl font-bold text-white tracking-tight">AshinOS <span className="text-amber-400 font-light">v14.2</span></h2>
                <p className="text-orange-300 max-w-sm mx-auto mb-6 mt-2">Optimally imperfect.</p>
            </div>

            <div className="bg-white/[0.03] border border-white/10 rounded-3xl overflow-hidden divide-y divide-white/5">
                <div className="p-5 flex justify-between">
                    <span className="text-xs text-gray-500 uppercase font-bold">Storage</span>
                    <span className="text-white text-sm">2TB / ∞ (Mostly memes)</span>
                </div>
                <div className="p-5 flex justify-between">
                    <span className="text-xs text-gray-500 uppercase font-bold">Uptime</span>
                    <span className="text-white text-sm">Since 1998</span>
                </div>
                <div className="p-5">
                    <span className="text-xs text-gray-500 uppercase font-bold block mb-2">Changelog</span>
                    <span className="text-white text-sm">Fixed 99 bugs. Created 102 new ones.</span>
                </div>
            </div>
        </div>
    );

    return (
        <div className={"w-full flex-col flex-grow z-20 h-full overflow-y-auto windowMainScreen select-none bg-gradient-to-b from-[#0a0a0c] to-[#121216] text-white font-sans"}>
            {/* Header */}
            <div className="sticky top-0 z-30 bg-[#0a0a0c]/80 backdrop-blur-xl border-b border-white/5 px-6 py-5 flex items-center gap-4 transition-all">
                {activePage !== "main" && (
                    <button onClick={() => setActivePage("main")} className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors text-white">
                        ← Back
                    </button>
                )}
                <h1 className="text-2xl font-bold tracking-tight">
                    {activePage === "main" ? "Settings" :
                        activePage === "network" ? "Network & Internet" :
                            activePage === "battery" ? "Battery" :
                                "System & Updates"}
                </h1>
            </div>

            {activePage === "network" && renderNetworkPage()}
            {activePage === "battery" && renderBatteryPage()}
            {activePage === "system" && renderSystemPage()}

            <div className={`p-4 md:p-8 space-y-8 max-w-5xl mx-auto ${activePage !== "main" ? 'hidden' : ''}`}>

                {/* Personalization Section */}
                <section>
                    <h2 className="text-xs font-bold text-cyan-400 uppercase tracking-[0.2em] mb-4 ml-2 opacity-80">Device Personalization</h2>
                    <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-5 shadow-2xl backdrop-blur-md">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 text-purple-400 rounded-2xl border border-purple-500/20 shadow-inner">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold">Wallpaper & Style</h3>
                                <p className="text-sm text-gray-400 mt-0.5">Customize your desktop background</p>
                            </div>
                        </div>

                        {renderPreview()}

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-6">
                            {/* Static wallpaper options */}
                            {
                                Object.keys(wallpapers).map((name, index) => {
                                    return (
                                        <div key={index} tabIndex="1" onClick={changeBackgroundImage} onKeyDown={(e) => e.key === 'Enter' && changeBackgroundImage(e)} data-path={name}
                                            className={((name === props.currBgImgName) ? "ring-2 ring-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.3)] scale-[1.02]" : "ring-1 ring-white/10 opacity-70 hover:opacity-100 hover:scale-[1.01]") + " cursor-pointer aspect-video rounded-xl transition-all duration-300 relative overflow-hidden group focus:outline-none focus:ring-2 focus:ring-cyan-500"}
                                            style={{ backgroundImage: `url(${wallpapers[name]})`, backgroundSize: "cover", backgroundPosition: "center" }}>
                                            {(name === props.currBgImgName) && <div className="absolute inset-0 bg-cyan-400/20 flex items-center justify-center">
                                                <div className="bg-cyan-500 rounded-full p-1 shadow-lg">
                                                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                                </div>
                                            </div>}
                                        </div>
                                    );
                                })
                            }
                            {/* Video Option */}
                            <div tabIndex="1" onClick={changeBackgroundImage} onKeyDown={(e) => e.key === 'Enter' && changeBackgroundImage(e)} data-path="video"
                                className={(("video" === props.currBgImgName) ? "ring-2 ring-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.3)] scale-[1.02]" : "ring-1 ring-white/10 opacity-70 hover:opacity-100 hover:scale-[1.01]") + " cursor-pointer aspect-video rounded-xl transition-all duration-300 relative overflow-hidden group focus:outline-none focus:ring-2 focus:ring-cyan-500"}>
                                <video className="absolute inset-0 w-full h-full object-cover" autoPlay loop muted playsInline>
                                    <source src="/images/wallpapers/nebula-live-video.mp4" type="video/mp4" />
                                </video>
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-colors">
                                    <span className="text-white text-xs font-semibold px-2 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span> Live
                                    </span>
                                </div>
                                {("video" === props.currBgImgName) && <div className="absolute inset-0 bg-cyan-400/20 flex items-center justify-center pointer-events-none">
                                    <div className="bg-cyan-500 rounded-full p-1 shadow-lg">
                                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                    </div>
                                </div>}
                            </div>
                            {/* Animated Option */}
                            <div tabIndex="1" onClick={changeBackgroundImage} onKeyDown={(e) => e.key === 'Enter' && changeBackgroundImage(e)} data-path="animated"
                                className={(("animated" === props.currBgImgName) ? "ring-2 ring-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.3)] scale-[1.02]" : "ring-1 ring-white/10 opacity-70 hover:opacity-100 hover:scale-[1.01]") + " cursor-pointer aspect-video rounded-xl transition-all duration-300 relative overflow-hidden group bg-gradient-to-br from-indigo-900 via-purple-900 to-black focus:outline-none focus:ring-2 focus:ring-cyan-500"}>
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-transparent transition-colors">
                                    <span className="text-white text-xs font-semibold px-2 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/10">Cosmic</span>
                                </div>
                                {("animated" === props.currBgImgName) && <div className="absolute inset-0 bg-cyan-400/20 flex items-center justify-center pointer-events-none">
                                    <div className="bg-cyan-500 rounded-full p-1 shadow-lg">
                                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                    </div>
                                </div>}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features / Network Section */}
                <section>
                    <h2 className="text-xs font-bold text-cyan-400 uppercase tracking-[0.2em] mb-4 ml-2 opacity-80">Network & System</h2>
                    <div className="bg-white/[0.03] border border-white/10 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-md divide-y divide-white/5">

                        <div onClick={() => setActivePage("network")} className="flex items-center justify-between p-5 hover:bg-white/5 transition-all cursor-pointer group">
                            <div className="flex items-center gap-5">
                                <div className="p-3 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 text-blue-400 rounded-2xl group-hover:scale-110 transition-transform shadow-inner border border-blue-500/10">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.906 14.142 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" /></svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium text-white mb-0.5">Network & Internet</h3>
                                    <p className="text-sm text-blue-300/80">Connected to Starlink-5G</p>
                                </div>
                            </div>
                            <svg className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </div>

                        <div onClick={() => setActivePage("battery")} className="flex items-center justify-between p-5 hover:bg-white/5 transition-all cursor-pointer group">
                            <div className="flex items-center gap-5">
                                <div className="p-3 bg-gradient-to-br from-green-500/20 to-emerald-500/20 text-green-400 rounded-2xl group-hover:scale-110 transition-transform shadow-inner border border-green-500/10">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium text-white mb-0.5">Battery</h3>
                                    <p className="text-sm text-green-300/80 w-full flex items-center gap-2">
                                        <span className="w-full max-w-[100px] h-1.5 bg-white/10 rounded-full overflow-hidden block">
                                            <span className="h-full bg-green-400 block" style={{ width: '85%' }}></span>
                                        </span>
                                        85% - About 100 years left
                                    </p>
                                </div>
                            </div>
                            <svg className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </div>

                        <div onClick={() => setActivePage("system")} className="flex items-center justify-between p-5 hover:bg-white/5 transition-all cursor-pointer group">
                            <div className="flex items-center gap-5">
                                <div className="p-3 bg-gradient-to-br from-amber-500/20 to-orange-500/20 text-amber-400 rounded-2xl group-hover:scale-110 transition-transform shadow-inner border border-amber-500/10">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium text-white mb-0.5">System & Updates</h3>
                                    <p className="text-sm text-gray-400">AshinOS v14.2 is up to date</p>
                                </div>
                            </div>
                            <svg className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </div>

                    </div>
                </section>

                {/* About Section */}
                <section className="pb-12">
                    <h2 className="text-xs font-bold text-cyan-400 uppercase tracking-[0.2em] mb-4 ml-2 opacity-80">About Developer</h2>
                    <div className="bg-gradient-to-r from-cyan-500/10 via-blue-500/5 to-purple-500/10 border border-t-cyan-400/30 border-b-purple-400/20 border-x-white/5 rounded-3xl p-6 shadow-[0_0_40px_rgba(34,211,238,0.05)] backdrop-blur-md relative overflow-hidden">

                        {/* Decorative glow */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-5 mb-5">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 p-[2px] shadow-lg">
                                    <div className="w-full h-full bg-[#0a0a0c] rounded-2xl flex items-center justify-center relative overflow-hidden">
                                        <div className="absolute inset-0 bg-white/5"></div>
                                        <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400">A</span>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-white tracking-tight">Ashin Shanly</h3>
                                    <p className="text-sm font-medium text-cyan-300 flex items-center gap-2 mt-1 px-3 py-1 bg-cyan-500/10 rounded-full border border-cyan-500/20 w-fit">
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                                        </span>
                                        Google
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <a href="https://github.com/ashinshanly" target="_blank" rel="noreferrer" className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl py-3 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] shadow-sm text-sm font-semibold">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg>
                                    GitHub
                                </a>
                                <a href="https://linkedin.com/in/ashinshanly" target="_blank" rel="noreferrer" className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-300 rounded-2xl py-3 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] shadow-sm text-sm font-semibold">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" /></svg>
                                    LinkedIn
                                </a>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}

export default Settings


export const displaySettings = (props) => {
    return <Settings {...props}> </Settings>;
}

