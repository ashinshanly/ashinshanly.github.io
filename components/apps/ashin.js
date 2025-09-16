import React, { Component } from 'react';
import ReactGA from 'react-ga4';

export class AboutAshin extends Component {

    constructor() {
        super();
        this.screens = {};
        this.state = {
            screen: () => { },
            active_screen: "about", // by default 'about' screen is active
            navbar: false,
        }
    }f

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
                <div onClick={this.showNavBar} className="md:hidden flex flex-col items-center justify-center absolute bg-ub-cool-grey rounded w-6 h-6 top-1 left-1">
                    <div className=" w-3.5 border-t border-white"></div>
                    <div className=" w-3.5 border-t border-white" style={{ marginTop: "2pt", marginBottom: "2pt" }}></div>
                    <div className=" w-3.5 border-t border-white"></div>
                    <div className={(this.state.navbar ? " visible animateShow z-30 " : " invisible ") + " md:hidden text-xs absolute bg-ub-cool-grey py-0.5 px-1 rounded-sm top-full mt-1 left-0 shadow border-black border border-opacity-20"}>
                        {this.renderNavLinks()}
                    </div>
                </div>
                <div className="flex flex-col w-3/4 md:w-4/5 justify-start items-center flex-grow bg-ub-grey overflow-y-auto windowMainScreen">
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
        <>
            <div className="w-20 md:w-28 my-4 bg-white rounded-full">
                <img className="w-full" src="./images/logos/bitmoji.png" alt="Ashin Shanly Logo" />
            </div>
            <div className=" mt-4 md:mt-8 text-lg md:text-2xl text-center px-1">
                <div className="font-normal ml-1">My name is <span className="text-pink-600 font-bold">Ashin Shanly,</span></div>
                <div className="font-normal ml-1">I'm a <span className="text-pink-600 font-bold">Software Engineer!</span></div>
            </div>
            <div className=" mt-4 relative md:my-8 pt-px bg-white w-32 md:w-48">
                <div className="bg-white absolute rounded-full p-0.5 md:p-1 top-0 transform -translate-y-1/2 left-0"></div>
                <div className="bg-white absolute rounded-full p-0.5 md:p-1 top-0 transform -translate-y-1/2 right-0"></div>
            </div>
            <ul className=" mt-4 leading-tight tracking-tight text-sm md:text-base w-5/6 md:w-3/4 emoji-list">
                <li className=" list-pc">I'm a <span className=" font-medium">Software Engineer</span> proficient in cloud computing (OCI, GCP), machine learning, and data engineering, with a focus on creating scalable, high-performance
solutions. I'm seeking opportunities to apply my skills and contribute to transformative projects in cutting-edge technology environments! <br></br> ( Hit me up <a className='text-underline' href='mailto:ashinkoottala@gmail.com'><u>@ashinkoottala@gmail.com</u></a> :) )</li>
                <li className=" mt-3 list-building"> I enjoy building awesome software that solves practical problems.</li>
                <li className=" mt-3 list-time"> When I am not coding my next project, I like to spend my time playing badminton, watching <a href="https://www.imdb.com/title/tt9335498/" target="_blank" rel="noreferrer"> anime,</a> or swing trading</li>
                <li className=" mt-3 list-star"> I’m also really into deep learning and computer vision! Feel free to check out my research publications <u><a href="https://scholar.google.com/citations?user=Grl9bo0AAAAJ&hl=en" target="_blank" rel="noreferrer">HERE!</a></u></li>
                <li className=" mt-3 list-star"> Here are my <u><a href="https://www.github.com/ashinshanly" target="_blank" rel="noreferrer">GitHub</a></u> and <u><a href="https://www.linkedin.com/in/ashinshanly/" target="_blank" rel="noreferrer">LinkedIn</a></u> profiles</li>
            </ul>
        </>
    )
}

function Experience() {
    return (
        <>
            <div className=" font-medium relative text-2xl mt-2 md:mt-4 mb-4">
                Experience
                <div className="absolute pt-px bg-white mt-px top-full w-full">
                    <div className="bg-white absolute rounded-full p-0.5 md:p-1 top-0 transform -translate-y-1/2 left-full"></div>
                    <div className="bg-white absolute rounded-full p-0.5 md:p-1 top-0 transform -translate-y-1/2 right-full"></div>
                </div>
            </div>
            <ul className=" mt-4 leading-tight tracking-tight text-sm md:text-base w-5/6 md:w-3/4 emoji-list">
                <li className="list-disc">
                    <div className=" text-lg md:text-xl text-left font-bold leading-tight">
                        Software Engineer III
                    </div>
                    <div className=" text-sm text-gray-400 mt-0.5">Google &nbsp;&nbsp;(Aug 2025 - Current)</div>
                    <ul>
                        <li> Enabling Alphabet to run the most efficient and elastic fleet in the industry by providing trusted data and actionable insights.
                        </li>   
                    </ul>            
                </li>
                <br></br>
    
                <li className="list-disc">
                    <div className=" text-lg md:text-xl text-left font-bold leading-tight">
                        Member of Technical Staff (IC2)
                    </div>
                    <div className=" text-sm text-gray-400 mt-0.5">Oracle India Pvt Ltd &nbsp;&nbsp;(Aug 2022 - Aug 2025)</div>
                    <ul>
                        <li> Architected petabyte-scale ETL pipelines using PySpark on OCI to reduce data processing latency and cost, delivering high-throughput real-time ingestion, transformation, and aggregation of global customer usage data; developed a fault-tolerant, distributed framework that processes billions of records daily and enables dynamic, actionable reporting.
                        </li>   
                        <br></br>
                        <li> Designed and implemented an enterprise-wide Generative AI RAG chatbot, leveraging a vector database for high-speed document retrieval and fine-tuned LLMs for accurate, context-driven query responses. Automated 60% of manual query handling, enhanced query resolution accuracy by 30%, and significantly elevated cross-departmental operational efficiency.
                        </li>  
                        <br></br>
                        <li> Led a team of 5 developers in redesigning data load processes by migrating from a legacy relational data
warehouse to the Delta Lake ecosystem, leveraging robust ACID compliance, dynamic schema evolution,
and time travel to ensure superior data integrity and auditability. Optimised storage with file compaction
and partitioning, reducing I/O overhead and boosting query performance by 40%, while seamlessly
integrating with Spark-based ETL workflows for real-time analytics and cost-efficient data management.
                        </li> 
                        <br></br> 
                        <li> Created an instance and rack decommissioning dashboard that accelerated throughput for decom-
missioning bare-metal and virtual machine instances. Enhanced multi-dimensional visibility (rack, host,
and instance levels), optimising data center resource allocation and saving thousands of dollars annually by
improving operational efficiency and reducing idle resource costs.
                        </li>
                        <br></br> 
                        <li> Led the design and implementation of robust data archival and purging frameworks, automating the
identification of cold and inactive data. Migrated historical data to cost-effective, long-term storage while
purging obsolete records in compliance with retention policies. Achieved a 25% reduction in long-term
storage costs and enhanced overall database performance by optimising active data sets. Collaborated with
cross-functional teams to streamline data governance and ensure audit readiness.
                        </li>
                    </ul>            
                </li>
                <br></br>

                <li className="list-disc">
                    <div className=" text-lg md:text-xl text-left font-bold leading-tight">
                        Machine Vision Research Scientist Intern
                    </div>
                    <div className=" text-sm text-gray-400 mt-0.5">TCS Research and Innovation Labs &nbsp;&nbsp;(May 2021 - Aug 2021)</div>
                    <ul>
                        <li>Pioneered advanced research in tree segmentation by leveraging airborne and spaceborne LiDAR technology, driving a notable increase in segmentation accuracy and advancing precision in geospatial analysis for forestry applications.
                        </li>   
                        <br></br>
                        <li>Engineered an innovative tree segmentation model utilizing a hybrid machine learning and signal processing framework, achieving an 18% boost in model accuracy, thereby setting a new benchmark for high-precision environmental monitoring systems.
                        </li>  
                        <br></br>
                        <li>Implemented cutting-edge data fusion techniques, seamlessly integrating geospatial point cloud data with hyperspectral imagery to significantly enhance classification models, leading to more refined and actionable environmental insights.
                        </li> 
                    </ul>            
                </li>
            </ul>
        </>
    )
}

function Education() {
    return (
        <>
            <div className=" font-medium relative text-2xl mt-2 md:mt-4 mb-4">
                Education
                <div className="absolute pt-px bg-white mt-px top-full w-full">
                    <div className="bg-white absolute rounded-full p-0.5 md:p-1 top-0 transform -translate-y-1/2 left-full"></div>
                    <div className="bg-white absolute rounded-full p-0.5 md:p-1 top-0 transform -translate-y-1/2 right-full"></div>
                </div>
            </div>
            <ul className=" w-10/12  mt-4 ml-4 px-0 md:px-1">
                <li className="list-disc">
                    <div className=" text-lg md:text-xl text-left font-bold leading-tight">
                        IIT Gandhinagar
                    </div>
                    <div className=" text-sm text-gray-400 mt-0.5">2020 - 2022</div>
                    <div className=" text-sm md:text-base">Masters in Computer Science and Engineering</div>
                    <div className="text-sm text-gray-300 font-bold mt-1">Director’s Silver Medal for Academic Excellence &nbsp; - &nbsp; CGPA &nbsp; 9.00/10</div>
                </li>
                <br></br>
                <li className="list-disc">
                    <div className=" text-lg md:text-xl text-left font-bold leading-tight">
                        Government Engineering College, Thrissur
                    </div>
                    <div className=" text-sm text-gray-400 mt-0.5">2016 - 2020</div>
                    <div className=" text-sm md:text-base">Bachelors in Computer Science and Engineering</div>
                    <div className="text-sm text-gray-300 font-bold mt-1">Dean’s List for Academic Excellence &nbsp; - &nbsp; CGPA &nbsp; 9.11/10</div>
                </li>
                <li className="list-disc mt-5">
                    <div className=" text-lg md:text-xl text-left font-bold leading-tight">
                        Class 12<sup>th</sup> (CBSE)
                    </div>
                    <div className=" text-sm text-gray-400 mt-0.5">2015 - 2016</div>
                    <div className=" text-sm md:text-base">Maths, Physics, Chemistry</div>
                    <div className="text-sm text-gray-300 font-bold mt-1">Percentile Rank &nbsp; 94.8%</div>
                </li>
            </ul>
        </>
    )
}
function Skills() {
    return (
        <>
            <div className=" font-medium relative text-2xl mt-2 md:mt-4 mb-4">
                Technical Skills
                <div className="absolute pt-px bg-white mt-px top-full w-full">
                    <div className="bg-white absolute rounded-full p-0.5 md:p-1 top-0 transform -translate-y-1/2 left-full"></div>
                    <div className="bg-white absolute rounded-full p-0.5 md:p-1 top-0 transform -translate-y-1/2 right-full"></div>
                </div>
            </div>
            <ul className=" tracking-tight text-sm md:text-base w-10/12 emoji-list">
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
            <div className="w-full md:w-10/12 flex mt-4">
                <div className=" text-sm text-center md:text-base w-1/2 font-bold">Languages & Tools</div>
                <div className=" text-sm text-center md:text-base w-1/2 font-bold">Frameworks & Libraries</div>
            </div>
            <div className="w-full md:w-10/12 flex justify-center items-start font-bold text-center">
                <div className="px-2 w-1/2">
                    <div className="flex flex-wrap justify-center items-start w-full mt-2">
                        <img className="m-1" src="http://img.shields.io/badge/-Python-3776AB?style=flat&logo=python&logoColor=ffffff" alt="ashin python" />
                        <img className="m-1" src="https://img.shields.io/badge/C%2B%2B-00599C?style=flat&logo=c%2B%2B&logoColor=white" alt="ashin c++" />
                        <img className="m-1" src="http://img.shields.io/badge/-SQL-4479A1?style=plastic&logo=postgresql&logoColor=ffffff" alt="ashin sql" />
                        <img className="m-1" src="https://img.shields.io/badge/-JavaScript-%23F7DF1C?style=flat&logo=javascript&logoColor=000000&labelColor=%23F7DF1C&color=%23FFCE5A" alt="ashin javascript" />
                        <a href="https://www.google.com/search?q=is+html+a+language%3F" target="_blank" rel="noreferrer"><img title="yes it's a language!" className="m-1" src="https://img.shields.io/badge/-HTML5-%23E44D27?style=flat&logo=html5&logoColor=ffffff" alt="ashin HTML" /></a>
                        <img src="http://img.shields.io/badge/-OCI-F80000?style=plastic&logo=oracle&logoColor=ffffff" alt="ashin oci" className="m-1" />
                        <img src="http://img.shields.io/badge/-GCP-4285F4?style=plastic&logo=googlecloud&logoColor=ffffff" alt="ashin gcp" className="m-1" />
                        <img src="http://img.shields.io/badge/-Terraform-623CE4?style=plastic&logo=terraform&logoColor=ffffff" alt="ashin terraform" className="m-1" />
                        <img src="http://img.shields.io/badge/-Docker-2496ED?style=plastic&logo=docker&logoColor=ffffff" alt="ashin docker" className="m-1" />
                        <img src="http://img.shields.io/badge/-Kubernetes-326CE5?style=plastic&logo=kubernetes&logoColor=ffffff" alt="ashin kubernetes" className="m-1" />
                        <img src="http://img.shields.io/badge/-Android%20Studio-3DDC84?style=plastic&logo=androidstudio&logoColor=ffffff" alt="ashin android studio" className="m-1" />
                        <img src="http://img.shields.io/badge/-XAMPP-FB7A24?style=plastic&logo=xampp&logoColor=ffffff" alt="ashin android xampp" className="m-1" />
                        <img src="https://img.shields.io/badge/-Sass-%23CC6699?style=flat&logo=sass&logoColor=ffffff" alt="ashin SASS" className="m-1" />
                        <img src="https://img.shields.io/badge/-Git-%23F05032?style=flat&logo=git&logoColor=%23ffffff" alt="ashin git" className="m-1" />
                    </div>
                </div>
                <div className="px-2 flex flex-wrap items-start w-1/2">
                    <div className="flex flex-wrap justify-center items-start w-full mt-2">
                        <img className="m-1" src="http://img.shields.io/badge/-Apache%20Spark-E25A1C?style=plastic&logo=apachespark&logoColor=ffffff" alt="ashin spark" />
                        <img className="m-1" src="http://img.shields.io/badge/-Hadoop-66CCFF?style=plastic&logo=apachehadoop&logoColor=ffffff" alt="ashin hadoop" />
                        <img className="m-1" src="http://img.shields.io/badge/-TensorFlow-FF6F00?style=plastic&logo=tensorflow&logoColor=ffffff" alt="ashin tensorflow" />
                        <img className="m-1" src="http://img.shields.io/badge/-PyTorch-EE4C2C?style=plastic&logo=pytorch&logoColor=ffffff" alt="ashin pytorch" />
                        <img className="m-1" src="http://img.shields.io/badge/-Streamlit-FF4B4B?style=plastic&logo=streamlit&logoColor=ffffff" alt="ashin streamlit" />
                        <img className="m-1" src="http://img.shields.io/badge/-Flask-000000?style=plastic&logo=flask&logoColor=ffffff" alt="ashin flask" />
                        <img className=" m-1" src="https://img.shields.io/badge/Next-black?style=flat&logo=next.js&logoColor=ffffff" alt="ashin next" />
                        <img className=" m-1" src="https://img.shields.io/badge/-React-61DAFB?style=flat&logo=react&logoColor=ffffff" alt="ashin react" />
                        <img className="m-1" src="http://img.shields.io/badge/-Django-092E20?style=plastic&logo=django&logoColor=ffffff" alt="ashin django" />
                        <img className="m-1" src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white" alt="ashin tailwind css" />
                        <img src="https://img.shields.io/badge/-Nodejs-339933?style=flat&logo=Node.js&logoColor=ffffff" alt="ashin node.js" className="m-1" />
                        <img src="https://img.shields.io/badge/jQuery-0769AD?style=flat&logo=jquery&logoColor=white" alt="ashin jquery" className="m-1" />
                        <img className="m-1" src="https://img.shields.io/badge/Redux-593D88?style=flat&logo=redux&logoColor=white" alt="ashin redux" />
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
            link: "",
            description: [
                "Implicit Neural Representation (INR) is an emerging signal representation and rendering technique. These representations are continuous, implicit and differentiable. Their primary advantages are memory efficiency with high spatial resolution and the ability to be incorporated into pipelines based on differentiable learning. However, neural scene representations are slow and cannot represent complex scenes. In this work, we aim to speed up the training time for implicit neural representation networks without compromising the quality of the reconstructed signal. We propose an input-split network architecture that flexibly distributes network resources during training based on the intricacy of the input signal at the given locality. We perform experiments on large-scale images and complex Stanford 3D models. We present a detailed comparison of results indicating speedups of up to ∼ 21.23% more than the state-of-the-art approaches.",
            ],
            domains: ["Deep Learning", "Computer Vision"]
        },
        {
            name: "Image Caption Generator using Siamese Graph Convolutional Networks and LSTM",
            date: "Jun 2021",
            link: "",
            description: [
                "Image captions are those crisp descriptions that you see under images. They generally provide the viewer with a brief idea about the image context. To generate an accurate description of the scene, the model requires a semantic and spatial understanding of the contents in the scene. This project proposes a novel approach using Siamese Graph Convolutional Network (S-GCN), making use of a non-parametric Kernel Activation function (KAF) followed by an LSTM with attention to generate natural language captions for the input image. Siamese-GCN captures deep semantic relations and makes the model more robust to class imbalances. We use an extended kernel activation function and regularize with standard lp-norm techniques, improving the overall model performance by a significant margin. Successfully published this work at the 9th ACM Conference on Data Sciences (CODS) and the 27th Conference on Management of Data (COMAD), garnering recognition for its contribution to the field.",
            ],
            domains: ["Machine Learning", "NLP"]
        },
        {
            name: "Reverse Dictionary using an Improved CBOW model",
            date: "Oct 2020",
            link: "",
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
        <div className=" font-medium relative text-2xl mt-2 md:mt-4 mb-4">
            Projects
            <div className="absolute pt-px bg-white mt-px top-full w-full">
                <div className="bg-white absolute rounded-full p-0.5 md:p-1 top-0 transform -translate-y-1/2 left-full"></div>
                <div className="bg-white absolute rounded-full p-0.5 md:p-1 top-0 transform -translate-y-1/2 right-full"></div>
            </div>
        </div>
            {
                project_list.map((project, index) => {
                    const projectNameFromLink = project.link.split('/')
                    const projectName = projectNameFromLink[projectNameFromLink.length - 1]
                    return (
                        <a key={index} href={project.link} target="_blank" rel="noreferrer" className="flex w-full flex-col px-4">
                            <div className="w-full py-1 px-2 my-2 border border-gray-50 border-opacity-10 rounded hover:bg-gray-50 hover:bg-opacity-5 cursor-pointer">
                                <div className="flex flex-wrap justify-between items-center">
                                    <div className='flex justify-center items-center'>
                                        <div className=" text-base md:text-lg mr-2">{project.name.toLowerCase()}</div>
                                        <iframe src={`https://ghbtns.com/github-btn.html?user=ashinshanly&repo=${projectName}&type=star&count=true`} frameBorder="0" scrolling="0" width="150" height="20" title={project.name.toLowerCase()+"-star"}></iframe>
                                    </div>
                                    <div className="text-gray-300 font-light text-sm">{project.date}</div>
                                </div>
                                <ul className=" tracking-normal leading-tight text-sm font-light ml-4 mt-1">
                                    {
                                        project.description.map((desc, index) => {
                                            return <li key={index} className="list-disc mt-1 text-gray-100">{desc}</li>;
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
                            </div>
                        </a>
                    )
                })
            }
        </>
    )
}
function Resume() {
    return (
        <iframe className="h-full w-full" src="./files/AshinShanly_RESUME.pdf" title="ashin shanly resume" frameBorder="0"></iframe>
    )
}
