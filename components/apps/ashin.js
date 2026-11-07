import React, { Component, useState } from 'react';
import ReactGA from 'react-ga4';
import { CardContainer, CardBody, CardItem } from '../util components/3d-card';
import { HoverGlare } from '../util components/hover-glare';

export class AboutAshin extends Component {
    constructor() {
        super();
        this.screens = {};
        this.state = {
            screen: () => {},
            active_screen: 'about',
            navbar: false,
        };
    }

    componentDidMount() {
        this.screens = {
            about: <About onNavigate={this.navigateById} />,
            experience: <Experience />,
            education: <Education />,
            skills: <Skills />,
            projects: <Projects />,
            resume: <Resume />,
        };

        let lastVisitedScreen = localStorage.getItem('about-section');
        if (lastVisitedScreen === null || lastVisitedScreen === undefined || !this.screens[lastVisitedScreen]) {
            lastVisitedScreen = 'about';
        }

        this.changeScreen(document.getElementById(lastVisitedScreen) || { id: lastVisitedScreen });
    }

    navigateById = (screenId) => {
        if (!screenId || !this.screens[screenId]) return;
        this.changeScreen({ id: screenId });
    };

    changeScreen = (e) => {
        if (!e) return;
        const screen = e.id || e.currentTarget?.id || e.target?.id;
        if (!screen || !this.screens[screen]) return;

        localStorage.setItem('about-section', screen);
        ReactGA.send({ hitType: 'pageview', page: `/${screen}`, title: 'Custom Title' });

        this.setState({
            screen: this.screens[screen],
            active_screen: screen,
            navbar: false,
        });
    };

    showNavBar = () => {
        this.setState({ navbar: !this.state.navbar });
    };

    openOrbyVoice = () => {
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('portfolio-open-orby'));
        }
    };

    renderNavLinks = () => {
        const navItems = [
            { id: 'about', label: 'About Me', badge: 'Bio', icon: './themes/Yaru/status/about.svg' },
            { id: 'experience', label: 'Experience', badge: '3 Roles', icon: './themes/Yaru/status/experience.svg' },
            { id: 'education', label: 'Education', badge: 'IIT-GN', icon: './themes/Yaru/status/education.svg' },
            { id: 'skills', label: 'Skills', badge: 'Stack', icon: './themes/Yaru/status/skills.svg' },
            { id: 'projects', label: 'Projects', badge: '8 Built', icon: './themes/Yaru/status/projects.svg' },
            { id: 'resume', label: 'Resume', badge: 'PDF', icon: './themes/Yaru/status/download.svg' },
        ];

        return (
            <>
                {navItems.map((item) => {
                    const active = this.state.active_screen === item.id;
                    return (
                        <div
                            key={item.id}
                            id={item.id}
                            tabIndex="0"
                            onFocus={this.changeScreen}
                            onClick={this.changeScreen}
                            className={
                                (active
                                    ? 'bg-gradient-to-r from-cyan-500/25 via-blue-500/20 to-purple-500/15 border-l-2 border-cyan-400 text-white shadow-[0_4px_20px_rgba(6,182,212,0.15)]'
                                    : 'text-slate-300 hover:bg-white/[0.05] hover:text-white border-l-2 border-transparent') +
                                ' w-44 md:w-full rounded-r-xl cursor-pointer outline-none py-2.5 px-3 my-0.5 flex justify-between items-center transition-all duration-150'
                            }
                        >
                            <div className="flex items-center min-w-0">
                                <img className="w-4 h-4 opacity-90 flex-shrink-0" alt={item.label} src={item.icon} />
                                <span className="ml-2.5 text-xs md:text-sm font-medium truncate">{item.label}</span>
                            </div>
                            <span
                                className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                                    active
                                        ? 'bg-cyan-400/20 text-cyan-300 border border-cyan-400/30'
                                        : 'bg-white/5 text-slate-400'
                                }`}
                            >
                                {item.badge}
                            </span>
                        </div>
                    );
                })}
            </>
        );
    };

    render() {
        const mobileTabs = [
            { id: 'about', label: 'About' },
            { id: 'experience', label: 'Experience' },
            { id: 'education', label: 'Education' },
            { id: 'skills', label: 'Skills' },
            { id: 'projects', label: 'Projects' },
            { id: 'resume', label: 'Resume' },
        ];

        return (
            <div className="w-full h-full flex flex-col md:flex-row bg-[#080C14] text-white select-none relative overflow-hidden">
                {/* Desktop Left Glassmorphic Navigation Rail */}
                <div className="hidden md:flex flex-col justify-between w-56 lg:w-60 text-sm overflow-y-auto windowMainScreen border-r border-white/10 bg-[#0B111E]/90 backdrop-blur-xl p-3 flex-shrink-0">
                    <div>
                        {/* Mini Sidebar Profile Card */}
                        <div className="p-3 mb-3 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center gap-3">
                            <img
                                src="./images/logos/headshot.jpg"
                                alt="Ashin Shanly"
                                className="w-10 h-10 rounded-full object-cover ring-2 ring-cyan-400/50 flex-shrink-0"
                            />
                            <div className="min-w-0">
                                <div className="text-xs font-bold text-white truncate">Ashin Shanly</div>
                                <div className="text-[11px] text-cyan-400 font-medium truncate">SWE III @ Google</div>
                            </div>
                        </div>

                        <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400 px-2 mb-1.5">
                            Sections
                        </div>
                        {this.renderNavLinks()}
                    </div>

                    {/* Sidebar Bottom Voice Assistant Trigger */}
                    <div className="pt-3 mt-3 border-t border-white/10">
                        <button
                            type="button"
                            onClick={this.openOrbyVoice}
                            className="w-full p-2.5 rounded-2xl bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 hover:from-cyan-500/30 hover:to-purple-500/30 border border-cyan-400/30 flex items-center gap-2.5 text-left transition cursor-pointer group"
                        >
                            <span className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 via-cyan-400 to-white flex items-center justify-center shadow-[0_0_12px_rgba(34,211,238,0.6)] flex-shrink-0">
                                <span className="flex items-center gap-0.5">
                                    <span className="w-1 h-1.5 rounded-full bg-slate-950" />
                                    <span className="w-1 h-1.5 rounded-full bg-slate-950" />
                                </span>
                            </span>
                            <div className="min-w-0 flex-1">
                                <div className="text-xs font-bold text-cyan-200 group-hover:text-white truncate">
                                    Ask Orby AI
                                </div>
                                <div className="text-[10px] text-slate-400 truncate">Interactive Voice Guide</div>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Mobile Top Navigation Strip + Hamburger Drawer */}
                <div className="md:hidden flex items-center gap-1.5 px-2.5 py-2 bg-[#0B111E]/95 border-b border-white/10 overflow-x-auto scrollbar-hide flex-shrink-0 z-30">
                    {mobileTabs.map((tab) => {
                        const active = this.state.active_screen === tab.id;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => this.navigateById(tab.id)}
                                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                                    active
                                        ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.5)]'
                                        : 'bg-white/[0.06] text-slate-300 hover:bg-white/10'
                                }`}
                            >
                                {tab.label}
                            </button>
                        );
                    })}
                    <button
                        type="button"
                        onClick={this.openOrbyVoice}
                        className="ml-auto px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap bg-gradient-to-r from-cyan-500/30 to-purple-500/30 border border-cyan-400/40 text-cyan-200 flex items-center gap-1 flex-shrink-0"
                    >
                        <span>🎙️ Orby</span>
                    </button>
                </div>

                {/* Main Content Viewport */}
                <div
                    id="about-screen"
                    className="flex flex-col w-full md:w-4/5 justify-start items-center flex-grow bg-[#080C14] overflow-y-auto windowMainScreen relative"
                >
                    {this.state.screen}
                </div>
            </div>
        );
    }
}

export default AboutAshin;

export const displayAboutAshin = () => {
    return <AboutAshin />;
};

function About({ onNavigate }) {
    const [copied, setCopied] = useState(false);
    const [speakingBio, setSpeakingBio] = useState(false);

    const handleCopyEmail = () => {
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
            navigator.clipboard.writeText('ashinkoottala@gmail.com').catch(() => {});
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 2200);
    };

    const toggleAudioBio = () => {
        if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
        if (speakingBio) {
            window.speechSynthesis.cancel();
            setSpeakingBio(false);
            return;
        }
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(
            "Hi! I'm Ashin Shanly, a Software Engineer 3 at Google and Computer Science Master's silver medalist from IIT Gandhinagar. I specialize in distributed computing, petabyte-scale data engineering, and deep neural networks."
        );
        utter.rate = 1.03;
        utter.onend = () => setSpeakingBio(false);
        utter.onerror = () => setSpeakingBio(false);
        setSpeakingBio(true);
        window.speechSynthesis.speak(utter);
    };

    const stats = [
        { label: 'Current Role', value: 'Google', sub: 'Software Engineer III', color: 'text-cyan-400' },
        { label: 'M.Tech CSE', value: '9.00 CGPA', sub: 'IIT-GN Silver Medalist', color: 'text-amber-400' },
        { label: 'Research', value: '2× ACM', sub: 'CODS-COMAD Papers', color: 'text-purple-400' },
        { label: 'Scale Built', value: 'Petabyte+', sub: 'Spark, Delta & RAG AI', color: 'text-emerald-400' },
    ];

    const pillars = [
        {
            icon: '⚡',
            title: 'Distributed Systems & Fleet Scale',
            desc: 'Building high-throughput telemetry and elastic fleet optimization platforms at Google & Oracle.',
            tag: 'Google • OCI • Spark',
        },
        {
            icon: '🧠',
            title: 'Deep Learning & 3D Vision',
            desc: 'Published researcher in Implicit Neural Representations (+21% faster) & Siamese-GCN captioning.',
            tag: 'PyTorch • TensorFlow • LiDAR',
        },
        {
            icon: '🤖',
            title: 'Enterprise GenAI & Vector RAG',
            desc: 'Architected production LLM RAG pipelines that automated 60% of support queries with +30% accuracy.',
            tag: 'LLMs • Vector DB • RAG',
        },
        {
            icon: '🌌',
            title: 'Interactive Web & Audio Engines',
            desc: 'Creator of Lumina, MusicSync, and the 64×64 real-time collaborative GuestBook synth matrix.',
            tag: 'React • Next.js • WebAudio',
        },
    ];

    return (
        <div className="relative w-full flex flex-col items-center p-5 md:p-8 overflow-x-hidden">
            {/* Ambient Glows */}
            <div className="absolute top-6 right-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-[90px] pointer-events-none" />
            <div className="absolute bottom-10 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-[90px] pointer-events-none" />

            {/* Hero Card */}
            <div className="relative z-10 w-full max-w-4xl rounded-3xl bg-gradient-to-br from-white/[0.05] via-white/[0.02] to-transparent border border-white/10 p-6 md:p-8 backdrop-blur-2xl shadow-2xl flex flex-col md:flex-row items-center gap-6">
                <div className="relative group flex-shrink-0">
                    <div className="absolute -inset-1.5 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-full blur opacity-35 group-hover:opacity-65 transition duration-500" />
                    <div className="relative w-28 h-28 md:w-36 md:h-36 rounded-full p-[2px] bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600">
                        <div className="w-full h-full bg-[#0a0a0c] rounded-full overflow-hidden relative">
                            <img
                                className="w-full h-full object-cover brightness-105 contrast-105 transition-transform duration-500 group-hover:scale-105"
                                src="./images/logos/headshot.jpg"
                                alt="Ashin Shanly"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex-1 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-medium mb-3">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
                        </span>
                        Software Engineer III @ Google • M.Tech CSE @ IIT Gandhinagar
                    </div>

                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white mb-2">
                        Hey, I&apos;m{' '}
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400">
                            Ashin Shanly
                        </span>
                    </h1>

                    <p className="text-xs sm:text-sm md:text-base text-slate-300 leading-relaxed max-w-2xl">
                        I engineer <span className="text-cyan-300 font-semibold">planetary-scale distributed data systems</span>,{' '}
                        <span className="text-purple-300 font-semibold">deep neural networks</span>, and{' '}
                        <span className="text-blue-300 font-semibold">high-performance interactive applications</span>. When I&apos;m off the terminal, you&apos;ll find me on the badminton court, watching{' '}
                        <a
                            href="https://www.imdb.com/title/tt9335498/"
                            target="_blank"
                            rel="noreferrer"
                            className="text-cyan-400 hover:underline"
                        >
                            anime
                        </a>
                        , or swing trading.
                    </p>

                    {/* Action Pills */}
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 mt-4">
                        <button
                            type="button"
                            onClick={() => {
                                if (typeof window !== 'undefined') {
                                    window.dispatchEvent(new CustomEvent('portfolio-open-orby'));
                                }
                            }}
                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition cursor-pointer"
                        >
                            <span>🎙️ Talk to Orby AI</span>
                        </button>

                        <button
                            type="button"
                            onClick={toggleAudioBio}
                            className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                                speakingBio
                                    ? 'bg-rose-500/20 border-rose-400/50 text-rose-200 animate-pulse'
                                    : 'bg-white/5 hover:bg-white/10 border-white/15 text-slate-200'
                            }`}
                        >
                            <span>{speakingBio ? '⏹ Stop Audio Bio' : '🔊 Listen to 20s Bio'}</span>
                        </button>

                        <button
                            type="button"
                            onClick={handleCopyEmail}
                            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-medium text-slate-200 transition cursor-pointer"
                        >
                            {copied ? '✓ Copied ashinkoottala@gmail.com' : '📋 Copy Email'}
                        </button>
                    </div>
                </div>
            </div>

            {/* 4-Card Bento Telemetry Strip */}
            <div className="relative z-10 w-full max-w-4xl grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                {stats.map((st, idx) => (
                    <div
                        key={idx}
                        className="p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 transition flex flex-col justify-between"
                    >
                        <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                            {st.label}
                        </span>
                        <span className={`text-xl md:text-2xl font-black mt-1 ${st.color}`}>{st.value}</span>
                        <span className="text-xs text-slate-300 mt-0.5">{st.sub}</span>
                    </div>
                ))}
            </div>

            {/* 4 Core Engineering Pillars */}
            <div className="relative z-10 w-full max-w-4xl mt-6">
                <div className="flex items-center justify-between mb-3 px-1">
                    <h2 className="text-xs font-mono uppercase tracking-widest text-slate-400">
                        What I Build &amp; Research
                    </h2>
                    {onNavigate && (
                        <button
                            type="button"
                            onClick={() => onNavigate('projects')}
                            className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer"
                        >
                            Explore all projects →
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {pillars.map((p, i) => (
                        <div
                            key={i}
                            className="p-4 rounded-2xl bg-white/[0.025] hover:bg-white/[0.05] border border-white/10 transition flex items-start gap-3.5"
                        >
                            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center text-lg flex-shrink-0">
                                {p.icon}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-2">
                                    <h3 className="text-sm font-bold text-white">{p.title}</h3>
                                </div>
                                <p className="text-xs text-slate-300 leading-relaxed mt-1">{p.desc}</p>
                                <span className="inline-block mt-2 text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-cyan-300 border border-white/10">
                                    {p.tag}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Social & Research Links */}
            <div className="relative z-10 flex flex-wrap justify-center gap-3 mt-6 pb-4">
                <a
                    href="https://www.github.com/ashinshanly"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all hover:scale-105 text-xs md:text-sm font-semibold"
                >
                    <span>GitHub</span>
                </a>
                <a
                    href="https://www.linkedin.com/in/ashinshanly/"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/25 text-blue-300 rounded-2xl transition-all hover:scale-105 text-xs md:text-sm font-semibold"
                >
                    <span>LinkedIn</span>
                </a>
                <a
                    href="https://scholar.google.com/citations?user=Grl9bo0AAAAJ&hl=en"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 text-rose-300 rounded-2xl transition-all hover:scale-105 text-xs md:text-sm font-semibold"
                >
                    <span>🎓 Google Scholar Publications</span>
                </a>
            </div>
        </div>
    );
}

function Experience() {
    const experiences = [
        {
            title: 'Software Engineer III',
            company: 'Google',
            location: 'India',
            period: 'Aug 2025 - Current',
            color: '#4285F4',
            badge: 'Current Role',
            metrics: ['Alphabet Elastic Fleet', 'Planetary-Scale Telemetry', 'Trusted Data Insights'],
            stack: ['Distributed Systems', 'C++', 'Python', 'Borg / GCP', 'BigQuery', 'Data Pipelines'],
            points: [
                'Enabling Alphabet to run the most efficient and elastic fleet in the industry by providing trusted data and actionable insights.',
            ],
        },
        {
            title: 'Member of Technical Staff (IC2)',
            company: 'Oracle India Pvt Ltd',
            location: 'Bengaluru, India',
            period: 'Aug 2022 - Aug 2025',
            color: '#F80000',
            badge: '3 Years',
            metrics: ['60% Query Automation', '+40% Query Performance', '-25% Storage Cost'],
            stack: ['PySpark', 'Delta Lake', 'OCI', 'GenAI RAG', 'Vector DB', 'LLMs', 'SQL'],
            points: [
                'Architected petabyte-scale ETL pipelines using PySpark on OCI to reduce data processing latency and cost, delivering high-throughput real-time ingestion, transformation, and aggregation of global customer usage data.',
                'Designed and implemented an enterprise-wide Generative AI RAG chatbot, leveraging a vector database for high-speed document retrieval and fine-tuned LLMs. Automated 60% of manual query handling and enhanced query resolution accuracy by 30%.',
                'Led a team of 5 developers in redesigning data load processes by migrating from a legacy relational data warehouse to the Delta Lake ecosystem. Boosted query performance by 40%.',
                'Created an instance and rack decommissioning dashboard that accelerated throughput for decommissioning bare-metal and virtual machine instances, saving thousands of dollars annually.',
                'Led the design of robust data archival and purging frameworks. Achieved a 25% reduction in long-term storage costs and enhanced overall database performance.',
            ],
        },
        {
            title: 'Machine Vision Research Scientist Intern',
            company: 'TCS Research and Innovation Labs',
            location: 'India',
            period: 'May 2021 - Aug 2021',
            color: '#00AEEF',
            badge: 'Research Lab',
            metrics: ['+18% Model Accuracy', '3D LiDAR + Hyperspectral Fusion'],
            stack: ['Computer Vision', 'LiDAR Point Clouds', 'Hyperspectral Imaging', 'Python', 'Signal Processing'],
            points: [
                'Pioneered advanced research in tree segmentation by leveraging airborne and spaceborne LiDAR technology for geospatial analysis in forestry applications.',
                'Engineered an innovative tree segmentation model utilizing a hybrid machine learning and signal processing framework, achieving an 18% boost in model accuracy.',
                'Implemented cutting-edge data fusion techniques, integrating geospatial point cloud data with hyperspectral imagery for enhanced classification models.',
            ],
        },
    ];

    return (
        <div className="w-full max-w-4xl p-5 md:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-3 border-b border-white/10">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold text-white">Work Experience</h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                        Engineering distributed systems, petabyte data lakes, and applied AI across industry leaders
                    </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-mono self-start sm:self-auto">
                    Google • Oracle • TCS Research
                </span>
            </div>

            <div className="space-y-6">
                {experiences.map((exp, i) => (
                    <div key={i} className="relative pl-6 md:pl-8">
                        {/* Timeline vertical line */}
                        {i < experiences.length - 1 && (
                            <div
                                className="absolute left-[9px] top-6 bottom-[-24px] w-[2px]"
                                style={{ background: `linear-gradient(to bottom, ${exp.color}, rgba(255,255,255,0.06))` }}
                            />
                        )}

                        {/* Timeline glowing node */}
                        <div
                            className="absolute left-0 top-1.5 w-5 h-5 rounded-full border-2 flex items-center justify-center bg-[#080C14]"
                            style={{ borderColor: exp.color, boxShadow: `0 0 12px ${exp.color}66` }}
                        >
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: exp.color }} />
                        </div>

                        <div
                            className="rounded-2xl p-4 md:p-6 bg-white/[0.03] hover:bg-white/[0.05] border border-white/10 transition shadow-xl"
                            style={{ borderLeft: `3px solid ${exp.color}` }}
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
                                <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h3 className="text-base md:text-lg font-bold text-white">{exp.title}</h3>
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/10 text-slate-200">
                                            {exp.badge}
                                        </span>
                                    </div>
                                    <div className="text-sm font-semibold mt-0.5" style={{ color: exp.color }}>
                                        {exp.company} <span className="text-slate-500 font-normal">• {exp.location}</span>
                                    </div>
                                </div>
                                <div className="text-xs text-slate-300 font-mono bg-white/5 px-3 py-1 rounded-full border border-white/10 self-start md:self-auto">
                                    {exp.period}
                                </div>
                            </div>

                            {/* Impact Metric Pills */}
                            <div className="flex flex-wrap gap-2 mb-3">
                                {exp.metrics.map((m, idx) => (
                                    <span
                                        key={idx}
                                        className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-500/10 border border-cyan-400/25 text-cyan-300"
                                    >
                                        ✦ {m}
                                    </span>
                                ))}
                            </div>

                            <ul className="space-y-2 mt-2">
                                {exp.points.map((point, j) => (
                                    <li key={j} className="flex items-start gap-2.5 text-xs md:text-sm text-slate-300 leading-relaxed">
                                        <span className="text-cyan-400 mt-1 flex-shrink-0">▸</span>
                                        <span>{point}</span>
                                    </li>
                                ))}
                            </ul>

                            {/* Tech Stack */}
                            <div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-white/5">
                                {exp.stack.map((tech, idx) => (
                                    <span
                                        key={idx}
                                        className="px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/10 text-[11px] font-mono text-slate-300"
                                    >
                                        {tech}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function Education() {
    const educationList = [
        {
            degree: 'Masters in Computer Science and Engineering (M.Tech)',
            institution: 'IIT Gandhinagar',
            period: '2020 - 2022',
            achievements: 'Director’s Silver Medal for Academic Excellence  •  CGPA 9.00/10',
            color: '#F59E0B',
            highlights: [
                'Awarded the Director’s Silver Medal for graduating at the top of the M.Tech Computer Science cohort.',
                'Master’s Thesis: Accelerated Implicit Neural Representation with Split Encoder and Multiscale Partitioning (+21.23% faster training).',
                'Published peer-reviewed research in ACM CODS-COMAD on Siamese Graph Convolutional Networks & Deep NLP.',
            ],
            courses: ['Deep Learning', 'Computer Vision', 'Distributed Systems', 'Advanced Algorithms', 'Machine Learning'],
        },
        {
            degree: 'Bachelors in Computer Science and Engineering (B.Tech)',
            institution: 'Government Engineering College, Thrissur',
            period: '2016 - 2020',
            achievements: 'Dean’s List for Academic Excellence  •  CGPA 9.11/10',
            color: '#3B82F6',
            highlights: [
                'Graduated on the Dean’s List with First Class with Distinction (9.11 / 10.0 CGPA).',
                'Led competitive programming, systems clubs, and neural NLP research projects.',
            ],
            courses: ['Operating Systems', 'Database Management Systems', 'Computer Networks', 'Data Structures', 'Compilers'],
        },
        {
            degree: 'Senior Secondary — Maths, Physics, Chemistry',
            institution: (
                <>
                    Class 12<sup>th</sup> (CBSE)
                </>
            ),
            period: '2015 - 2016',
            achievements: 'Percentile 94.8%',
            color: '#10B981',
            highlights: ['Distinction across Mathematics, Physics, Chemistry, and Computer Science.'],
            courses: ['Calculus', 'Physics', 'Chemistry', 'Computer Science'],
        },
    ];

    return (
        <div className="w-full max-w-4xl p-5 md:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-3 border-b border-white/10">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold text-white">Education &amp; Academic Honors</h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                        Academic excellence in Computer Science, Deep Learning, and Distributed Computing
                    </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 text-xs font-mono self-start sm:self-auto">
                    🏆 Silver Medalist • IIT-GN
                </span>
            </div>

            <div className="space-y-6">
                {educationList.map((edu, i) => (
                    <div
                        key={i}
                        className="rounded-2xl p-5 md:p-6 bg-white/[0.03] hover:bg-white/[0.05] border border-white/10 transition shadow-xl"
                        style={{ borderLeft: `3px solid ${edu.color}` }}
                    >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
                            <div>
                                <div className="text-base md:text-lg font-bold text-white">{edu.institution}</div>
                                <div className="text-sm font-semibold mt-0.5" style={{ color: edu.color }}>
                                    {edu.degree}
                                </div>
                            </div>
                            <div className="text-xs text-slate-300 font-mono bg-white/5 px-3 py-1 rounded-full border border-white/10 self-start md:self-auto">
                                {edu.period}
                            </div>
                        </div>

                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-400/25 text-amber-200 text-xs md:text-sm font-semibold mb-3">
                            <span>🏆</span>
                            <span>{edu.achievements}</span>
                        </div>

                        <ul className="space-y-1.5 mt-1">
                            {edu.highlights.map((h, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-xs md:text-sm text-slate-300">
                                    <span className="text-cyan-400 mt-0.5">▸</span>
                                    <span>{h}</span>
                                </li>
                            ))}
                        </ul>

                        <div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-white/5">
                            {edu.courses.map((c, idx) => (
                                <span
                                    key={idx}
                                    className="px-2.5 py-0.5 rounded-md bg-white/[0.04] border border-white/10 text-[11px] font-mono text-slate-300"
                                >
                                    {c}
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function Skills() {
    const [activeCat, setActiveCat] = useState('all');

    const skillBars = [
        { name: 'Python & PySpark', level: 98, cat: 'data', tag: 'Core / Petabyte ETL' },
        { name: 'Distributed Systems & SQL / Delta Lake', level: 95, cat: 'data', tag: 'Google / Oracle' },
        { name: 'Deep Learning (PyTorch, TensorFlow, CV/NLP)', level: 92, cat: 'ai', tag: '2× ACM Published' },
        { name: 'GenAI, RAG & Vector Databases', level: 91, cat: 'ai', tag: 'Production LLMs' },
        { name: 'Cloud & Infra (GCP, OCI, Docker, K8s, Terraform)', level: 90, cat: 'data', tag: 'Cloud Native' },
        { name: 'C / C++ & Algorithmic Optimization', level: 88, cat: 'lang', tag: 'Systems & Perf' },
        { name: 'JavaScript, React, Next.js & Tailwind CSS', level: 90, cat: 'web', tag: 'Full-Stack UI' },
    ];

    const filteredBars = activeCat === 'all' ? skillBars : skillBars.filter((s) => s.cat === activeCat);

    return (
        <div className="w-full max-w-4xl p-5 md:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5 pb-3 border-b border-white/10">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold text-white">Technical Skills &amp; Stack</h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                        Expertise in <strong className="text-cyan-400">back-end systems, Python, distributed data &amp; deep learning</strong>
                    </p>
                </div>

                <div className="flex flex-wrap gap-1.5">
                    {[
                        { id: 'all', label: 'All' },
                        { id: 'data', label: 'Data & Cloud' },
                        { id: 'ai', label: 'AI & Deep Learning' },
                        { id: 'web', label: 'Web & Languages' },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveCat(tab.id)}
                            className={`px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer ${
                                activeCat === tab.id
                                    ? 'bg-cyan-500 text-slate-950'
                                    : 'bg-white/5 text-slate-300 hover:bg-white/10'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Interactive Proficiency Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-6">
                {filteredBars.map((s, idx) => (
                    <div
                        key={idx}
                        className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col gap-2"
                    >
                        <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-white">{s.name}</span>
                            <span className="font-mono text-cyan-400">{s.tag}</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 transition-all duration-500"
                                style={{ width: `${s.level}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Classic Interactive Badges Grid */}
            <div className="w-full flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-1/2 p-4 rounded-2xl bg-white/[0.02] border border-white/10">
                    <div className="text-xs font-mono uppercase tracking-wider text-cyan-400 text-center mb-3">
                        Languages &amp; Cloud Tools
                    </div>
                    <div className="flex flex-wrap justify-center items-start w-full gap-2">
                        <HoverGlare><img src="http://img.shields.io/badge/-Python-3776AB?style=flat&logo=python&logoColor=ffffff" alt="ashin python" /></HoverGlare>
                        <HoverGlare><img src="https://img.shields.io/badge/C%2B%2B-00599C?style=flat&logo=c%2B%2B&logoColor=white" alt="ashin c++" /></HoverGlare>
                        <HoverGlare><img src="http://img.shields.io/badge/-SQL-4479A1?style=plastic&logo=postgresql&logoColor=ffffff" alt="ashin sql" /></HoverGlare>
                        <HoverGlare><img src="https://img.shields.io/badge/-JavaScript-%23F7DF1C?style=flat&logo=javascript&logoColor=000000&labelColor=%23F7DF1C&color=%23FFCE5A" alt="ashin javascript" /></HoverGlare>
                        <a href="https://www.google.com/search?q=is+html+a+language%3F" target="_blank" rel="noreferrer"><HoverGlare><img title="yes it's a language!" src="https://img.shields.io/badge/-HTML5-%23E44D27?style=flat&logo=html5&logoColor=ffffff" alt="ashin HTML" /></HoverGlare></a>
                        <HoverGlare><img src="http://img.shields.io/badge/-OCI-F80000?style=plastic&logo=oracle&logoColor=ffffff" alt="ashin oci" /></HoverGlare>
                        <HoverGlare><img src="http://img.shields.io/badge/-GCP-4285F4?style=plastic&logo=googlecloud&logoColor=ffffff" alt="ashin gcp" /></HoverGlare>
                        <HoverGlare><img src="http://img.shields.io/badge/-Terraform-623CE4?style=plastic&logo=terraform&logoColor=ffffff" alt="ashin terraform" /></HoverGlare>
                        <HoverGlare><img src="http://img.shields.io/badge/-Docker-2496ED?style=plastic&logo=docker&logoColor=ffffff" alt="ashin docker" /></HoverGlare>
                        <HoverGlare><img src="http://img.shields.io/badge/-Kubernetes-326CE5?style=plastic&logo=kubernetes&logoColor=ffffff" alt="ashin kubernetes" /></HoverGlare>
                        <HoverGlare><img src="http://img.shields.io/badge/-Android%20Studio-3DDC84?style=plastic&logo=androidstudio&logoColor=ffffff" alt="ashin android studio" /></HoverGlare>
                        <HoverGlare><img src="https://img.shields.io/badge/-Git-%23F05032?style=flat&logo=git&logoColor=%23ffffff" alt="ashin git" /></HoverGlare>
                        <HoverGlare><img src="http://img.shields.io/badge/-Linux-0078D6?style=plastic&logo=linux&logoColor=ffffff" alt="ashin linux" /></HoverGlare>
                    </div>
                </div>

                <div className="w-full md:w-1/2 p-4 rounded-2xl bg-white/[0.02] border border-white/10">
                    <div className="text-xs font-mono uppercase tracking-wider text-purple-400 text-center mb-3">
                        Frameworks &amp; AI Libraries
                    </div>
                    <div className="flex flex-wrap justify-center items-start w-full gap-2">
                        <HoverGlare><img src="http://img.shields.io/badge/-Apache%20Spark-E25A1C?style=plastic&logo=apachespark&logoColor=ffffff" alt="ashin spark" /></HoverGlare>
                        <HoverGlare><img src="http://img.shields.io/badge/-Hadoop-66CCFF?style=plastic&logo=apachehadoop&logoColor=ffffff" alt="ashin hadoop" /></HoverGlare>
                        <HoverGlare><img src="http://img.shields.io/badge/-TensorFlow-FF6F00?style=plastic&logo=tensorflow&logoColor=ffffff" alt="ashin tensorflow" /></HoverGlare>
                        <HoverGlare><img src="http://img.shields.io/badge/-PyTorch-EE4C2C?style=plastic&logo=pytorch&logoColor=ffffff" alt="ashin pytorch" /></HoverGlare>
                        <HoverGlare><img src="http://img.shields.io/badge/-Streamlit-FF4B4B?style=plastic&logo=streamlit&logoColor=ffffff" alt="ashin streamlit" /></HoverGlare>
                        <HoverGlare><img src="http://img.shields.io/badge/-Flask-000000?style=plastic&logo=flask&logoColor=ffffff" alt="ashin flask" /></HoverGlare>
                        <HoverGlare><img src="https://img.shields.io/badge/Next-black?style=flat&logo=next.js&logoColor=ffffff" alt="ashin next" /></HoverGlare>
                        <HoverGlare><img src="https://img.shields.io/badge/-React-61DAFB?style=flat&logo=react&logoColor=ffffff" alt="ashin react" /></HoverGlare>
                        <HoverGlare><img src="http://img.shields.io/badge/-Django-092E20?style=plastic&logo=django&logoColor=ffffff" alt="ashin django" /></HoverGlare>
                        <HoverGlare><img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white" alt="ashin tailwind css" /></HoverGlare>
                        <HoverGlare><img src="https://img.shields.io/badge/-Nodejs-339933?style=flat&logo=Node.js&logoColor=ffffff" alt="ashin node.js" /></HoverGlare>
                        <HoverGlare><img src="https://img.shields.io/badge/Redux-593D88?style=flat&logo=redux&logoColor=white" alt="ashin redux" /></HoverGlare>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Projects() {
    const [filter, setFilter] = useState('all');

    const project_list = [
        {
            name: 'Accelerated Implicit Neural Representation with Split Encoder and Multiscale Partitioning',
            date: 'Jul 2022 • M.Tech Thesis',
            category: 'research',
            badge: '+21.23% Faster Training',
            link: 'https://scholar.google.com/citations?user=Grl9bo0AAAAJ&hl=en',
            description: [
                'Proposed an input-split neural network architecture with multiscale spatial partitioning that dynamically allocates network capacity based on local signal intricacy. Evaluated on large-scale images and complex Stanford 3D models, achieving training speedups of up to 21.23% over state-of-the-art INR baselines without sacrificing reconstruction quality.',
            ],
            domains: ['Deep Learning', 'Computer Vision', '3D Neural Rendering'],
        },
        {
            name: 'Image Caption Generator using Siamese Graph Convolutional Networks and LSTM',
            date: 'Jun 2021 • ACM CODS-COMAD',
            category: 'research',
            badge: 'ACM Publication',
            link: 'https://scholar.google.com/citations?user=Grl9bo0AAAAJ&hl=en',
            description: [
                'Published at the 9th ACM Conference on Data Sciences (CODS) and 27th Conference on Management of Data (COMAD). Combines Siamese Graph Convolutional Networks (S-GCN) with a non-parametric Kernel Activation Function (KAF) and attention LSTM to capture deep semantic-spatial relations with strong resilience to class imbalance.',
            ],
            domains: ['Machine Learning', 'NLP', 'Computer Vision'],
        },
        {
            name: 'Reverse Dictionary using an Improved CBOW Model',
            date: 'Oct 2020 • ACM CODS-COMAD',
            category: 'research',
            badge: 'ACM Publication',
            link: 'https://scholar.google.com/citations?user=Grl9bo0AAAAJ&hl=en',
            description: [
                'Solves the Tip-of-the-Tongue problem by predicting target words from free-form descriptions using an RNN-inspired Continuous Bag-Of-Words (CBOW) architecture. Published at ACM CODS-COMAD 2021.',
            ],
            domains: ['NLP', 'Deep Learning'],
        },
        {
            name: 'Lumina — Interactive Cosmic Sequence Memory Game',
            date: '2026 • Live Web App',
            category: 'apps',
            badge: 'Play Live ↗',
            link: 'https://ashinshanly.github.io/lumina/',
            description: [
                'A cosmic memory puzzle built with a 60fps multi-layer parallax starfield, Web Audio harmonic chimes, progressive glassmorphic node grids, and a real-time Firebase global leaderboard.',
            ],
            domains: ['javascript', 'firebase', 'tailwindcss'],
        },
        {
            name: 'MusicSync — Multi-Device Synchronized Web Audio',
            date: '2025 • Live Web App',
            category: 'apps',
            badge: 'Launch App ↗',
            link: 'https://ashinshanly.github.io/musicsync/',
            description: [
                'Synchronizes audio playback across multiple phones and laptops with millisecond precision over the browser, creating a distributed spatial sound system.',
            ],
            domains: ['javascript', 'firebase', 'next.js'],
        },
        {
            name: 'Chain Reaction & Secret Maze — Interactive Strategy Games',
            date: 'Live Web Games',
            category: 'apps',
            badge: 'Play Live ↗',
            link: 'https://ashinshanly.github.io/chainreaction/',
            description: [
                'Real-time multiplayer and algorithmic puzzle games featuring custom canvas physics, spatial audio synthesis, and cloud state synchronization.',
            ],
            domains: ['javascript', 'firebase', 'html5'],
        },
    ];

    const tag_styles = {
        'Deep Learning': 'border-cyan-400/60 text-cyan-300 bg-cyan-950/30',
        'Computer Vision': 'border-purple-400/60 text-purple-300 bg-purple-950/30',
        '3D Neural Rendering': 'border-indigo-400/60 text-indigo-300 bg-indigo-950/30',
        'Machine Learning': 'border-emerald-400/60 text-emerald-300 bg-emerald-950/30',
        NLP: 'border-amber-400/60 text-amber-300 bg-amber-950/30',
        javascript: 'border-yellow-400/60 text-yellow-300 bg-yellow-950/30',
        firebase: 'border-orange-400/60 text-orange-300 bg-orange-950/30',
        tailwindcss: 'border-sky-400/60 text-sky-300 bg-sky-950/30',
        'next.js': 'border-slate-400/60 text-slate-200 bg-slate-900/50',
        html5: 'border-pink-400/60 text-pink-300 bg-pink-950/30',
    };

    const visibleProjects =
        filter === 'all' ? project_list : project_list.filter((p) => p.category === filter);

    return (
        <div className="w-full max-w-4xl p-5 md:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-3 border-b border-white/10">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold text-white">Projects &amp; Publications</h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                        Peer-reviewed AI research papers and live interactive web applications
                    </p>
                </div>

                <div className="flex items-center gap-1.5">
                    {[
                        { id: 'all', label: 'All (6)' },
                        { id: 'research', label: 'Research Papers (3)' },
                        { id: 'apps', label: 'Live Web Apps (3)' },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setFilter(tab.id)}
                            className={`px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer ${
                                filter === tab.id
                                    ? 'bg-cyan-500 text-slate-950'
                                    : 'bg-white/5 text-slate-300 hover:bg-white/10'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="w-full flex flex-col">
                {visibleProjects.map((project, index) => (
                    <CardContainer key={index} className="flex w-full flex-col mb-4">
                        <CardBody className="w-full">
                            <CardItem
                                as="a"
                                href={project.link}
                                target="_blank"
                                rel="noreferrer"
                                translateZ="50"
                                translateY="-6"
                                className="w-full p-4 md:p-5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-cyan-400/40 cursor-pointer block pointer-events-auto relative z-20 transition shadow-xl"
                            >
                                <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center gap-2">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <CardItem translateZ="100" className="text-base md:text-lg font-bold text-white">
                                            {project.name}
                                        </CardItem>
                                        {project.badge && (
                                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-500/15 border border-cyan-400/30 text-cyan-300">
                                                {project.badge}
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-slate-400 font-mono text-xs whitespace-nowrap">
                                        {project.date}
                                    </div>
                                </div>

                                <ul className="tracking-normal leading-relaxed text-xs md:text-sm text-slate-300 mt-3 space-y-1.5">
                                    {project.description.map((desc, idx) => (
                                        <li key={idx}>{desc}</li>
                                    ))}
                                </ul>

                                <div className="flex flex-wrap items-center justify-start gap-1.5 text-xs pt-3 mt-3 border-t border-white/5">
                                    {project.domains &&
                                        project.domains.map((domain, idx) => {
                                            const domainClasses =
                                                tag_styles[domain] || 'border-gray-400 text-gray-300';
                                            return (
                                                <span
                                                    key={idx}
                                                    className={`px-2.5 py-0.5 border ${domainClasses} rounded-full text-[11px] font-medium`}
                                                >
                                                    {domain}
                                                </span>
                                            );
                                        })}
                                </div>
                            </CardItem>
                        </CardBody>
                    </CardContainer>
                ))}
            </div>
        </div>
    );
}

function Resume() {
    return (
        <div className="h-full w-full flex flex-col">
            {/* Top Executive Resume Action Bar */}
            <div className="w-full px-4 py-2.5 bg-[#0B111E] border-b border-white/10 flex flex-wrap items-center justify-between gap-2 flex-shrink-0">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">AshinShanly_RESUME.pdf</span>
                    <span className="hidden sm:inline text-[11px] text-slate-400 font-mono">
                        • Google SWE III • IIT Gandhinagar M.Tech
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <a
                        href="./files/AshinShanly_RESUME.pdf"
                        download="AshinShanly_RESUME.pdf"
                        className="px-3 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition"
                    >
                        ⬇ Download PDF
                    </a>
                    <a
                        href="./files/AshinShanly_RESUME.pdf"
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium text-xs transition"
                    >
                        Open in New Tab ↗
                    </a>
                </div>
            </div>

            {/* Desktop: native PDF viewer */}
            <iframe
                className="flex-grow w-full hidden md:block"
                src="./files/AshinShanly_RESUME.pdf"
                title="ashin shanly resume"
                frameBorder="0"
            />
            {/* Mobile: Google Docs Viewer */}
            <div className="flex-grow w-full flex flex-col md:hidden">
                <iframe
                    className="flex-grow w-full"
                    src="https://docs.google.com/gview?url=https://ashinshanly.github.io/files/AshinShanly_RESUME.pdf&embedded=true"
                    title="ashin shanly resume"
                    frameBorder="0"
                    style={{ minHeight: 0 }}
                />
            </div>
        </div>
    );
}
