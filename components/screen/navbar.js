import React, { Component } from 'react';
import Clock from '../util components/clock';
import Status from '../util components/status';
import StatusCard from '../util components/status_card';
import LiveCount from '../util components/live_count';

const DEFAULT_DESKTOP_NOTIFICATIONS = [
	{
		id: 'welcome',
		app: 'System • Ubuntu 24.04',
		title: 'Welcome to Ashin’s Workspace',
		body: 'Press Ctrl+K or click the top-left Activities pill to search apps & projects.',
		time: 'now'
	},
	{
		id: 'github',
		app: 'GitHub',
		title: 'ashinshanly/portfolio',
		body: 'Explore distributed systems, ML pipelines, and interactive apps.',
		time: '4m'
	}
];

export default class Navbar extends Component {
	constructor() {
		super();
		const now = new Date();
		this.state = {
			status_card: false,
			calendar_open: false,
			dnd: false,
			notifications: DEFAULT_DESKTOP_NOTIFICATIONS,
			viewMonth: now.getMonth(),
			viewYear: now.getFullYear()
		};
	}

	changeMonth = (delta) => {
		let nextMonth = this.state.viewMonth + delta;
		let nextYear = this.state.viewYear;
		if (nextMonth < 0) {
			nextMonth = 11;
			nextYear -= 1;
		} else if (nextMonth > 11) {
			nextMonth = 0;
			nextYear += 1;
		}
		this.setState({ viewMonth: nextMonth, viewYear: nextYear });
	};

	renderCalendarPopover() {
		const { calendar_open, dnd, notifications, viewMonth, viewYear } = this.state;
		const today = new Date();
		const monthNames = [
			'January', 'February', 'March', 'April', 'May', 'June',
			'July', 'August', 'September', 'October', 'November', 'December'
		];
		const dayHeaders = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
		const firstDay = new Date(viewYear, viewMonth, 1).getDay();
		const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

		const cells = [];
		for (let i = 0; i < firstDay; i++) cells.push(null);
		for (let d = 1; d <= daysInMonth; d++) cells.push(d);

		return (
			<div
				id="gnome-calendar-popover"
				onClick={(e) => e.stopPropagation()}
				className={
					'absolute top-9 left-1/2 -translate-x-1/2 w-[340px] md:w-[600px] rounded-[24px] p-4 shadow-2xl border border-white/15 bg-[#111827]/90 backdrop-blur-3xl text-white transition-all duration-200 origin-top z-50 ' +
					(calendar_open
						? 'scale-100 opacity-100 pointer-events-auto'
						: 'scale-95 opacity-0 pointer-events-none')
				}
			>
				<div className="grid grid-cols-1 md:grid-cols-12 gap-4">
					{/* Left Column: GNOME Notification Center */}
					<div className="md:col-span-7 flex flex-col justify-between md:border-r border-white/10 md:pr-4">
						<div>
							<div className="flex items-center justify-between mb-3">
								<span className="text-xs font-semibold uppercase tracking-wider text-white/70">
									Notifications
								</span>
								{notifications.length > 0 && (
									<button
										type="button"
										onClick={() => this.setState({ notifications: [] })}
										className="text-xs text-cyan-400 hover:text-cyan-300 font-medium px-2 py-0.5 rounded-full hover:bg-white/5 transition"
									>
										Clear
									</button>
								)}
							</div>

							{notifications.length === 0 ? (
								<div className="py-10 flex flex-col items-center justify-center text-white/40 text-xs">
									<svg className="w-8 h-8 mb-2 opacity-40" fill="currentColor" viewBox="0 0 24 24">
										<path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
									</svg>
									<span>No Notifications</span>
								</div>
							) : (
								<div className="space-y-2">
									{notifications.map((n) => (
										<div
											key={n.id}
											className="p-3 rounded-2xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 transition flex flex-col gap-1"
										>
											<div className="flex items-center justify-between text-[11px] text-white/60">
												<span className="font-semibold text-cyan-300">{n.app}</span>
												<div className="flex items-center gap-2">
													<span>{n.time}</span>
													<button
														type="button"
														aria-label="Dismiss notification"
														onClick={() =>
															this.setState({
																notifications: notifications.filter((item) => item.id !== n.id)
															})
														}
														className="hover:text-white"
													>
														×
													</button>
												</div>
											</div>
											<div className="text-xs font-semibold text-white">{n.title}</div>
											<div className="text-[11px] text-white/75 leading-relaxed">{n.body}</div>
										</div>
									))}
								</div>
							)}
						</div>

						{/* Bottom Do Not Disturb Switch */}
						<div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
							<span className="text-xs font-medium text-white/80">Do Not Disturb</span>
							<button
								type="button"
								aria-label="Toggle Do Not Disturb"
								onClick={() => this.setState({ dnd: !dnd })}
								className={`w-10 h-5 rounded-full transition-colors p-0.5 flex items-center ${
									dnd ? 'bg-cyan-500 justify-end' : 'bg-white/20 justify-start'
								}`}
							>
								<span className="w-4 h-4 rounded-full bg-white shadow" />
							</button>
						</div>
					</div>

					{/* Right Column: Interactive GNOME Calendar */}
					<div className="md:col-span-5 flex flex-col justify-between">
						<div>
							<div className="mb-2">
								<div className="text-[11px] uppercase tracking-wider text-cyan-400 font-semibold">
									{today.toLocaleDateString('en-US', { weekday: 'long' })}
								</div>
								<div className="text-lg font-bold text-white leading-tight">
									{today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
								</div>
							</div>

							<div className="flex items-center justify-between mb-2 mt-3">
								<span className="text-xs font-semibold text-white/90">
									{monthNames[viewMonth]} {viewYear}
								</span>
								<div className="flex items-center gap-1">
									<button
										type="button"
										aria-label="Previous month"
										onClick={() => this.changeMonth(-1)}
										className="w-6 h-6 rounded-full hover:bg-white/10 flex items-center justify-center text-white/80"
									>
										‹
									</button>
									<button
										type="button"
										aria-label="Next month"
										onClick={() => this.changeMonth(1)}
										className="w-6 h-6 rounded-full hover:bg-white/10 flex items-center justify-center text-white/80"
									>
										›
									</button>
								</div>
							</div>

							<div className="grid grid-cols-7 gap-1 text-center text-[10px] text-white/50 mb-1">
								{dayHeaders.map((d, idx) => (
									<span key={idx} className="font-semibold">
										{d}
									</span>
								))}
							</div>

							<div className="grid grid-cols-7 gap-1 text-center text-xs">
								{cells.map((day, idx) => {
									if (!day) return <span key={idx} className="h-6" />;
									const isToday =
										day === today.getDate() &&
										viewMonth === today.getMonth() &&
										viewYear === today.getFullYear();
									return (
										<span
											key={idx}
											className={`h-6 w-6 mx-auto flex items-center justify-center rounded-full text-[11px] ${
												isToday
													? 'bg-cyan-500 text-black font-bold shadow-[0_0_10px_rgba(6,182,212,0.6)]'
													: 'text-white/85 hover:bg-white/10'
											}`}
										>
											{day}
										</span>
									);
								})}
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	render() {
		return (
			<div className="main-navbar-vp fixed top-0 left-0 right-0 h-8 w-screen flex flex-nowrap justify-between items-center text-white text-xs select-none z-50 bg-[#0B101B]/95 backdrop-blur-xl border-b border-cyan-300/20 shadow-[0_2px_14px_rgba(0,0,0,0.7)] px-3 transition-all duration-300">
				{/* Left Side: GNOME 46 Activities Pill + Live Count */}
				<div className="flex items-center space-x-2.5">
					<button
						type="button"
						id="gnome-activities-pill"
						aria-label="Open Activities and Search (Ctrl+K)"
						title="Activities & Quick Search (Ctrl+K)"
						onClick={() => {
							if (typeof window !== 'undefined') {
								window.dispatchEvent(new CustomEvent('ubuntu-toggle-spotlight'));
							}
						}}
						className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.08] hover:bg-white/[0.16] border border-white/10 transition-all cursor-pointer"
					>
						<span className="w-3.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.8)]" />
						<span className="w-1.5 h-1.5 rounded-full bg-white/40" />
					</button>
					<LiveCount />
				</div>

				{/* Center: Clickable Clock + GNOME Calendar & Notification Center */}
				<div className="absolute left-1/2 transform -translate-x-1/2 font-medium">
					<button
						type="button"
						id="navbar-clock-btn"
						onClick={() =>
							this.setState({
								calendar_open: !this.state.calendar_open,
								status_card: false
							})
						}
						className="px-3 py-0.5 rounded-full hover:bg-white/10 transition-colors flex items-center gap-1.5 cursor-pointer"
					>
						<Clock />
						{this.state.notifications.length > 0 && !this.state.dnd && (
							<span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
						)}
					</button>
					{this.renderCalendarPopover()}
				</div>

				{/* Right Side: System Icons (Wi-Fi, Battery, etc) */}
				<div
					id="status-bar"
					tabIndex="0"
					onClick={() => {
						this.setState({
							status_card: !this.state.status_card,
							calendar_open: false
						});
					}}
					className="relative outline-none transition duration-100 ease-in-out cursor-pointer flex items-center px-2 py-0.5 rounded-full hover:bg-white/10"
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
