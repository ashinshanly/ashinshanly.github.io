import React, { Component } from 'react';
import BootingScreen from './screen/booting_screen';
import Desktop from './screen/desktop';
import LockScreen from './screen/lock_screen';
import Navbar from './screen/navbar';
import ReactGA from 'react-ga4';
import { db } from '../config/firebase';
import { ref, onValue, set, onDisconnect, increment } from 'firebase/database';
import { runTransaction } from 'firebase/database';

export default class Ubuntu extends Component {
	constructor() {
		super();
		this.state = {
			screen_locked: false,
			bg_image_name: 'video', // Use video wallpaper as default
			booting_screen: true,
			shutDownScreen: false
		};
	}

	componentDidMount() {
		this.getLocalData();
		this.trackVisitors();
	}

	componentWillUnmount() {
		if (this.presenceRef) {
			set(this.presenceRef, null).catch(err => console.error("Cleanup set failed:", err));
		}
		if (this.heartbeatInterval) {
			clearInterval(this.heartbeatInterval);
		}
	}

	trackVisitors = () => {
		// 1. Session tracking for Total Visitors
		const visitorCounted = sessionStorage.getItem('visitor_counted');
		if (!visitorCounted) {
			const totalVisitorsRef = ref(db, 'site_stats/total_visitors');
			runTransaction(totalVisitorsRef, (currentValue) => {
				return (currentValue || 0) + 1;
			}).catch(err => console.error("Total Visitors transaction failed:", err));
			sessionStorage.setItem('visitor_counted', 'true');
		}

		// 2. Presence tracking for Live Viewers
		// Use sessionStorage to keep the same sessionId across reloads but unique to the tab
		let sessionId = sessionStorage.getItem('session_id');
		if (!sessionId) {
			sessionId = Math.random().toString(36).substring(2, 11);
			sessionStorage.setItem('session_id', sessionId);
		}

		this.presenceRef = ref(db, `site_stats/live_viewers/${sessionId}`);

		const updatePresence = () => {
			const sessionData = {
				timestamp: Date.now(),
				browser: navigator.userAgent.split(' ')[0],
				platform: navigator.platform,
				joinedAt: this.joinedAt || new Date().toLocaleTimeString(),
				isLive: true
			};
			if (!this.joinedAt) this.joinedAt = sessionData.joinedAt;

			set(this.presenceRef, sessionData).catch(err => console.error("Presence update failed:", err));
		};

		// Initial set
		updatePresence();
		onDisconnect(this.presenceRef).remove().catch(err => console.error("onDisconnect failed:", err));

		// Heartbeat every 60 seconds to keep session alive and update timestamp
		this.heartbeatInterval = setInterval(updatePresence, 60000);
	};

	setTimeOutBootScreen = () => {
		setTimeout(() => {
			this.setState({ booting_screen: false });
		}, 2000);
	};

	getLocalData = () => {
		// Get Previously selected Background Image or set video as default
		let bg_image_name = localStorage.getItem('bg-image');

		// Always set 'video' as default for new visits or if no wallpaper is stored
		if (bg_image_name === null || bg_image_name === undefined) {
			bg_image_name = 'video';
			localStorage.setItem('bg-image', bg_image_name);
		}

		// Set the wallpaper from local storage
		this.setState({ bg_image_name });

		let booting_screen = localStorage.getItem('booting_screen');
		if (booting_screen !== null && booting_screen !== undefined) {
			// user has visited site before
			this.setState({ booting_screen: false });
		} else {
			// user is visiting site for the first time
			localStorage.setItem('booting_screen', false);
			this.setTimeOutBootScreen();
		}

		// get shutdown state
		let shut_down = localStorage.getItem('shut-down');
		if (shut_down !== null && shut_down !== undefined && shut_down === 'true') this.shutDown();
		else {
			// Get previous lock screen state
			let screen_locked = localStorage.getItem('screen-locked');
			if (screen_locked !== null && screen_locked !== undefined) {
				this.setState({ screen_locked: screen_locked === 'true' ? true : false });
			}
		}
	};

	lockScreen = () => {
		// google analytics
		ReactGA.send({ hitType: "pageview", page: "/lock-screen", title: "Lock Screen" });
		ReactGA.event({
			category: `Screen Change`,
			action: `Set Screen to Locked`
		});

		document.getElementById('status-bar').blur();
		setTimeout(() => {
			this.setState({ screen_locked: true });
		}, 100); // waiting for all windows to close (transition-duration)
		localStorage.setItem('screen-locked', true);
	};

	unLockScreen = () => {
		ReactGA.send({ hitType: "pageview", page: "/desktop", title: "Custom Title" });

		window.removeEventListener('click', this.unLockScreen);
		window.removeEventListener('keypress', this.unLockScreen);

		this.setState({ screen_locked: false });
		localStorage.setItem('screen-locked', false);
	};

	changeBackgroundImage = (img_name) => {
		this.setState({ bg_image_name: img_name });
		localStorage.setItem('bg-image', img_name);
	};

	shutDown = () => {
		ReactGA.send({ hitType: "pageview", page: "/switch-off", title: "Custom Title" });

		ReactGA.event({
			category: `Screen Change`,
			action: `Switched off the Ubuntu`
		});

		document.getElementById('status-bar').blur();
		this.setState({ shutDownScreen: true });
		localStorage.setItem('shut-down', true);
	};

	turnOn = () => {
		ReactGA.send({ hitType: "pageview", page: "/desktop", title: "Custom Title" });

		this.setState({ shutDownScreen: false, booting_screen: true });
		this.setTimeOutBootScreen();
		localStorage.setItem('shut-down', false);
	};

	render() {
		return (
			<div className="w-screen h-screen overflow-hidden" id="monitor-screen">
				<LockScreen
					isLocked={this.state.screen_locked}
					bgImgName={this.state.bg_image_name}
					unLockScreen={this.unLockScreen}
				/>
				<BootingScreen
					visible={this.state.booting_screen}
					isShutDown={this.state.shutDownScreen}
					turnOn={this.turnOn}
				/>
				<Navbar lockScreen={this.lockScreen} shutDown={this.shutDown} />
				<Desktop bg_image_name={this.state.bg_image_name} changeBackgroundImage={this.changeBackgroundImage} />
			</div>
		);
	}
}
