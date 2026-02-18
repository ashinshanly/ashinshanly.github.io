import displaySpotify from './components/apps/spotify';
import displayVsCode from './components/apps/vscode';
import { displayTerminal } from './components/apps/terminal';
import { displaySettings } from './components/apps/settings';
import { displayChrome } from './components/apps/chrome';
import { displayTrash } from './components/apps/trash';
import { displayGedit } from './components/apps/gedit';
import { displayAboutAshin } from './components/apps/ashin';
import { displayTerminalCalc } from './components/apps/calc';
import { displayDevAdventure } from './components/apps/dev_adventure';
import { displayChessGame } from './components/apps/chess_game_v2';
import { displayCodingChallenges } from './components/apps/coding_game';
import { displayShootingGame } from './components/apps/shooting_game';
import { displayMusicSync } from './components/apps/musicsync';
import { displayPrismFlow } from './components/apps/prism_flow';
import { displayCamera } from './components/apps/camera';
import { VisitorStats } from './components/apps/visitor_stats';
import { VisitorIcon } from './components/util components/visitor_icon';


const apps = [
    {
        id: "chrome",
        title: "Google Chrome",
        icon: './themes/Yaru/apps/chrome.png',
        disabled: false,
        favourite: true,
        desktop_shortcut: true,
        screen: displayChrome,
    },
    {
        id: "calc",
        title: "Calc",
        icon: './themes/Yaru/apps/calc.png',
        disabled: false,
        favourite: true,
        desktop_shortcut: false,
        screen: displayTerminalCalc,
    },

    {
        id: "vscode",
        title: "Visual Studio Code",
        icon: './themes/Yaru/apps/vscode.png',
        disabled: false,
        favourite: true,
        desktop_shortcut: false,
        screen: displayVsCode,
    },
    {
        id: "terminal",
        title: "Terminal",
        icon: './themes/Yaru/apps/bash.png',
        disabled: false,
        favourite: true,
        desktop_shortcut: false,
        screen: displayTerminal,
    },
    {
        id: "visitor-stats",
        title: "Visitor Stats",
        icon: './themes/Yaru/apps/illuminati.png',
        custom_icon: VisitorIcon,
        disabled: false,
        favourite: true,
        desktop_shortcut: true,
        screen: () => <VisitorStats />,
    },
    {
        id: "about-ashin",
        title: "About Ashin",
        icon: './themes/Yaru/system/user-home.png',
        disabled: false,
        favourite: true,
        desktop_shortcut: true,
        screen: displayAboutAshin,
    },
    {
        id: "spotify",
        title: "Spotify",
        icon: './themes/Yaru/apps/spotify.png',
        disabled: false,
        favourite: true,
        desktop_shortcut: false,
        screen: displaySpotify, // India Top 50 Playlist
    },
    {
        id: "chess",
        title: "Chess",
        icon: "./themes/Yaru/apps/chess.png",
        disabled: false,
        favourite: true,
        desktop_shortcut: true,
        screen: displayChessGame,
    },
    {
        id: "musicsync",
        title: "MusicSync",
        icon: './images/logos/apple-touch-icon.png',
        disabled: false,
        favourite: true,
        desktop_shortcut: true,
        type: "external",  // Mark as external link
        url: "https://ashinshanly.github.io/musicsync/",  // Direct URL to open
    },
    {
        id: "chainreaction",
        title: "Chain Reaction",
        icon: './themes/Yaru/apps/chain-reaction.png',
        disabled: false,
        favourite: true,
        desktop_shortcut: true,
        type: "external",
        url: "https://ashinshanly.github.io/chainreaction/",
    },
    {
        id: "secretmaze",
        title: "Secret Maze",
        icon: './themes/Yaru/apps/secret-maze.png',
        disabled: false,
        favourite: true,
        desktop_shortcut: true,
        type: "external",
        url: "https://ashinshanly.github.io/darkmaze/",
    },
    {
        id: "prism-flow",
        title: "Prism Flow",
        icon: './themes/Yaru/apps/prism-flow.png',
        disabled: false,
        favourite: true,
        desktop_shortcut: true,
        screen: displayPrismFlow,
    },/*
    {
        id: "shooter",
        title: "Shooter",
        icon: "./themes/Yaru/apps/gnome-control-center.png",
        disabled: false,
        favourite: true,
        desktop_shortcut: true,
        screen: displayShootingGame,
    },
    {
        id: "dev-adventure",
        title: "Minirun - WIP",
        icon: './themes/Yaru/apps/dev_adventure.png',
        disabled: false,
        favourite: true,
        desktop_shortcut: true,
        screen: displayDevAdventure,
    },
    {
        id: "codezilla",
        title: "Codezilla - WIP",
        icon: "./themes/Yaru/apps/coding.png",
        disabled: false,
        favourite: true,
        desktop_shortcut: true,
        screen: displayCodingChallenges,
    },*/
    {
        id: "settings",
        title: "Settings",
        icon: './themes/Yaru/apps/gnome-control-center.png',
        disabled: false,
        favourite: true,
        desktop_shortcut: false,
        screen: displaySettings,
    },
    {
        id: "camera",
        title: "Camera",
        icon: './themes/Yaru/apps/camera.png', // We'll need to check if this icon exists or use a fallback
        disabled: false,
        favourite: false,
        desktop_shortcut: true,
        screen: displayCamera,
    },
    {
        id: "trash",
        title: "Trash",
        icon: './themes/Yaru/system/user-trash-full.png',
        disabled: false,
        favourite: false,
        desktop_shortcut: true,
        screen: displayTrash,
    },

    {
        id: "gedit",
        title: "Contact Me",
        icon: './themes/Yaru/apps/gedit.png',
        disabled: false,
        favourite: false,
        desktop_shortcut: true,
        screen: displayGedit,
    },

]

export default apps;
