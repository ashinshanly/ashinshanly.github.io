import React, { Component } from 'react';
import SmallArrow from './small_arrow';
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
			brightness_level: 100
		};
	}

	handleClickOutside = () => {
		if (this.props.visible) {
			this.props.toggleVisible();
		}
	};

	componentDidMount() {
		this.setState({
			sound_level: localStorage.getItem('sound-level') || 75,
			brightness_level: localStorage.getItem('brightness-level') || 100
		}, () => {
			this.applyFilter();
		})
	}

	componentDidUpdate(prevProps) {
		if (prevProps.nightLight !== this.props.nightLight) {
			this.applyFilter();
		}
	}

	applyFilter = () => {
		const brightness = 3 / 400 * this.state.brightness_level + 0.25;
		const nightLight = this.props.nightLight ? ' sepia(40%) hue-rotate(-50deg)' : '';
		document.getElementById('monitor-screen').style.filter = `brightness(${brightness})${nightLight}`;
	}

	handleBrightness = (e) => {
		this.setState({ brightness_level: e.target.value }, this.applyFilter);
		localStorage.setItem('brightness-level', e.target.value);
	};

	handleSound = (e) => {
		this.setState({ sound_level: e.target.value });
		localStorage.setItem('sound-level', e.target.value);
	};

	render() {
		return (
			<div
				ref={this.wrapperRef}
				className={
					'absolute top-8 right-1 md:right-4 w-80 md:w-96 rounded-[28px] p-5 shadow-2xl border border-white/10 bg-black/60 backdrop-blur-3xl transition-all duration-300 transform origin-top-right ' +
					(this.props.visible ? ' scale-100 opacity-100 pointer-events-auto' : ' scale-95 opacity-0 pointer-events-none')
				}
				onClick={(e) => e.stopPropagation()}
			>
				{/* Top Header / Status context */}
				<div className="flex justify-between items-center mb-6 pl-1 pr-1">
					<div className="flex space-x-3 items-center opacity-80">
						<img src="./themes/Yaru/status/network-wireless-signal-good-symbolic.svg" className="w-4 h-4" alt="wifi" />
						<img src="./themes/Yaru/status/battery-good-symbolic.svg" className="w-4 h-4" alt="battery" />
						<span className="text-xs text-white font-medium tracking-wide">33% - 2 hr 30 min</span>
					</div>
					<div className="flex space-x-3 items-center opacity-70">
						<svg className="w-5 h-5 cursor-pointer hover:text-cyan-400 transition" fill="currentColor" viewBox="0 0 20 20"><path d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"></path></svg>
						<svg onClick={this.props.shutDown} className="w-5 h-5 cursor-pointer hover:text-red-400 transition" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd"></path></svg>
					</div>
				</div>

				{/* Quick Settings Grid */}
				<div className="grid grid-cols-2 gap-3 mb-7">
					
					{/* Internet Pill */}
					<div className="col-span-1 rounded-[24px] bg-cyan-500 text-white p-3.5 flex flex-col justify-center cursor-pointer hover:bg-cyan-400 transition-colors">
						<div className="flex items-center space-x-2.5 mb-0.5">
							<svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M17.778 8.222c-4.296-4.296-11.26-4.296-15.556 0A1 1 0 01.808 6.808c5.076-5.077 13.308-5.077 18.384 0a1 1 0 01-1.414 1.414zM14.95 11.05a7 7 0 00-9.9 0 1 1 0 01-1.414-1.414 9 9 0 0112.728 0 1 1 0 01-1.414 1.414zM12.12 13.88a3 3 0 00-4.242 0 1 1 0 01-1.415-1.415 5 5 0 017.072 0 1 1 0 01-1.415 1.415zM9 16a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd"></path></svg>
							<span className="font-semibold text-[13px] tracking-wide">Internet</span>
						</div>
						<span className="text-[11px] text-white/80 ml-7">Home-Network</span>
					</div>

					{/* Bluetooth Pill */}
					<div className="col-span-1 rounded-[24px] bg-white/10 text-white p-3.5 flex flex-col justify-center cursor-pointer hover:bg-white/20 transition-colors">
						<div className="flex items-center space-x-2.5 mb-0.5">
							<img width="16px" height="16px" src="./themes/Yaru/status/bluetooth-symbolic.svg" alt="bluetooth" className="opacity-90 ml-1" />
							<span className="font-semibold text-[13px] tracking-wide">Bluetooth</span>
						</div>
						<span className="text-[11px] text-white/50 ml-7">Off</span>
					</div>

					{/* Night Light Pill */}
					<div onClick={this.props.toggleNightLight} className={`col-span-1 rounded-[24px] p-3.5 flex flex-col justify-center cursor-pointer transition-colors ${this.props.nightLight ? 'bg-cyan-500 text-white hover:bg-cyan-400' : 'bg-white/10 text-white hover:bg-white/20'}`}>
						<div className="flex items-center space-x-2.5 mb-0.5">
							<img width="16px" height="16px" src="./themes/Yaru/status/display-brightness-symbolic.svg" alt="night light" className="opacity-90 ml-1" />
							<span className="font-semibold text-[13px] tracking-wide">Night Light</span>
						</div>
						<span className="text-[11px] text-white/50 ml-7">{this.props.nightLight ? 'On' : 'Off'}</span>
					</div>

					{/* Lock Screen Pill */}
					<div onClick={this.props.lockScreen} className="col-span-1 rounded-[24px] bg-white/10 text-white p-3.5 flex flex-col justify-center cursor-pointer hover:bg-white/20 transition-colors">
						<div className="flex items-center space-x-2.5 mb-0.5">
							<img width="16px" height="16px" src="./themes/Yaru/status/changes-prevent-symbolic.svg" alt="lock" className="opacity-90 ml-1" />
							<span className="font-semibold text-[13px] tracking-wide">Lock Screen</span>
						</div>
						<span className="text-[11px] text-white/50 ml-7">Secure</span>
					</div>

				</div>

				{/* Sliders Area (Material Design 3 aesthetic) */}
				<div className="space-y-6 mb-3 px-2">
					{/* Brightness */}
					<div className="flex items-center space-x-4">
						<img width="18px" height="18px" src="./themes/Yaru/status/display-brightness-symbolic.svg" alt="brightness" className="opacity-70" />
						<Slider
							onChange={this.handleBrightness}
							value={this.state.brightness_level}
							name="brightness_range"
							className="android-range"
						/>
					</div>

					{/* Volume */}
					<div className="flex items-center space-x-4">
						<img width="18px" height="18px" src="./themes/Yaru/status/audio-headphones-symbolic.svg" alt="volume" className="opacity-70" />
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
