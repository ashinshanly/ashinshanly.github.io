import React, { Component } from 'react';
import ReactGA from 'react-ga4';
import { CardContainer, CardBody, CardItem } from '../util components/3d-card';
import { HoverGlare } from '../util components/hover-glare';

export class AboutAshin extends Component {

    constructor() {
        super();
        this.screens = {};
        this.state = {
            screen: () => { },
            active_screen: "about", // by default 'about' screen is active
            navbar: false,
        }
    } f

    componentDidMount() {
        this.screens = {
            "about": <About />,
            "experience": <Experience />,
            "education": <Education />,
            "skills": <Skills />,
            "projects": <Projects />,
            "resume": <Resume />,
        }

        let lastVisitedScreen = localStorage.getItem("about-section");
        if (lastVisitedScreen === null || lastVisitedScreen === undefined) {
            lastVisitedScreen = "about";
        }

        // focus last visited screen
        this.changeScreen(document.getElementById(lastVisitedScreen));
    }

    changeScreen = (e) => {
        const screen = e.id || e.target.id;

        // store this state
        localStorage.setItem("about-section", screen);

        // google analytics
        ReactGA.send({ hitType: "pageview", page: `/${screen}`, title: "Custom Title" });


        this.setState({
            screen: this.screens[screen],
            active_screen: screen
        });
    }

    showNavBar = () => {
        this.setState({ navbar: !this.state.navbar });
    }

    renderNavLinks = () => {
        return (
            <>
                <div id="about" tabIndex="0" onFocus={this.changeScreen} className={(this.state.active_screen === "about" ? " bg-ub-orange bg-opacity-100 hover:bg-opacity-95" : " hover:bg-gray-50 hover:bg-opacity-5 ") + " w-28 md:w-full md:rounded-none rounded-sm cursor-default outline-none py-1.5 focus:outline-none duration-100 my-0.5 flex justify-start items-center pl-2 md:pl-2.5"}>
                    <img className=" w-3 md:w-4" alt="about ashin" src="./themes/Yaru/status/about.svg" />
                    <span className=" ml-1 md:ml-2 text-gray-50 ">About Me</span>
                </div>

                <div id="experience" tabIndex="0" onFocus={this.changeScreen} className={(this.state.active_screen === "experience" ? " bg-ub-orange bg-opacity-100 hover:bg-opacity-95" : " hover:bg-gray-50 hover:bg-opacity-5 ") + " w-28 md:w-full md:rounded-none rounded-sm cursor-default outline-none py-1.5 focus:outline-none duration-100 my-0.5 flex justify-start items-center pl-2 md:pl-2.5"}>
                    <img className=" w-3 md:w-4" alt="ashin's experience" src="./themes/Yaru/status/experience.svg" />
                    <span className=" ml-1 md:ml-2 text-gray-50 ">Experience</span>
                </div>

                <div id="education" tabIndex="0" onFocus={this.changeScreen} className={(this.state.active_screen === "education" ? " bg-ub-orange bg-opacity-100 hover:bg-opacity-95" : " hover:bg-gray-50 hover:bg-opacity-5 ") + " w-28 md:w-full md:rounded-none rounded-sm cursor-default outline-none py-1.5 focus:outline-none duration-100 my-0.5 flex justify-start items-center pl-2 md:pl-2.5"}>
                    <img className=" w-3 md:w-4" alt="ashin's education" src="./themes/Yaru/status/education.svg" />
                    <span className=" ml-1 md:ml-2 text-gray-50 ">Education</span>
                </div>

                <div id="skills" tabIndex="0" onFocus={this.changeScreen} className={(this.state.active_screen === "skills" ? " bg-ub-orange bg-opacity-100 hover:bg-opacity-95" : " hover:bg-gray-50 hover:bg-opacity-5 ") + " w-28 md:w-full md:rounded-none rounded-sm cursor-default outline-none py-1.5 focus:outline-none duration-100 my-0.5 flex justify-start items-center pl-2 md:pl-2.5"}>
                    <img className=" w-3 md:w-4" alt="ashin's skills" src="./themes/Yaru/status/skills.svg" />
                    <span className=" ml-1 md:ml-2 text-gray-50 ">Skills</span>
                </div>

                <div id="projects" tabIndex="0" onFocus={this.changeScreen} className={(this.state.active_screen === "projects" ? " bg-ub-orange bg-opacity-100 hover:bg-opacity-95" : " hover:bg-gray-50 hover:bg-opacity-5 ") + " w-28 md:w-full md:rounded-none rounded-sm cursor-default outline-none py-1.5 focus:outline-none duration-100 my-0.5 flex justify-start items-center pl-2 md:pl-2.5"}>
                    <img className=" w-3 md:w-4" alt="ashin's projects" src="./themes/Yaru/status/projects.svg" />
                    <span className=" ml-1 md:ml-2 text-gray-50 ">Projects</span>
                </div>

                <div id="resume" tabIndex="0" onFocus={this.changeScreen} className={(this.state.active_screen === "resume" ? " bg-ub-orange bg-opacity-100 hover:bg-opacity-95" : " hover:bg-gray-50 hover:bg-opacity-5 ") + " w-28 md:w-full md:rounded-none rounded-sm cursor-default outline-none py-1.5 focus:outline-none duration-100 my-0.5 flex justify-start items-center pl-2 md:pl-2.5"}>
                    <img className=" w-3 md:w-4" alt="ashin's resume" src="./themes/Yaru/status/download.svg" />
                    <span className=" ml-1 md:ml-2 text-gray-50 ">Resume</span>
                </div>
            </>
        );
    }

    render() {
        return (
            <div className="w-full h-full flex bg-ub-cool-grey text-white select-none relative">
                <div className="md:flex hidden flex-col w-1/4 md:w-1/5 text-sm overflow-y-auto windowMainScreen border-r border-black">
                    {this.renderNavLinks()}
                </div>
                <div onClick={this.showNavBar} className="md:hidden flex flex-col items-center justify-center absolute bg-ub-cool-grey rounded w-6 h-6 top-1 left-1 z-50">
                    <div className=" w-3.5 border-t border-white"></div>
                    <div className=" w-3.5 border-t border-white" style={{ marginTop: "2pt", marginBottom: "2pt" }}></div>
                    <div className=" w-3.5 border-t border-white"></div>
                    <div className={(this.state.navbar ? " visible animateShow z-50 " : " invisible ") + " md:hidden text-xs absolute bg-ub-cool-grey py-0.5 px-1 rounded-sm top-full mt-1 left-0 shadow border-black border border-opacity-20"}>
                        {this.renderNavLinks()}
                    </div>
                </div>
                <div id="about-screen" className="flex flex-col w-3/4 md:w-4/5 justify-start items-center flex-grow bg-ub-grey overflow-y-auto windowMainScreen">
                    {this.state.screen}
                </div>
            </div>
        );
    }
}

export default AboutAshin;

export const displayAboutAshin = () => {
    return <AboutAshin />;
}


function About() {
    return (
        <div className="relative w-full h-full flex flex-col items-center p-6 overflow-y-auto overflow-x-hidden">
            {/* Background Futuristic Glows */}
            <div className="absolute top-10 right-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none"></div>
            <div className="absolute bottom-10 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-[80px] pointer-events-none"></div>

            {/* Profile Section */}
            <div className="relative z-10 mt-6 flex flex-col items-center">
                <div className="relative group">
                    {/* Animated ringing borders */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                    <div className="absolute -inset-2 rounded-full border border-cyan-500/20 animate-[spin_10s_linear_infinite]"></div>
                    <div className="absolute -inset-4 rounded-full border border-purple-500/20 animate-[spin_15s_linear_infinite_reverse]"></div>

                    <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full p-[2px] bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 shadow-[0_0_30px_rgba(34,211,238,0.3)]">
                        <div className="w-full h-full bg-[#0a0a0c] rounded-full overflow-hidden relative">
                            <div className="absolute inset-0 bg-white/5 z-10"></div>
                            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/30 to-purple-500/30 mix-blend-overlay z-10 pointer-events-none rounded-full"></div>
                            <img className="w-full h-full object-cover relative z-0 brightness-110 contrast-110 saturate-110 transition-transform duration-500 group-hover:scale-105" src="./images/logos/headshot.jpg" alt="Ashin Shanly" />
                        </div>
                    </div>
                </div>

                <div className="mt-8 text-center px-1">
                    <div className="text-gray-400 font-mono tracking-widest text-xs mb-2 camelcase">Hey, there!</div>
                    <div className="text-3xl md:text-5xl font-black mb-2 tracking-tight flex items-center justify-center gap-2">
                        <span className="text-white">My name is</span>
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-red-500">Ashin Shanly</span>
                    </div>
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/30 border border-cyan-500/30 text-cyan-400 text-sm font-medium">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                        </span>
                        I like to build stuff.
                    </div>
                </div>
            </div>

            <div className=" mt-8 relative pt-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent w-full max-w-md"></div>

            {/* Bio List */}
            <div className="relative z-10 w-full max-w-2xl mt-8">
                <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 md:p-8 backdrop-blur-xl shadow-2xl">
                    <ul className="space-y-5 text-sm md:text-base text-gray-300">
                        <li className="flex items-start gap-4">
                            <span className="text-cyan-400 text-lg mt-0.5 shrink-0">❖</span>
                            <span className="leading-relaxed">
                                I'm a <span className="text-cyan-400 font-semibold">Software Engineer.</span> I like distributed computing, deep neural networks, data engineering, and creating scalable, high-performance solutions.
                                <br /><span className="text-gray-500 italic mt-1 block">( Reach out <a className='text-cyan-400 hover:text-cyan-300 transition-colors' href='mailto:ashinkoottala@gmail.com'>@ashinkoottala@gmail.com</a> )</span>
                            </span>
                        </li>
                        <li className="flex items-start gap-4">
                            <span className="text-purple-400 text-lg mt-0.5 shrink-0">❖</span>
                            <span className="leading-relaxed">I enjoy building cool things exploring the boundaries of modern technology.</span>
                        </li>
                        <li className="flex items-start gap-4">
                            <span className="text-blue-400 text-lg mt-0.5 shrink-0">❖</span>
                            <span className="leading-relaxed">When I am not coding my next project, I like to spend my time playing badminton, watching <a href="https://www.imdb.com/title/tt9335498/" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">anime</a>, or swing trading.</span>
                        </li>
                        <li className="flex items-start gap-4">
                            <span className="text-rose-400 text-lg mt-0.5 shrink-0">❖</span>
                            <span className="leading-relaxed">I’m also really into deep learning and computer vision! Feel free to check out my research publications <a href="https://scholar.google.com/citations?user=Grl9bo0AAAAJ&hl=en" target="_blank" rel="noreferrer" className="text-rose-400 hover:underline font-medium">HERE</a>.</span>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Quick Links */}
            <div className="relative z-10 flex gap-4 mt-8">
                <a href="https://www.github.com/ashinshanly" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all hover:scale-105 text-sm font-semibold">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg>
                    GitHub
                </a>
                <a href="https://www.linkedin.com/in/ashinshanly/" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-5 py-2.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 rounded-2xl transition-all hover:scale-105 text-sm font-semibold">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" /></svg>
                    LinkedIn
                </a>
            </div>
        </div>
    )
}

function Experience() {
    const experiences = [
        {
            title: 'Software Engineer III',
            company: 'Google',
            period: 'Aug 2025 - Current',
            color: '#4285F4',
            logo: '🔵',
            points: [
                'Enabling Alphabet to run the most efficient and elastic fleet in the industry by providing trusted data and actionable insights.'
            ]
        },
        {
            title: 'Member of Technical Staff (IC2)',
            company: 'Oracle India Pvt Ltd',
            period: 'Aug 2022 - Aug 2025',
            color: '#F80000',
            logo: '🔴',
            points: [
                'Architected petabyte-scale ETL pipelines using PySpark on OCI to reduce data processing latency and cost, delivering high-throughput real-time ingestion, transformation, and aggregation of global customer usage data.',
                'Designed and implemented an enterprise-wide Generative AI RAG chatbot, leveraging a vector database for high-speed document retrieval and fine-tuned LLMs. Automated 60% of manual query handling and enhanced query resolution accuracy by 30%.',
                'Led a team of 5 developers in redesigning data load processes by migrating from a legacy relational data warehouse to the Delta Lake ecosystem. Boosted query performance by 40%.',
                'Created an instance and rack decommissioning dashboard that accelerated throughput for decommissioning bare-metal and virtual machine instances, saving thousands of dollars annually.',
                'Led the design of robust data archival and purging frameworks. Achieved a 25% reduction in long-term storage costs and enhanced overall database performance.'
            ]
        },
        {
            title: 'Machine Vision Research Scientist Intern',
            company: 'TCS Research and Innovation Labs',
            period: 'May 2021 - Aug 2021',
            color: '#00AEEF',
            logo: '🔷',
            points: [
                'Pioneered advanced research in tree segmentation by leveraging airborne and spaceborne LiDAR technology for geospatial analysis in forestry applications.',
                'Engineered an innovative tree segmentation model utilizing a hybrid machine learning and signal processing framework, achieving an 18% boost in model accuracy.',
                'Implemented cutting-edge data fusion techniques, integrating geospatial point cloud data with hyperspectral imagery for enhanced classification models.'
            ]
        }
    ];

    return (
        <>
            <div className="font-medium relative text-xl md:text-2xl mt-4 md:mt-4 mb-4">
                Experience
                <div className="absolute pt-px bg-white mt-px top-full w-full">
                    <div className="bg-white absolute rounded-full p-0.5 md:p-1 top-0 transform -translate-y-1/2 left-full"></div>
                    <div className="bg-white absolute rounded-full p-0.5 md:p-1 top-0 transform -translate-y-1/2 right-full"></div>
                </div>
            </div>
            <div className="px-6">
                <div className="w-11/12 md:w-3/4 mt-4">
                    {experiences.map((exp, i) => (
                        <div key={i} className="relative mb-8 last:mb-0">
                            {/* Timeline connector */}
                            {i < experiences.length - 1 && (
                                <div className="absolute left-[7px] top-[24px] bottom-[-16px] w-[2px]" style={{ background: `linear-gradient(to bottom, ${exp.color}40, transparent)` }}></div>
                            )}

                            {/* Timeline dot */}
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 mt-[2px]">
                                    <div className="w-4 h-4 rounded-full border-2 relative" style={{ borderColor: exp.color }}>
                                        <div className="absolute inset-[3px] rounded-full" style={{ backgroundColor: exp.color }}></div>
                                    </div>
                                </div>

                                {/* Content card */}
                                <div className="flex-1 rounded-lg p-3 md:p-4 -mt-1" style={{
                                    background: 'rgba(255,255,255,0.03)',
                                    borderLeft: `3px solid ${exp.color}`,
                                }}>
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-1 mb-2">
                                        <div>
                                            <div className="text-base md:text-lg font-bold text-white leading-tight">{exp.title}</div>
                                            <div className="text-sm font-medium mt-0.5" style={{ color: exp.color }}>{exp.company}</div>
                                        </div>
                                        <div className="text-xs text-gray-400 whitespace-nowrap font-mono tracking-wide">{exp.period}</div>
                                    </div>
                                    <ul className="space-y-2 mt-3">
                                        {exp.points.map((point, j) => (
                                            <li key={j} className="flex items-start gap-2 text-sm text-gray-300 leading-relaxed">
                                                <span className="text-gray-500 mt-1.5 flex-shrink-0">▸</span>
                                                <span>{point}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    )
}

function Education() {
    const educationList = [
        {
            degree: 'Masters in Computer Science and Engineering',
            institution: 'IIT Gandhinagar',
            period: '2020 - 2022',
            achievements: 'Director’s Silver Medal for Academic Excellence  •  CGPA 9.00/10',
            color: '#F59E0B'
        },
        {
            degree: 'Bachelors in Computer Science and Engineering',
            institution: 'Government Engineering College, Thrissur',
            period: '2016 - 2020',
            achievements: 'Dean’s List for Academic Excellence  •  CGPA 9.11/10',
            color: '#3B82F6'
        },
        {
            degree: 'Maths, Physics, Chemistry',
            institution: <>Class 12<sup>th</sup> (CBSE)</>,
            period: '2015 - 2016',
            achievements: 'Percentile 94.8%',
            color: '#10B981'
        }
    ];

    return (
        <>
            <div className="font-medium relative text-xl md:text-2xl mt-4 md:mt-4 mb-4">
                Education
                <div className="absolute pt-px bg-white mt-px top-full w-full">
                    <div className="bg-white absolute rounded-full p-0.5 md:p-1 top-0 transform -translate-y-1/2 left-full"></div>
                    <div className="bg-white absolute rounded-full p-0.5 md:p-1 top-0 transform -translate-y-1/2 right-full"></div>
                </div>
            </div>
            <div className="px-6">
                <div className="w-11/12 md:w-3/4 mt-4">
                    {educationList.map((edu, i) => (
                        <div key={i} className="relative mb-8 last:mb-0">
                            {/* Timeline connector */}
                            {i < educationList.length - 1 && (
                                <div className="absolute left-[7px] top-[24px] bottom-[-16px] w-[2px]" style={{ background: `linear-gradient(to bottom, ${edu.color}40, transparent)` }}></div>
                            )}

                            {/* Timeline dot */}
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 mt-[2px]">
                                    <div className="w-4 h-4 rounded-full border-2 relative" style={{ borderColor: edu.color }}>
                                        <div className="absolute inset-[3px] rounded-full" style={{ backgroundColor: edu.color }}></div>
                                    </div>
                                </div>

                                {/* Content card */}
                                <div className="flex-1 rounded-lg p-3 md:p-4 -mt-1" style={{
                                    background: 'rgba(255,255,255,0.03)',
                                    borderLeft: `3px solid ${edu.color}`,
                                }}>
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-1 mb-2">
                                        <div>
                                            <div className="text-base md:text-lg font-bold text-white leading-tight">{edu.institution}</div>
                                            <div className="text-sm font-medium mt-0.5" style={{ color: edu.color }}>{edu.degree}</div>
                                        </div>
                                        <div className="text-xs text-gray-400 whitespace-nowrap font-mono tracking-wide">{edu.period}</div>
                                    </div>
                                    <div className="text-sm text-gray-300 mt-3 font-semibold flex items-center gap-2">
                                        <span className="text-lg">🏆</span>
                                        {edu.achievements}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    )
}
function Skills() {
    return (
        <>
            <div className=" font-medium relative text-xl md:text-2xl mt-4 md:mt-4 mb-4">
                Technical Skills
                <div className="absolute pt-px bg-white mt-px top-full w-full">
                    <div className="bg-white absolute rounded-full p-0.5 md:p-1 top-0 transform -translate-y-1/2 left-full"></div>
                    <div className="bg-white absolute rounded-full p-0.5 md:p-1 top-0 transform -translate-y-1/2 right-full"></div>
                </div>
            </div>
            <ul className=" tracking-tight text-sm md:text-base w-11/12 md:w-10/12 emoji-list px-2 md:px-0">
                <li className=" list-arrow text-sm md:text-base mt-4 leading-tight tracking-tight">
                    I've worked on a lot of interesting programming languages & frameworks.
                </li>
                <li className=" list-arrow text-sm md:text-base mt-4 leading-tight tracking-tight">
                    <div> My areas of expertise are <strong className="text-ubt-gedit-orange">back-end development, python & deep learning!</strong></div>
                </li>
                <li className=" list-arrow text-sm md:text-base mt-4 leading-tight tracking-tight">
                    <div>Here are my most frequently used</div>
                </li>
            </ul>
            <div className="w-11/12 md:w-10/12 flex flex-col md:flex-row mt-4 px-2 md:px-0 gap-6 md:gap-0">
                <div className="w-full md:w-1/2">
                    <div className="text-sm text-center md:text-base font-bold mb-2">Languages & Tools</div>
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
                        <HoverGlare><img src="http://img.shields.io/badge/-XAMPP-FB7A24?style=plastic&logo=xampp&logoColor=ffffff" alt="ashin android xampp" /></HoverGlare>
                        <HoverGlare><img src="https://img.shields.io/badge/-Sass-%23CC6699?style=flat&logo=sass&logoColor=ffffff" alt="ashin SASS" /></HoverGlare>
                        <HoverGlare><img src="https://img.shields.io/badge/-Git-%23F05032?style=flat&logo=git&logoColor=%23ffffff" alt="ashin git" /></HoverGlare>
                    </div>
                </div>
                <div className="w-full md:w-1/2">
                    <div className="text-sm text-center md:text-base font-bold mb-2">Frameworks & Libraries</div>
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
                        <HoverGlare><img src="https://img.shields.io/badge/jQuery-0769AD?style=flat&logo=jquery&logoColor=white" alt="ashin jquery" /></HoverGlare>
                        <HoverGlare><img src="https://img.shields.io/badge/Redux-593D88?style=flat&logo=redux&logoColor=white" alt="ashin redux" /></HoverGlare>
                    </div>
                </div>
            </div>
            <ul className=" tracking-tight text-sm md:text-base w-10/12 emoji-list mt-4">
                <li className=" list-arrow text-sm md:text-base mt-4 leading-tight tracking-tight">
                    <span> And of course,</span> <img className=" inline ml-1" src="http://img.shields.io/badge/-Linux-0078D6?style=plastic&logo=linux&logoColor=ffffff" alt="ashin linux" /> <span>!</span>
                </li>
            </ul>
        </>
    )
}

function Projects() {
    const project_list = [
        {
            name: "Accelerated Implicit Neural Representation with Split Encoder and Multiscale Partitioning",
            date: "Jul 2022",
            link: "https://github.com/ashinshanly",
            description: [
                "Implicit Neural Representation (INR) is an emerging signal representation and rendering technique. These representations are continuous, implicit and differentiable. Their primary advantages are memory efficiency with high spatial resolution and the ability to be incorporated into pipelines based on differentiable learning. However, neural scene representations are slow and cannot represent complex scenes. In this work, we aim to speed up the training time for implicit neural representation networks without compromising the quality of the reconstructed signal. We propose an input-split network architecture that flexibly distributes network resources during training based on the intricacy of the input signal at the given locality. We perform experiments on large-scale images and complex Stanford 3D models. We present a detailed comparison of results indicating speedups of up to ∼ 21.23% more than the state-of-the-art approaches.",
            ],
            domains: ["Deep Learning", "Computer Vision"]
        },
        {
            name: "Image Caption Generator using Siamese Graph Convolutional Networks and LSTM",
            date: "Jun 2021",
            link: "https://github.com/ashinshanly",
            description: [
                "Image captions are those crisp descriptions that you see under images. They generally provide the viewer with a brief idea about the image context. To generate an accurate description of the scene, the model requires a semantic and spatial understanding of the contents in the scene. This project proposes a novel approach using Siamese Graph Convolutional Network (S-GCN), making use of a non-parametric Kernel Activation function (KAF) followed by an LSTM with attention to generate natural language captions for the input image. Siamese-GCN captures deep semantic relations and makes the model more robust to class imbalances. We use an extended kernel activation function and regularize with standard lp-norm techniques, improving the overall model performance by a significant margin. Successfully published this work at the 9th ACM Conference on Data Sciences (CODS) and the 27th Conference on Management of Data (COMAD), garnering recognition for its contribution to the field.",
            ],
            domains: ["Machine Learning", "NLP"]
        },
        {
            name: "Reverse Dictionary using an Improved CBOW model",
            date: "Oct 2020",
            link: "https://github.com/ashinshanly",
            description: [
                "A reverse dictionary is a tool that solves the Tip-of-the-Tongue problem by predicting the target word given a meaning or description. This project proposes a modified Continuous Bag-Of-Words (CBOW) model inspired by the Recurrent Neural Network (RNN), to implement a reverse dictionary. The model possesses the merits of both the CBOW model and RNN while stripping away the complexity associated with RNN. We evaluate the model by measuring accuracy based on the top-2 predictions. Built three deep neural network variants among which one of them was published in the ACM Cods Comad conference 2021.",
            ],
            domains: ["NLP", "Deep Learning"]
        }
    ];

    const tag_colors = {
        "javascript": "yellow-300",
        "firebase": "red-600",
        "firestore": "red-500",
        "firebase auth": "red-400",
        "chrome-extension": "yellow-400",
        "flutter": "blue-400",
        "dart": "blue-500",
        "react-native": "purple-500",
        "html5": "pink-600",
        "sass": "pink-400",
        "tensorflow": "yellow-600",
        "django": "green-600",
        "python": "green-200",
        "codeforces-api": "gray-300",
        "tailwindcss": "blue-300",
        "next.js": "purple-600"
    }

    return (
        <>
            <div className=" font-medium relative text-xl md:text-2xl mt-4 md:mt-4 mb-4">
                Projects
                <div className="absolute pt-px bg-white mt-px top-full w-full">
                    <div className="bg-white absolute rounded-full p-0.5 md:p-1 top-0 transform -translate-y-1/2 left-full"></div>
                    <div className="bg-white absolute rounded-full p-0.5 md:p-1 top-0 transform -translate-y-1/2 right-full"></div>
                </div>
            </div>
            <div className="w-11/12 md:w-full flex flex-col">
                {
                    project_list.map((project, index) => {
                        const projectNameFromLink = project.link.split('/')
                        const projectName = projectNameFromLink[projectNameFromLink.length - 1]
                        return (
                            <CardContainer key={index} className="flex w-full flex-col px-0 md:px-4 mb-4">
                                <CardBody className="w-full">
                                    <CardItem
                                        as="a"
                                        href={project.link}
                                        target="_blank"
                                        rel="noreferrer"
                                        translateZ="50"
                                        translateY="-10"
                                        className="w-full py-3 px-3 md:px-4 border border-gray-50 border-opacity-10 rounded hover:bg-gray-50 hover:bg-opacity-5 cursor-pointer block pointer-events-auto relative z-20"
                                    >
                                        <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center gap-2 md:gap-0">
                                            <div className='flex flex-col md:flex-row items-start md:items-center'>
                                                <CardItem translateZ="100" className=" text-base md:text-lg mr-2 font-medium">{project.name}</CardItem>
                                                <iframe src={`https://ghbtns.com/github-btn.html?user=ashinshanly&repo=${projectName}&type=star&count=false`} frameBorder="0" scrolling="0" width="100" height="20" title={project.name.toLowerCase() + "-star"} className="mt-1 md:mt-0 pointer-events-none"></iframe>
                                            </div>
                                            <div className="text-gray-400 font-light text-xs md:text-sm whitespace-nowrap">{project.date}</div>
                                        </div>
                                        <ul className=" tracking-normal leading-relaxed text-sm font-light mt-3 px-1 md:ml-4">
                                            {
                                                project.description.map((desc, index) => {
                                                    return <li key={index} className="list-disc mt-1 text-gray-200">{desc}</li>;
                                                })
                                            }
                                        </ul>
                                        <div className="flex flex-wrap items-start justify-start text-xs py-2">
                                            {
                                                (project.domains ?
                                                    project.domains.map((domain, index) => {
                                                        const borderColorClass = `border-${tag_colors[domain]}`
                                                        const textColorClass = `text-${tag_colors[domain]}`

                                                        return <span key={index} className={`px-1.5 py-0.5 w-max border ${borderColorClass} ${textColorClass} m-1 rounded-full`}>{domain}</span>
                                                    })

                                                    : null)
                                            }
                                        </div>
                                    </CardItem>
                                </CardBody>
                            </CardContainer>
                        )
                    })
                }
            </div>
        </>
    )
}
function Resume() {
    return (
        <div className="h-full w-full pt-8 md:pt-0">
            {/* Desktop: native PDF viewer works fine */}
            <iframe
                className="h-full w-full hidden md:block"
                src="./files/AshinShanly_RESUME.pdf"
                title="ashin shanly resume"
                frameBorder="0"
            />
            {/* Mobile: use Google Docs Viewer for proper PDF scrolling */}
            <div className="h-full w-full flex flex-col md:hidden">
                <iframe
                    className="flex-grow w-full"
                    src="https://docs.google.com/gview?url=https://ashinshanly.github.io/files/AshinShanly_RESUME.pdf&embedded=true"
                    title="ashin shanly resume"
                    frameBorder="0"
                    style={{ minHeight: 0 }}
                />
                <div className="flex justify-center py-2 shrink-0">
                    <a
                        href="./files/AshinShanly_RESUME.pdf"
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-gray-300 hover:text-white underline"
                    >
                        Open / Download Resume
                    </a>
                </div>
            </div>
        </div>
    )
}
