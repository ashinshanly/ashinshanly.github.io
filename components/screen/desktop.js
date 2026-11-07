import React, { Component } from 'react';
import BackgroundImage from '../util components/background-image';
import SideBar from './side_bar';
import apps from '../../apps.config';
import Window from '../base/window';
import UbuntuApp from '../base/ubuntu_app';
import AllApplications from '../screen/all-applications'
import DesktopMenu from '../context menus/desktop-menu';
import DefaultMenu from '../context menus/default';
import AtAGlanceWidget from '../util components/AtAGlanceWidget';
import OrbyAssistant, { OrbyFloatingLauncher } from '../util components/orby_assistant';
import $ from 'jquery';
import ReactGA from 'react-ga4';

export class Desktop extends Component {
    constructor() {
        super();
        this.app_stack = [];
        this.initFavourite = {};
        this.allWindowClosed = false;
        this.state = {
            focused_windows: {},
            closed_windows: {},
            allAppsView: false,
            overlapped_windows: {},
            disabled_apps: {},
            favourite_apps: {},
            hideSideBar: false,
            minimized_windows: {},
            desktop_apps: [],
            context_menus: {
                desktop: false,
                default: false,
            },
            showNameBar: false,
            spotlightOpen: false,
            spotlightQuery: '',
            orbyOpen: false,
        }
    }

    componentDidMount() {
        // google analytics
        ReactGA.send({ hitType: "pageview", page: "/desktop", title: "Custom Title" });

        this.fetchAppsData();
        this.setContextListeners();
        this.setEventListeners();
        this.checkForNewFolders();
    }

    componentWillUnmount() {
        this.removeContextListeners();
    }

    checkForNewFolders = () => {
        var new_folders = localStorage.getItem('new_folders');
        if (new_folders === null || new_folders === undefined) {
            localStorage.setItem("new_folders", JSON.stringify([]));
        }
        else {
            new_folders = JSON.parse(new_folders);
            new_folders.forEach(folder => {
                const folderId = String(folder.id).startsWith('new-folder-')
                    ? String(folder.id)
                    : `new-folder-${folder.id}`;
                if (!apps.some(app => app.id === folderId)) {
                    apps.push({
                        id: folderId,
                        title: folder.name,
                        icon: './themes/Yaru/system/folder.png',
                        disabled: true,
                        favourite: false,
                        desktop_shortcut: true,
                        screen: () => { },
                    });
                }
            });
            this.updateAppsData();
        }
    }

    setEventListeners = () => {
        const openSettings = document.getElementById("open-settings");
        if (openSettings) {
            openSettings.addEventListener("click", () => {
                this.openApp("settings");
            });
        }
        window.addEventListener("keydown", this.handleGlobalKeyDown);
        window.addEventListener("ubuntu-toggle-spotlight", this.toggleSpotlight);
        window.addEventListener("portfolio-open-orby", this.openOrby);
    }

    openOrby = () => {
        this.setState({ orbyOpen: true, spotlightOpen: false });
    }

    handleGlobalKeyDown = (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
            e.preventDefault();
            this.toggleSpotlight();
        } else if (e.key === "Escape" && this.state.spotlightOpen) {
            this.setState({ spotlightOpen: false, spotlightQuery: "" });
        }
    }

    toggleSpotlight = () => {
        this.setState((prev) => ({
            spotlightOpen: !prev.spotlightOpen,
            spotlightQuery: "",
        }));
    }

    setContextListeners = () => {
        document.addEventListener('contextmenu', this.checkContextMenu);
        // on click, anywhere, hide all menus
        document.addEventListener('click', this.hideAllContextMenu);
    }

    removeContextListeners = () => {
        document.removeEventListener("contextmenu", this.checkContextMenu);
        document.removeEventListener("click", this.hideAllContextMenu);
        window.removeEventListener("keydown", this.handleGlobalKeyDown);
        window.removeEventListener("ubuntu-toggle-spotlight", this.toggleSpotlight);
        window.removeEventListener("portfolio-open-orby", this.openOrby);
    }

    checkContextMenu = (e) => {
        e.preventDefault();
        this.hideAllContextMenu();
        switch (e.target.dataset.context) {
            case "desktop-area":
                ReactGA.event({
                    category: `Context Menu`,
                    action: `Opened Desktop Context Menu`
                });
                this.showContextMenu(e, "desktop");
                break;
            default:
                ReactGA.event({
                    category: `Context Menu`,
                    action: `Opened Default Context Menu`
                });
                this.showContextMenu(e, "default");
        }
    }

    showContextMenu = (e, menuName /* context menu name */) => {
        let { posx, posy } = this.getMenuPosition(e);
        let contextMenu = document.getElementById(`${menuName}-menu`);

        if (posx + $(contextMenu).width() > window.innerWidth) posx -= $(contextMenu).width();
        if (posy + $(contextMenu).height() > window.innerHeight) posy -= $(contextMenu).height();

        posx = posx.toString() + "px";
        posy = posy.toString() + "px";

        contextMenu.style.left = posx;
        contextMenu.style.top = posy;

        this.setState({ context_menus: { ...this.state.context_menus, [menuName]: true } });
    }

    hideAllContextMenu = () => {
        let menus = this.state.context_menus;
        Object.keys(menus).forEach(key => {
            menus[key] = false;
        });
        this.setState({ context_menus: menus });
    }

    getMenuPosition = (e) => {
        var posx = 0;
        var posy = 0;

        if (!e) e = window.event;

        if (e.pageX || e.pageY) {
            posx = e.pageX;
            posy = e.pageY;
        } else if (e.clientX || e.clientY) {
            posx = e.clientX + document.body.scrollLeft +
                document.documentElement.scrollLeft;
            posy = e.clientY + document.body.scrollTop +
                document.documentElement.scrollTop;
        }
        return {
            posx, posy
        }
    }

    fetchAppsData = () => {
        let focused_windows = {}, closed_windows = {}, disabled_apps = {}, favourite_apps = {}, overlapped_windows = {}, minimized_windows = {};
        let desktop_apps = [];
        apps.forEach((app) => {
            focused_windows = {
                ...focused_windows,
                [app.id]: false,
            };
            closed_windows = {
                ...closed_windows,
                [app.id]: true,
            };
            disabled_apps = {
                ...disabled_apps,
                [app.id]: app.disabled,
            };
            favourite_apps = {
                ...favourite_apps,
                [app.id]: app.favourite,
            };
            overlapped_windows = {
                ...overlapped_windows,
                [app.id]: false,
            };
            minimized_windows = {
                ...minimized_windows,
                [app.id]: false,
            }
            if (app.desktop_shortcut) desktop_apps.push(app.id);
        });
        this.setState({
            focused_windows,
            closed_windows,
            disabled_apps,
            favourite_apps,
            overlapped_windows,
            minimized_windows,
            desktop_apps
        });
        this.initFavourite = { ...favourite_apps };
    }

    updateAppsData = () => {
        let focused_windows = {}, closed_windows = {}, favourite_apps = {}, minimized_windows = {}, disabled_apps = {};
        let desktop_apps = [];
        apps.forEach((app) => {
            focused_windows = {
                ...focused_windows,
                [app.id]: ((this.state.focused_windows[app.id] !== undefined && this.state.focused_windows[app.id] !== null) ? this.state.focused_windows[app.id] : false),
            };
            minimized_windows = {
                ...minimized_windows,
                [app.id]: ((this.state.minimized_windows[app.id] !== undefined && this.state.minimized_windows[app.id] !== null) ? this.state.minimized_windows[app.id] : false)
            };
            disabled_apps = {
                ...disabled_apps,
                [app.id]: app.disabled
            };
            closed_windows = {
                ...closed_windows,
                [app.id]: ((this.state.closed_windows[app.id] !== undefined && this.state.closed_windows[app.id] !== null) ? this.state.closed_windows[app.id] : true)
            };
            favourite_apps = {
                ...favourite_apps,
                [app.id]: app.favourite
            }
            if (app.desktop_shortcut) desktop_apps.push(app.id);
        });
        this.setState({
            focused_windows,
            closed_windows,
            disabled_apps,
            minimized_windows,
            favourite_apps,
            desktop_apps
        });
        this.initFavourite = { ...favourite_apps };
    }

    renderDesktopApps = () => {
        if (Object.keys(this.state.closed_windows).length === 0) return;
        let appsJsx = [];
        apps.forEach((app, index) => {
            if (this.state.desktop_apps.includes(app.id)) {

                const props = {
                    name: app.title,
                    id: app.id,
                    icon: app.icon,
                    custom_icon: app.custom_icon,
                    openApp: this.openApp
                }

                appsJsx.push(
                    <UbuntuApp key={index} {...props} />
                );
            }
        });
        return appsJsx;
    }

    renderWindows = () => {
        let windowsJsx = [];
        apps.forEach((app, index) => {
            if (this.state.closed_windows[app.id] === false) {

                const props = {
                    title: app.title,
                    id: app.id,
                    screen: app.screen,
                    addFolder: this.addToDesktop,
                    closed: this.closeApp,
                    openApp: this.openApp,
                    focus: this.focus,
                    isFocused: this.state.focused_windows[app.id],
                    hideSideBar: this.hideSideBar,
                    hasMinimised: this.hasMinimised,
                    minimized: this.state.minimized_windows[app.id],
                    changeBackgroundImage: this.props.changeBackgroundImage,
                    bg_image_name: this.props.bg_image_name,
                }

                windowsJsx.push(
                    <Window key={index} {...props} />
                )
            }
        });
        return windowsJsx;
    }

    hideSideBar = (objId, hide) => {
        if (hide === this.state.hideSideBar) return;

        if (objId === null) {
            if (hide === false) {
                this.setState({ hideSideBar: false });
            }
            else {
                for (const key in this.state.overlapped_windows) {
                    if (this.state.overlapped_windows[key]) {
                        this.setState({ hideSideBar: true });
                        return;
                    }  // if any window is overlapped then hide the SideBar
                }
            }
            return;
        }

        if (hide === false) {
            for (const key in this.state.overlapped_windows) {
                if (this.state.overlapped_windows[key] && key !== objId) return; // if any window is overlapped then don't show the SideBar
            }
        }

        let overlapped_windows = this.state.overlapped_windows;
        overlapped_windows[objId] = hide;
        this.setState({ hideSideBar: hide, overlapped_windows });
    }

    hasMinimised = (objId) => {
        let minimized_windows = this.state.minimized_windows;
        var focused_windows = this.state.focused_windows;

        // remove focus and minimise this window
        minimized_windows[objId] = true;
        focused_windows[objId] = false;
        this.setState({ minimized_windows, focused_windows });

        this.hideSideBar(null, false);

        this.giveFocusToLastApp();
    }

    giveFocusToLastApp = () => {
        // if there is atleast one app opened, give it focus
        if (!this.checkAllMinimised()) {
            for (const index in this.app_stack) {
                if (!this.state.minimized_windows[this.app_stack[index]]) {
                    this.focus(this.app_stack[index]);
                    break;
                }
            }
        }
    }

    checkAllMinimised = () => {
        let result = true;
        for (const key in this.state.minimized_windows) {
            if (!this.state.closed_windows[key]) { // if app is opened
                result = result & this.state.minimized_windows[key];
            }
        }
        return result;
    }

    openApp = (objId) => {

        // google analytics
        ReactGA.event({
            category: `Open App`,
            action: `Opened ${objId} window`
        });

        // if the app is disabled
        if (this.state.disabled_apps[objId]) return;

        // Find the app in the apps array
        const appConfig = apps.find(app => app.id === objId);

        // Check if this is an external URL app
        if (appConfig && appConfig.type === "external" && appConfig.url) {
            // Open the external URL in a new tab and return without opening a window
            window.open(appConfig.url, "_blank");
            return;
        }

        if (this.state.minimized_windows[objId]) {
            // focus this app's window
            this.focus(objId);

            // set window's last position
            var r = document.querySelector("#" + objId);
            r.style.transform = `translate(${r.style.getPropertyValue("--window-transform-x")},${r.style.getPropertyValue("--window-transform-y")}) scale(1)`;

            // tell childs that his app has been not minimised
            let minimized_windows = this.state.minimized_windows;
            minimized_windows[objId] = false;
            this.setState({ minimized_windows: minimized_windows });
            return;
        }

        //if app is already opened
        if (this.app_stack.includes(objId)) this.focus(objId);
        else {
            let closed_windows = this.state.closed_windows;
            let favourite_apps = this.state.favourite_apps;
            var frequentApps = localStorage.getItem('frequentApps') ? JSON.parse(localStorage.getItem('frequentApps')) : [];
            var currentApp = frequentApps.find(app => app.id === objId);
            if (currentApp) {
                frequentApps.forEach((app) => {
                    if (app.id === currentApp.id) {
                        app.frequency += 1; // increase the frequency if app is found 
                    }
                });
            } else {
                frequentApps.push({ id: objId, frequency: 1 }); // new app opened
            }

            frequentApps.sort((a, b) => {
                if (a.frequency < b.frequency) {
                    return 1;
                }
                if (a.frequency > b.frequency) {
                    return -1;
                }
                return 0; // sort according to decreasing frequencies
            });

            localStorage.setItem("frequentApps", JSON.stringify(frequentApps));

            setTimeout(() => {
                favourite_apps[objId] = true; // adds opened app to sideBar
                closed_windows[objId] = false; // openes app's window
                this.setState({ closed_windows, favourite_apps, allAppsView: false }, () => this.focus(objId));
                this.app_stack.push(objId);
            }, 200);
        }
    }

    closeApp = (objId) => {

        // remove app from the app stack
        this.app_stack.splice(this.app_stack.indexOf(objId), 1);

        this.giveFocusToLastApp();

        this.hideSideBar(null, false);

        // close window
        let closed_windows = this.state.closed_windows;
        let favourite_apps = this.state.favourite_apps;

        if (this.initFavourite[objId] === false) favourite_apps[objId] = false; // if user default app is not favourite, remove from sidebar
        closed_windows[objId] = true; // closes the app's window

        this.setState({ closed_windows, favourite_apps });
    }

    focus = (objId) => {
        // removes focus from all window and 
        // gives focus to window with 'id = objId'
        var focused_windows = this.state.focused_windows;
        focused_windows[objId] = true;
        for (let key in focused_windows) {
            if (focused_windows.hasOwnProperty(key)) {
                if (key !== objId) {
                    focused_windows[key] = false;
                }
            }
        }
        this.setState({ focused_windows });
    }

    addNewFolder = () => {
        this.setState({ showNameBar: true });
    }

    addToDesktop = (folder_name) => {
        if (!folder_name) return;
        folder_name = folder_name.trim();
        if (!folder_name) return;
        let folder_id = folder_name.replace(/\s+/g, '-').toLowerCase();
        const fullFolderId = `new-folder-${folder_id}`;
        if (!apps.some(app => app.id === fullFolderId)) {
            apps.push({
                id: fullFolderId,
                title: folder_name,
                icon: './themes/Yaru/system/folder.png',
                disabled: true,
                favourite: false,
                desktop_shortcut: true,
                screen: () => { },
            });
        }
        // store in local storage
        var new_folders = JSON.parse(localStorage.getItem('new_folders') || '[]');
        if (!new_folders.some(f => f.id === folder_id || f.id === fullFolderId)) {
            new_folders.push({ id: folder_id, name: folder_name });
            localStorage.setItem("new_folders", JSON.stringify(new_folders));
        }

        this.setState({ showNameBar: false }, this.updateAppsData);
    }

    showAllApps = () => { this.setState({ allAppsView: !this.state.allAppsView }) }

    renderNameBar = () => {
        let addFolder = () => {
            let folder_name = document.getElementById("folder-name-input").value;
            this.addToDesktop(folder_name);
        }

        let removeCard = () => {
            this.setState({ showNameBar: false });
        }

        return (
            <div className="absolute rounded-md top-1/2 left-1/2 text-center text-white font-light text-sm bg-ub-cool-grey transform -translate-y-1/2 -translate-x-1/2 sm:w-96 w-3/4 z-50">
                <div className="w-full flex flex-col justify-around items-start pl-6 pb-8 pt-6">
                    <span>New folder name</span>
                    <input className="outline-none mt-5 px-1 w-10/12  context-menu-bg border-2 border-yellow-700 rounded py-0.5" id="folder-name-input" type="text" autoComplete="off" spellCheck="false" autoFocus={true} />
                </div>
                <div className="flex">
                    <div onClick={addFolder} className="w-1/2 px-4 py-2 border border-gray-900 border-opacity-50 border-r-0 hover:bg-ub-warm-grey hover:bg-opacity-10 hover:border-opacity-50">Create</div>
                    <div onClick={removeCard} className="w-1/2 px-4 py-2 border border-gray-900 border-opacity-50 hover:bg-ub-warm-grey hover:bg-opacity-10 hover:border-opacity-50">Cancel</div>
                </div>
            </div>
        );
    }

    render() {
        return (
            <div className={" h-full w-full flex flex-col items-end justify-start content-start flex-wrap-reverse pt-11 pr-2 bg-transparent relative overflow-hidden overscroll-none window-parent"}>

                <div className="ubuntu-future-grid" aria-hidden="true" />
                <div className="ubuntu-ambient-orb ubuntu-ambient-orb-one" aria-hidden="true" />
                <div className="ubuntu-ambient-orb ubuntu-ambient-orb-two" aria-hidden="true" />
                <div className="ubuntu-system-readout pointer-events-none select-none" aria-hidden="true">
                    <i /><span>ASHIN'S WORKSPACE</span>
                </div>

                {/* At a Glance Widget */}
                <AtAGlanceWidget />

                {/* Floating Orby Voice Assistant Launcher */}
                <div className="fixed bottom-4 right-5 z-30">
                    <OrbyFloatingLauncher
                        onClick={this.openOrby}
                        label="Talk to Orby — Voice AI"
                    />
                </div>

                {/* Orby Voice Assistant Stage Overlay */}
                <OrbyAssistant
                    isOpen={this.state.orbyOpen}
                    onClose={() => this.setState({ orbyOpen: false })}
                    onOpenApp={this.openApp}
                />

                {/* Window Area */}
                <div className="absolute top-8 left-0 right-0 h-[calc(100%-2rem)] w-full bg-transparent" data-context="desktop-area">
                    {this.renderWindows()}
                </div>

                {/* Background Image */}
                <BackgroundImage img={this.props.bg_image_name} />

                {/* Ubuntu Side Menu Bar */}
                <SideBar apps={apps}
                    hide={this.state.hideSideBar}
                    hideSideBar={this.hideSideBar}
                    favourite_apps={this.state.favourite_apps}
                    showAllApps={this.showAllApps}
                    allAppsView={this.state.allAppsView}
                    closed_windows={this.state.closed_windows}
                    focused_windows={this.state.focused_windows}
                    isMinimized={this.state.minimized_windows}
                    openAppByAppId={this.openApp} />

                {/* Desktop Apps */}
                {this.renderDesktopApps()}

                {/* Context Menus */}
                <DesktopMenu active={this.state.context_menus.desktop} openApp={this.openApp} addNewFolder={this.addNewFolder} />
                <DefaultMenu active={this.state.context_menus.default} />

                {/* Folder Input Name Bar */}
                {
                    (this.state.showNameBar
                        ? this.renderNameBar()
                        : null
                    )
                }

                {this.state.allAppsView ?
                    <AllApplications apps={apps}
                        recentApps={this.app_stack}
                        openApp={this.openApp} /> : null}

                {/* GNOME 46 Spotlight / Command Palette (Ctrl+K) */}
                {this.state.spotlightOpen && (
                    <div
                        id="ubuntu-spotlight-modal"
                        className="fixed inset-0 z-50 bg-black/55 backdrop-blur-md flex items-start justify-center pt-24 px-4"
                        onClick={() => this.setState({ spotlightOpen: false, spotlightQuery: '' })}
                    >
                        <div
                            className="w-full max-w-xl rounded-[24px] bg-[#0F172A]/95 border border-cyan-400/25 shadow-[0_24px_64px_rgba(0,0,0,0.75)] overflow-hidden text-white"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/10">
                                <svg className="w-5 h-5 text-cyan-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <circle cx="11" cy="11" r="8" />
                                    <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
                                </svg>
                                <input
                                    id="ubuntu-spotlight-input"
                                    type="text"
                                    autoFocus
                                    placeholder="Type to search apps, portfolio sections, or commands..."
                                    value={this.state.spotlightQuery}
                                    onChange={(e) => this.setState({ spotlightQuery: e.target.value })}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            const q = this.state.spotlightQuery.trim().toLowerCase();
                                            const matched = apps.find(
                                                (a) => !a.disabled && a.title.toLowerCase().includes(q)
                                            );
                                            if (matched) {
                                                this.openApp(matched.id);
                                                this.setState({ spotlightOpen: false, spotlightQuery: '' });
                                            }
                                        }
                                    }}
                                    className="w-full bg-transparent text-sm text-white placeholder-white/40 outline-none"
                                />
                                <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-white/10 text-white/60">
                                    ESC
                                </span>
                            </div>

                            <div className="max-h-80 overflow-y-auto p-2 space-y-1">
                                {apps
                                    .filter(
                                        (a) =>
                                            !a.disabled &&
                                            a.title
                                                .toLowerCase()
                                                .includes(this.state.spotlightQuery.trim().toLowerCase())
                                    )
                                    .slice(0, 7)
                                    .map((app) => (
                                        <button
                                            key={app.id}
                                            type="button"
                                            onClick={() => {
                                                this.openApp(app.id);
                                                this.setState({ spotlightOpen: false, spotlightQuery: '' });
                                            }}
                                            className="w-full px-3.5 py-2.5 rounded-xl hover:bg-cyan-500/15 flex items-center justify-between text-left transition-colors group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={app.icon}
                                                    alt={app.title}
                                                    className="w-6 h-6 object-contain"
                                                    onError={(e) => {
                                                        e.target.src = './themes/Yaru/apps/bash.png';
                                                    }}
                                                />
                                                <span className="text-sm font-medium text-white group-hover:text-cyan-300">
                                                    {app.title}
                                                </span>
                                            </div>
                                            <span className="text-[11px] text-white/40 group-hover:text-cyan-300">
                                                {app.type === 'external' ? 'Open Link ↗' : 'Launch App ↵'}
                                            </span>
                                        </button>
                                    ))}
                            </div>
                        </div>
                    </div>
                )}

            </div>
        )
    }
}

export default Desktop
