import React from 'react'

function DefaultMenu(props) {
    return (
        <div id="default-menu" className={(props.active ? " block " : " hidden ") + " cursor-default w-52 bg-black/40 backdrop-blur-md border text-left border-cyan-500/30 rounded text-white py-4 absolute z-50 text-sm shadow-[0_0_15px_rgba(0,255,255,0.1)]"}>
            <a rel="noreferrer noopener" href="https://github.com/ashinshanly/ashinshanly.github.io" target="_blank" className="w-full block cursor-default py-0.5 hover:bg-cyan-500/20 mb-1.5 transition-colors">
                <span className="ml-5">🌟</span> <span className="ml-2">Star this Project</span>
            </a>
            <a rel="noreferrer noopener" href="https://github.com/ashinshanly/ashinshanly.github.io/issues" target="_blank" className="w-full block cursor-default py-0.5 hover:bg-cyan-500/20 mb-1.5 transition-colors">
                <span className="ml-5">❗</span> <span className="ml-2">Report bugs</span>
            </a>
            <Devider />
            <a rel="noreferrer noopener" href="https://www.linkedin.com/in/ashinshanly/" target="_blank" className="w-full block cursor-default py-0.5 hover:bg-cyan-500/20 mb-1.5 transition-colors">
                <span className="ml-5">🙋‍♂️</span> <span className="ml-2">Follow on <strong>Linkedin</strong></span>
            </a>
            <a rel="noreferrer noopener" href="https://github.com/ashinshanly" target="_blank" className="w-full block cursor-default py-0.5 hover:bg-cyan-500/20 mb-1.5 transition-colors">
                <span className="ml-5">🤝</span> <span className="ml-2">Follow on <strong>Github</strong></span>
            </a>
            <a rel="noreferrer noopener" href="mailto:ashinkoottala@gmail.com" target="_blank" className="w-full block cursor-default py-0.5 hover:bg-cyan-500/20 mb-1.5 transition-colors">
                <span className="ml-5">📥</span> <span className="ml-2">Contact Me</span>
            </a>
            <Devider />
            <div onClick={() => { localStorage.clear(); window.location.reload() }} className="w-full block cursor-default py-0.5 hover:bg-cyan-500/20 mb-1.5 transition-colors">
                <span className="ml-5">🧹</span> <span className="ml-2">Reset Ubuntu</span>
            </div>
        </div>
    )
}

function Devider() {
    return (
        <div className="flex justify-center w-full">
            <div className=" border-t border-gray-900 py-1 w-2/5"></div>
        </div>
    );
}

export default DefaultMenu
