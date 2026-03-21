import React, { Component } from 'react';
import Clock from '../util components/clock';
import Status from '../util components/status';
import StatusCard from '../util components/status_card';
import LiveCount from '../util components/live_count';

export default class Navbar extends Component {
	constructor() {
		super();
		this.state = {
			status_card: false
		};
	}

	render() {
		return (
			<div className="main-navbar-vp absolute top-0 right-0 w-screen flex flex-nowrap justify-between items-center text-white text-sm select-none z-50 bg-gradient-to-b from-black/70 to-transparent px-4 py-1.5 transition-all duration-300">
				
				{/* Left Side: Live Count */}
				<div className="flex items-center space-x-2">
					<LiveCount />
				</div>

				{/* Center: Clock */}
				<div className="absolute left-1/2 transform -translate-x-1/2 font-medium">
					<Clock />
				</div>

				{/* Right Side: System Icons (Wi-Fi, Battery, etc) */}
				<div
					id="status-bar"
					tabIndex="0"
					onClick={() => {
						this.setState({ status_card: !this.state.status_card });
					}}
					className="relative outline-none transition duration-100 ease-in-out cursor-pointer flex items-center mb-0.5"
				>
					<Status />
					<StatusCard
						shutDown={this.props.shutDown}
						lockScreen={this.props.lockScreen}
						visible={this.state.status_card}
						toggleVisible={() => {
							this.setState({ status_card: false });
						}}
						nightLight={this.props.nightLight}
						toggleNightLight={this.props.toggleNightLight}
					/>
				</div>
			</div>
		);
	}
}
