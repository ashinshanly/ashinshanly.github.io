import React, { Component } from 'react';
import onClickOutside from 'react-onclickoutside';

class Slider extends Component {
	render() {
		return (
			<input
				type="range"
				onChange={this.props.onChange}
				className={`w-full h-2.5 rounded-full appearance-none cursor-pointer border-none bg-white/20 overflow-hidden ${this.props.className}`}
				style={{
					'--slider-progress': `${this.props.value}%`,
					background: `linear-gradient(to right, #06b6d4 ${this.props.value}%, rgba(255,255,255,0.2) ${this.props.value}%)`
				}}
				name={this.props.name}
				min="0"
				max="100"
				value={this.props.value}
				step="1"
			/>
		);
	}
}

export class StatusCard extends Component {
	constructor() {
		super();
		this.wrapperRef = React.createRef();
		this.state = {
			sound_level: 75,
			brightness_level: 100,
			wifi_on: true,
			bluetooth_on: false,
			power_mode: 'Performance',
			battery_text: '88% • Charging'
		};
	}

	handleClickOutside = () => {
		if (this.props.visible) {
			this.props.toggleVisible();
		}
	};

	componentDidMount() {
		this.setState(
			{
				sound_level: localStorage.getItem('sound-level') || 75,
				brightness_level: localStorage.getItem('brightness-level') || 100
			},
			() => {
				this.applyFilter();
			}
		);

		if (typeof navigator !== 'undefined' && typeof navigator.getBattery === 'function') {
			navigator
				.getBattery()
				.then((battery) => {
					const pct = Math.round(battery.level * 100);
					const status = battery.charging ? 'Charging' : 'Remaining';
					this.setState({ battery_text: `${pct}% • ${status}` });
				})
				.catch(() => {});
		}
	}

	componentDidUpdate(prevProps) {
		if (prevProps.nightLight !== this.props.nightLight) {
			this.applyFilter();
		}
	}

	applyFilter = () => {
		const monitor = document.getElementById('monitor-screen');
		if (!monitor) return;
		const brightness = (3 / 400) * this.state.brightness_level + 0.25;
		const nightLight = this.props.nightLight ? ' sepia(40%) hue-rotate(-50deg)' : '';
		monitor.style.filter = `brightness(${brightness})${nightLight}`;
	};

	handleBrightness = (e) => {
		this.setState({ brightness_level: e.target.value }, this.applyFilter);
		localStorage.setItem('brightness-level', e.target.value);
	};

	handleSound = (e) => {
		this.setState({ sound_level: e.target.value });
		localStorage.setItem('sound-level', e.target.value);
	};

	togglePowerMode = () => {
		const modes = ['Performance', 'Balanced', 'Power Saver'];
		const nextIdx = (modes.indexOf(this.state.power_mode) + 1) % modes.length;
		this.setState({ power_mode: modes[nextIdx] });
	};

	render() {
		const { wifi_on, bluetooth_on, power_mode, battery_text } = this.state;

		return (
			<div
				ref={this.wrapperRef}
				className={
					'absolute top-8 right-1 md:right-4 w-80 md:w-96 rounded-[28px] p-5 shadow-2xl border border-white/15 bg-[#111827]/90 backdrop-blur-3xl transition-all duration-300 transform origin-top-right ' +
					(this.props.visible
						? ' scale-100 opacity-100 pointer-events-auto'
						: ' scale-95 opacity-0 pointer-events-none')
				}
				onClick={(e) => e.stopPropagation()}
			>
				{/* Top Header / Status context */}
				<div className="flex justify-between items-center mb-5 pl-1 pr-1">
					<div className="flex space-x-2.5 items-center opacity-90">
						<img
							src="./themes/Yaru/status/network-wireless-signal-good-symbolic.svg"
							className="w-4 h-4"
							alt="wifi"
						/>
						<img
							src="./themes/Yaru/status/battery-good-symbolic.svg"
							className="w-4 h-4"
							alt="battery"
						/>
						<span className="text-xs text-white font-medium tracking-wide">
							{battery_text}
						</span>
					</div>
					<div className="flex space-x-3 items-center opacity-80">
						<svg
							id="open-settings"
							onClick={() => {
								if (this.props.toggleVisible) this.props.toggleVisible();
							}}
							className="w-5 h-5 cursor-pointer hover:text-cyan-400 transition"
							fill="currentColor"
							viewBox="0 0 20 20"
							title="Settings"
						>
							<path d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" />
						</svg>
						<svg
							onClick={this.props.lockScreen}
							className="w-5 h-5 cursor-pointer hover:text-amber-400 transition"
							fill="currentColor"
							viewBox="0 0 20 20"
							title="Lock Screen"
						>
							<path
								fillRule="evenodd"
								d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
								clipRule="evenodd"
							/>
						</svg>
						<svg
							onClick={this.props.shutDown}
							className="w-5 h-5 cursor-pointer hover:text-red-400 transition"
							fill="currentColor"
							viewBox="0 0 20 20"
							title="Power Off"
						>
							<path
								fillRule="evenodd"
								d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
								clipRule="evenodd"
							/>
						</svg>
					</div>
				</div>

				{/* GNOME 46 Quick Settings Grid */}
				<div className="grid grid-cols-2 gap-2.5 mb-6">
					{/* Internet Pill */}
					<button
						type="button"
						onClick={() => this.setState({ wifi_on: !wifi_on })}
						className={`col-span-1 rounded-[22px] p-3.5 flex flex-col justify-center text-left cursor-pointer transition-colors ${
							wifi_on
								? 'bg-cyan-500 text-white hover:bg-cyan-400'
								: 'bg-white/10 text-white hover:bg-white/20'
						}`}
					>
						<div className="flex items-center space-x-2.5 mb-0.5">
							<svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
								<path
									fillRule="evenodd"
									d="M17.778 8.222c-4.296-4.296-11.26-4.296-15.556 0A1 1 0 01.808 6.808c5.076-5.077 13.308-5.077 18.384 0a1 1 0 01-1.414 1.414zM14.95 11.05a7 7 0 00-9.9 0 1 1 0 01-1.414-1.414 9 9 0 0112.728 0 1 1 0 01-1.414 1.414zM12.12 13.88a3 3 0 00-4.242 0 1 1 0 01-1.415-1.415 5 5 0 017.072 0 1 1 0 01-1.415 1.415zM9 16a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z"
									clipRule="evenodd"
								/>
							</svg>
							<span className="font-semibold text-[13px] tracking-wide">Wi-Fi</span>
						</div>
						<span className="text-[11px] text-white/80 ml-7">
							{wifi_on ? 'Ashin_5GHz' : 'Off'}
						</span>
					</button>

					{/* Bluetooth Pill */}
					<button
						type="button"
						onClick={() => this.setState({ bluetooth_on: !bluetooth_on })}
						className={`col-span-1 rounded-[22px] p-3.5 flex flex-col justify-center text-left cursor-pointer transition-colors ${
							bluetooth_on
								? 'bg-cyan-500 text-white hover:bg-cyan-400'
								: 'bg-white/10 text-white hover:bg-white/20'
						}`}
					>
						<div className="flex items-center space-x-2.5 mb-0.5">
							<img
								width="16px"
								height="16px"
								src="./themes/Yaru/status/bluetooth-symbolic.svg"
								alt="bluetooth"
								className="opacity-90 ml-1"
							/>
							<span className="font-semibold text-[13px] tracking-wide">Bluetooth</span>
						</div>
						<span className="text-[11px] text-white/75 ml-7">
							{bluetooth_on ? 'Connected' : 'Off'}
						</span>
					</button>

					{/* Power Mode Pill */}
					<button
						type="button"
						onClick={this.togglePowerMode}
						className={`col-span-1 rounded-[22px] p-3.5 flex flex-col justify-center text-left cursor-pointer transition-colors ${
							power_mode === 'Performance'
								? 'bg-cyan-500 text-white hover:bg-cyan-400'
								: 'bg-white/10 text-white hover:bg-white/20'
						}`}
					>
						<div className="flex items-center space-x-2.5 mb-0.5">
							<svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
								<path
									fillRule="evenodd"
									d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
									clipRule="evenodd"
								/>
							</svg>
							<span className="font-semibold text-[13px] tracking-wide">Power Mode</span>
						</div>
						<span className="text-[11px] text-white/80 ml-7">{power_mode}</span>
					</button>

					{/* Night Light Pill */}
					<button
						type="button"
						onClick={this.props.toggleNightLight}
						className={`col-span-1 rounded-[22px] p-3.5 flex flex-col justify-center text-left cursor-pointer transition-colors ${
							this.props.nightLight
								? 'bg-cyan-500 text-white hover:bg-cyan-400'
								: 'bg-white/10 text-white hover:bg-white/20'
						}`}
					>
						<div className="flex items-center space-x-2.5 mb-0.5">
							<img
								width="16px"
								height="16px"
								src="./themes/Yaru/status/display-brightness-symbolic.svg"
								alt="night light"
								className="opacity-90 ml-1"
							/>
							<span className="font-semibold text-[13px] tracking-wide">Night Light</span>
						</div>
						<span className="text-[11px] text-white/75 ml-7">
							{this.props.nightLight ? 'On' : 'Off'}
						</span>
					</button>
				</div>

				{/* Sliders Area (GNOME 46 / Material Design 3 aesthetic) */}
				<div className="space-y-5 mb-2 px-2">
					{/* Brightness */}
					<div className="flex items-center space-x-4">
						<img
							width="18px"
							height="18px"
							src="./themes/Yaru/status/display-brightness-symbolic.svg"
							alt="brightness"
							className="opacity-70"
						/>
						<Slider
							onChange={this.handleBrightness}
							value={this.state.brightness_level}
							name="brightness_range"
							className="android-range"
						/>
					</div>

					{/* Volume */}
					<div className="flex items-center space-x-4">
						<img
							width="18px"
							height="18px"
							src="./themes/Yaru/status/audio-headphones-symbolic.svg"
							alt="volume"
							className="opacity-70"
						/>
						<Slider
							onChange={this.handleSound}
							value={this.state.sound_level}
							name="headphone_range"
							className="android-range"
						/>
					</div>
				</div>
			</div>
		);
	}
}

export default onClickOutside(StatusCard);
