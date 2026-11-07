import React, { Component } from 'react';
import $ from 'jquery';
import ReactGA from 'react-ga4';
import { AnimatedBorder } from '../util components/animated-border';

const TERMINAL_THEMES = {
    cyber: {
        name: 'Cyber',
        bg: 'bg-[#070B14]',
        headerBg: 'bg-[#0C1322]',
        promptUser: 'text-cyan-400',
        promptDir: 'text-purple-400',
        accent: 'border-cyan-500/30 text-cyan-300',
    },
    ubuntu: {
        name: 'Ubuntu',
        bg: 'bg-[#220922]',
        headerBg: 'bg-[#190619]',
        promptUser: 'text-ubt-green',
        promptDir: 'text-ubt-blue',
        accent: 'border-orange-500/30 text-orange-300',
    },
    matrix: {
        name: 'Matrix',
        bg: 'bg-[#030D06]',
        headerBg: 'bg-[#06180B]',
        promptUser: 'text-emerald-400',
        promptDir: 'text-green-300',
        accent: 'border-emerald-500/30 text-emerald-300',
    },
    dracula: {
        name: 'Dracula',
        bg: 'bg-[#1E1F29]',
        headerBg: 'bg-[#16171F]',
        promptUser: 'text-pink-400',
        promptDir: 'text-indigo-300',
        accent: 'border-pink-500/30 text-pink-300',
    },
};

const ALL_COMMANDS = [
    'help',
    'neofetch',
    'whoami',
    'experience',
    'education',
    'skills',
    'projects',
    'contact',
    'ls',
    'cd',
    'pwd',
    'cat',
    'tree',
    'mkdir',
    'echo',
    'top',
    'weather',
    'calc',
    'fortune',
    'cowsay',
    'history',
    'date',
    'uptime',
    'theme',
    'orby',
    'voice',
    'matrix',
    'code',
    'spotify',
    'chrome',
    'about-ashin',
    'trash',
    'settings',
    'sendmsg',
    'lumina',
    'guestbook',
    'sudo',
    'clear',
    'exit',
];

const QUOTES = [
    '"Simplicity is prerequisite for reliability." — Edsger W. Dijkstra',
    '"Talk is cheap. Show me the code." — Linus Torvalds',
    '"Premature optimization is the root of all evil." — Donald Knuth',
    '"First, solve the problem. Then, write the code." — John Johnson',
    '"The best way to predict the future is to invent it." — Alan Kay',
];

export class Terminal extends Component {
    constructor() {
        super();
        this.cursor = '';
        this.terminal_rows = 1;
        this.current_directory = '~';
        this.curr_dir_name = 'root';
        this.prev_commands = [];
        this.commands_index = -1;
        this.sessionStart = Date.now();
        this.child_directories = {
            root: [
                'about.md',
                'resume.txt',
                'books',
                'projects',
                'personal-documents',
                'skills',
                'languages',
                'interests',
                'IIT_GN',
            ],
            IIT_GN: ['Thesis_Implicit_Neural_Representations.pdf', 'Directors_Silver_Medal_9.0_CGPA.txt'],
            books: [
                'Eric-Jorgenson_The-Almanack-of-Naval-Ravikant.pdf',
                'Elon Musk: How the Billionaire CEO of SpaceX.pdf',
                'The $100 Startup_CHRIS_GUILLEBEAU.pdf',
                'The_Magic_of_Thinking_Big.pdf',
            ],
            skills: [
                'Backend development',
                'Data Engineering',
                'Distributed Processing',
                'Cloud Engineering',
                'Deep Learning & CV',
                'GenAI & Vector RAG',
                'SQL & Delta Lake',
                'Apache Spark',
            ],
            projects: [
                'Accelerated Implicit Neural Representation with Split Encoder and Multiscale Partitioning',
                'Image Caption Generator using Siamese Graph Convolutional Networks and LSTM',
                'Reverse Dictionary using an Improved CBOW model',
                'Lumina-Cosmic-Memory',
                'MusicSync-Distributed-Audio',
                'PixelHUD-64x64-GuestBook',
            ],
            interests: ['Software Engineering', 'Deep Learning', 'Computer Vision', 'Badminton', 'Anime', 'Swing Trading'],
            languages: ['Python', 'C/C++', 'Java', 'Javascript', 'SQL', 'Terraform'],
        };
        this.state = {
            terminal: [],
            themeKey: 'cyber',
            currentDirDisplay: '~',
        };
    }

    componentDidMount() {
        this.reStartTerminal();
    }

    componentDidUpdate() {
        clearInterval(this.cursor);
        this.startCursor(this.terminal_rows - 2);
    }

    componentWillUnmount() {
        clearInterval(this.cursor);
    }

    reStartTerminal = () => {
        clearInterval(this.cursor);
        $('#terminal-body').empty();
        this.terminal_rows = 1;
        this.setState({ terminal: [] }, () => {
            this.appendTerminalRow();
        });
    };

    appendTerminalRow = () => {
        let terminal = [...this.state.terminal];
        terminal.push(this.terminalRow(this.terminal_rows));
        this.setState({ terminal, currentDirDisplay: this.current_directory });
        this.terminal_rows += 2;
    };

    terminalRow = (id) => {
        const theme = TERMINAL_THEMES[this.state.themeKey] || TERMINAL_THEMES.cyber;
        return (
            <React.Fragment key={id}>
                <div className="flex w-full min-h-[22px] items-center font-mono text-xs md:text-sm">
                    <div className="flex items-center flex-shrink-0 select-none">
                        <span className={`font-bold ${theme.promptUser}`}>ashin@ubuntu</span>
                        <span className="text-slate-400 mx-0.5">:</span>
                        <span className={`font-bold ${theme.promptDir}`}>{this.current_directory}</span>
                        <span className="text-cyan-300 font-bold ml-1 mr-2">❯</span>
                    </div>
                    <div
                        id="cmd"
                        onClick={this.focusCursor}
                        className="bg-transparent relative flex-1 overflow-hidden min-h-[20px] flex items-center"
                    >
                        <span
                            id={`show-${id}`}
                            className="float-left whitespace-pre pb-0.5 opacity-100 font-normal tracking-wide text-slate-100"
                        />
                        <div id={`cursor-${id}`} className="float-left w-2 h-4 bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
                        <input
                            id={`terminal-input-${id}`}
                            data-row-id={id}
                            onKeyDown={this.checkKey}
                            onBlur={this.unFocusCursor}
                            className="absolute top-0 left-0 w-full h-full opacity-0 outline-none bg-transparent cursor-text"
                            spellCheck={false}
                            autoFocus={true}
                            autoComplete="off"
                            type="text"
                            aria-label="Terminal command input"
                        />
                    </div>
                </div>
                <div id={`row-result-${id}`} className="my-2 font-normal text-xs md:text-sm leading-relaxed text-slate-200" />
            </React.Fragment>
        );
    };

    focusCursor = (e) => {
        clearInterval(this.cursor);
        const targetId = $(e.target).data('row-id') || this.terminal_rows - 2;
        this.startCursor(targetId);
    };

    unFocusCursor = (e) => {
        this.stopCursor($(e.target).data('row-id'));
    };

    startCursor = (id) => {
        clearInterval(this.cursor);
        $(`input#terminal-input-${id}`).trigger('focus');
        $(`input#terminal-input-${id}`)
            .off('input')
            .on('input', function () {
                $(`#cmd span#show-${id}`).text($(this).val());
            });
        this.cursor = window.setInterval(function () {
            if ($(`#cursor-${id}`).css('visibility') === 'visible') {
                $(`#cursor-${id}`).css({ visibility: 'hidden' });
            } else {
                $(`#cursor-${id}`).css({ visibility: 'visible' });
            }
        }, 500);
    };

    stopCursor = (id) => {
        clearInterval(this.cursor);
        $(`#cursor-${id}`).css({ visibility: 'visible' });
    };

    removeCursor = (id) => {
        this.stopCursor(id);
        $(`#cursor-${id}`).css({ display: 'none' });
    };

    clearInput = (id) => {
        $(`input#terminal-input-${id}`).trigger('blur');
    };

    runQuickCommand = (cmdText) => {
        const activeRowId = this.terminal_rows - 2;
        const inputEl = $(`input#terminal-input-${activeRowId}`);
        if (inputEl.length > 0) {
            inputEl.val(cmdText);
            $(`#show-${activeRowId}`).text(cmdText);
            this.removeCursor(activeRowId);
            this.prev_commands.push(cmdText);
            this.commands_index = this.prev_commands.length - 1;
            this.clearInput(activeRowId);
            this.handleCommands(cmdText, activeRowId);
        }
    };

    checkKey = (e) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            const terminal_row_id = $(e.target).data('row-id');
            const rawVal = $(`input#terminal-input-${terminal_row_id}`).val() || '';
            const parts = rawVal.split(' ');
            if (parts.length === 1) {
                const prefix = parts[0].toLowerCase();
                const match = ALL_COMMANDS.find((c) => c.startsWith(prefix));
                if (match) {
                    $(`input#terminal-input-${terminal_row_id}`).val(match);
                    $(`#show-${terminal_row_id}`).text(match);
                }
            } else if (parts.length === 2) {
                const argPrefix = parts[1].toLowerCase();
                const dirItems = this.child_directories[this.curr_dir_name] || [];
                const match = dirItems.find((item) => item.toLowerCase().startsWith(argPrefix));
                if (match) {
                    const completed = `${parts[0]} ${match}`;
                    $(`input#terminal-input-${terminal_row_id}`).val(completed);
                    $(`#show-${terminal_row_id}`).text(completed);
                }
            }
            return;
        }

        if (e.key === 'Enter') {
            let terminal_row_id = $(e.target).data('row-id');
            let command = $(`input#terminal-input-${terminal_row_id}`).val().trim();
            if (command.length !== 0) {
                this.removeCursor(terminal_row_id);
                this.handleCommands(command, terminal_row_id);
            } else return;
            this.prev_commands.push(command);
            this.commands_index = this.prev_commands.length - 1;
            this.clearInput(terminal_row_id);
        } else if (e.key === 'ArrowUp') {
            let prev_command;
            if (this.commands_index <= -1) prev_command = '';
            else prev_command = this.prev_commands[this.commands_index];

            let terminal_row_id = $(e.target).data('row-id');
            $(`input#terminal-input-${terminal_row_id}`).val(prev_command);
            $(`#show-${terminal_row_id}`).text(prev_command);
            this.commands_index--;
        } else if (e.key === 'ArrowDown') {
            let prev_command;
            if (this.commands_index >= this.prev_commands.length) return;
            if (this.commands_index <= -1) this.commands_index = 0;

            if (this.commands_index === this.prev_commands.length) prev_command = '';
            else prev_command = this.prev_commands[this.commands_index];

            let terminal_row_id = $(e.target).data('row-id');
            $(`input#terminal-input-${terminal_row_id}`).val(prev_command);
            $(`#show-${terminal_row_id}`).text(prev_command);
            this.commands_index++;
        }
    };

    childDirectories = (parent) => {
        let files = [];
        files.push(`<div class="flex justify-start flex-wrap gap-2 py-1">`);
        (this.child_directories[parent] || []).forEach((file) => {
            const isDir = Object.prototype.hasOwnProperty.call(this.child_directories, file);
            const badgeClass = isDir
                ? 'px-2.5 py-0.5 rounded-md bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 font-bold'
                : 'px-2.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-200';
            files.push(`<span class="${badgeClass}">${isDir ? '📁 ' : '📄 '}${file}</span>`);
        });
        files.push(`</div>`);
        return files;
    };

    startMatrix = () => {
        const terminal = document.getElementById('terminal-body');
        if (!terminal) return;
        const canvas = document.createElement('canvas');
        canvas.id = 'matrix-canvas';
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.zIndex = '20';
        terminal.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        canvas.width = terminal.clientWidth || 600;
        canvas.height = terminal.clientHeight || 400;

        const katakana =
            'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン';
        const latin = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const nums = '0123456789';
        const alphabet = katakana + latin + nums;

        const fontSize = 15;
        const columns = Math.floor(canvas.width / fontSize);
        const rainDrops = Array.from({ length: columns }, () => 1);

        const draw = () => {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.06)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#22c55e';
            ctx.font = fontSize + 'px monospace';

            for (let i = 0; i < rainDrops.length; i++) {
                const text = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
                ctx.fillText(text, i * fontSize, rainDrops[i] * fontSize);

                if (rainDrops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                    rainDrops[i] = 0;
                }
                rainDrops[i]++;
            }
        };

        const interval = setInterval(draw, 30);

        const stopMatrix = () => {
            clearInterval(interval);
            canvas.remove();
            window.removeEventListener('keydown', stopMatrix);
            window.removeEventListener('click', stopMatrix);
        };

        setTimeout(() => {
            window.addEventListener('keydown', stopMatrix);
            window.addEventListener('click', stopMatrix);
        }, 400);
    };

    closeTerminal = () => {
        const closeBtn = $('#close-terminal');
        if (closeBtn.length > 0) {
            closeBtn.trigger('click');
        } else if (typeof this.props.onClose === 'function') {
            this.props.onClose();
        }
    };

    handleCommands = (command, rowId) => {
        const availableCommandsMsg =
            `<div class="text-rose-300">Command not found. Type <span class="text-cyan-300 font-mono">help</span> to view all 25+ interactive commands.</div>`;
        let words = command.split(' ').filter(Boolean);
        let main = (words[0] || '').toLowerCase();
        words.shift();
        let result = '';
        let rest = words.join(' ').trim();

        switch (main) {
            case 'help':
                result = `
                    <div class="p-3 rounded-xl bg-white/[0.04] border border-white/10 space-y-2">
                        <div class="text-cyan-300 font-bold text-xs uppercase tracking-wider">⚡ Ashin-OS Interactive Shell Commands</div>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs">
                            <div><span class="text-cyan-400 font-mono font-bold">neofetch</span> — System &amp; developer profile</div>
                            <div><span class="text-cyan-400 font-mono font-bold">whoami</span> — Quick bio &amp; current role</div>
                            <div><span class="text-cyan-400 font-mono font-bold">experience</span> — Work history (Google, Oracle, TCS)</div>
                            <div><span class="text-cyan-400 font-mono font-bold">education</span> — IIT Gandhinagar &amp; GEC Thrissur</div>
                            <div><span class="text-cyan-400 font-mono font-bold">skills</span> — Technical proficiency matrix</div>
                            <div><span class="text-cyan-400 font-mono font-bold">projects</span> — Research papers &amp; live web apps</div>
                            <div><span class="text-cyan-400 font-mono font-bold">orby / voice</span> — Launch Orby AI Voice Assistant</div>
                            <div><span class="text-cyan-400 font-mono font-bold">ls / cd / pwd / tree</span> — Browse file system</div>
                            <div><span class="text-cyan-400 font-mono font-bold">cat &lt;file&gt;</span> — Read file (e.g. <span class="text-purple-300">cat about.md</span>)</div>
                            <div><span class="text-cyan-400 font-mono font-bold">top / weather / calc</span> — System &amp; utilities</div>
                            <div><span class="text-cyan-400 font-mono font-bold">fortune / cowsay / matrix</span> — Fun &amp; effects</div>
                            <div><span class="text-cyan-400 font-mono font-bold">theme &lt;cyber|ubuntu|matrix|dracula&gt;</span> — Switch theme</div>
                        </div>
                    </div>
                `;
                break;

            case 'neofetch':
            case 'fastfetch': {
                const upSec = Math.floor((Date.now() - this.sessionStart) / 1000);
                result = `
                    <div class="p-3.5 rounded-xl bg-white/[0.03] border border-cyan-500/20 flex flex-col sm:flex-row gap-4 items-start font-mono text-xs">
                        <pre class="text-cyan-400 leading-tight select-none">
   .---.
  /     \\   ASHIN-OS
  | () () |  24.04 LTS
   \\  ^  /   ---------
    |||||
                        </pre>
                        <div class="space-y-1">
                            <div class="text-cyan-300 font-bold">ashin@google-fleet-node</div>
                            <div class="text-slate-500">------------------------------------</div>
                            <div><span class="text-purple-400 font-bold">Role:</span> Software Engineer III @ Google</div>
                            <div><span class="text-purple-400 font-bold">Prev:</span> MTS @ Oracle • Researcher @ TCS</div>
                            <div><span class="text-purple-400 font-bold">Education:</span> M.Tech CSE @ IIT Gandhinagar (9.00 CGPA 🏆)</div>
                            <div><span class="text-purple-400 font-bold">Core Stack:</span> Python, C++, PySpark, Delta Lake, PyTorch</div>
                            <div><span class="text-purple-400 font-bold">Shell:</span> zsh 5.9 (Tab-completion enabled)</div>
                            <div><span class="text-purple-400 font-bold">Uptime:</span> ${upSec}s</div>
                            <div class="flex gap-1.5 pt-1">
                                <span class="w-4 h-3 rounded-sm bg-cyan-400 inline-block"></span>
                                <span class="w-4 h-3 rounded-sm bg-blue-500 inline-block"></span>
                                <span class="w-4 h-3 rounded-sm bg-purple-500 inline-block"></span>
                                <span class="w-4 h-3 rounded-sm bg-emerald-400 inline-block"></span>
                                <span class="w-4 h-3 rounded-sm bg-amber-400 inline-block"></span>
                                <span class="w-4 h-3 rounded-sm bg-rose-500 inline-block"></span>
                            </div>
                        </div>
                    </div>
                `;
                break;
            }

            case 'whoami':
            case 'bio':
                result = `
                    <div class="p-3 rounded-xl bg-white/[0.04] border border-white/10 space-y-1.5">
                        <div class="text-cyan-300 font-bold">Ashin Shanly — Software Engineer III @ Google</div>
                        <div class="text-slate-300">M.Tech CSE Silver Medalist from IIT Gandhinagar (9.00 CGPA) &amp; B.Tech CSE Dean's List from GEC Thrissur (9.11 CGPA). Passionate about distributed computing, petabyte-scale data engineering, and deep neural networks.</div>
                        <div class="text-xs text-slate-400">📧 <a href="mailto:ashinkoottala@gmail.com" class="text-cyan-400 underline">ashinkoottala@gmail.com</a> • 🔗 <a href="https://github.com/ashinshanly" target="_blank" rel="noreferrer" class="text-cyan-400 underline">github.com/ashinshanly</a></div>
                    </div>
                `;
                break;

            case 'experience':
            case 'work':
                result = `
                    <div class="space-y-2 p-3 rounded-xl bg-white/[0.03] border border-white/10">
                        <div><span class="text-blue-400 font-bold">🔵 Google</span> — <span class="text-white font-semibold">Software Engineer III</span> <span class="text-slate-400 text-xs">(Aug 2025 – Present)</span><br/><span class="text-slate-300 text-xs">Enabling Alphabet to run the most efficient and elastic compute fleet in the industry.</span></div>
                        <div><span class="text-red-400 font-bold">🔴 Oracle</span> — <span class="text-white font-semibold">Member of Technical Staff (IC2)</span> <span class="text-slate-400 text-xs">(Aug 2022 – Aug 2025)</span><br/><span class="text-slate-300 text-xs">Petabyte PySpark ETL on OCI, Delta Lake migration (+40% query speed), Enterprise GenAI RAG chatbot (60% query automation).</span></div>
                        <div><span class="text-sky-400 font-bold">🔷 TCS Research</span> — <span class="text-white font-semibold">Machine Vision Scientist Intern</span> <span class="text-slate-400 text-xs">(May 2021 – Aug 2021)</span><br/><span class="text-slate-300 text-xs">3D airborne LiDAR &amp; hyperspectral fusion for tree segmentation (+18% accuracy).</span></div>
                    </div>
                `;
                break;

            case 'education':
                result = `
                    <div class="space-y-2 p-3 rounded-xl bg-white/[0.03] border border-white/10">
                        <div><span class="text-amber-400 font-bold">🏆 IIT Gandhinagar</span> — M.Tech in Computer Science &amp; Engineering (2020–2022) • <span class="text-emerald-300 font-semibold">CGPA 9.00/10 (Director's Silver Medal)</span></div>
                        <div><span class="text-cyan-400 font-bold">🎓 GEC Thrissur</span> — B.Tech in Computer Science &amp; Engineering (2016–2020) • <span class="text-emerald-300 font-semibold">CGPA 9.11/10 (Dean's List)</span></div>
                    </div>
                `;
                break;

            case 'skills':
                result = `
                    <div class="p-3 rounded-xl bg-white/[0.03] border border-white/10 font-mono text-xs space-y-1.5">
                        <div><span class="text-cyan-300 w-36 inline-block">Python / PySpark</span> [███████████████████░] 98%</div>
                        <div><span class="text-cyan-300 w-36 inline-block">Distributed &amp; SQL</span> [██████████████████░░] 95%</div>
                        <div><span class="text-purple-300 w-36 inline-block">PyTorch / DeepLearning</span> [██████████████████░░] 92%</div>
                        <div><span class="text-purple-300 w-36 inline-block">GenAI RAG &amp; Vectors</span> [██████████████████░░] 91%</div>
                        <div><span class="text-emerald-300 w-36 inline-block">GCP / OCI / K8s</span> [██████████████████░░] 90%</div>
                        <div><span class="text-amber-300 w-36 inline-block">C++ / React / Next.js</span> [█████████████████░░░] 89%</div>
                    </div>
                `;
                break;

            case 'projects':
            case 'publications':
                result = `
                    <div class="space-y-1.5 p-3 rounded-xl bg-white/[0.03] border border-white/10 text-xs">
                        <div>🧠 <span class="text-cyan-300 font-bold">Accelerated Implicit Neural Representation (INR)</span> — Split Encoder &amp; Multiscale Partitioning (+21.23% faster training)</div>
                        <div>📄 <span class="text-purple-300 font-bold">Siamese-GCN Image Caption Generator</span> — Published @ ACM CODS-COMAD</div>
                        <div>📖 <span class="text-emerald-300 font-bold">Improved CBOW Reverse Dictionary</span> — Published @ ACM CODS-COMAD</div>
                        <div>✨ <a href="https://ashinshanly.github.io/lumina/" target="_blank" rel="noreferrer" class="text-cyan-400 underline font-bold">Lumina Cosmic Memory ↗</a> • 🎵 <a href="https://ashinshanly.github.io/musicsync/" target="_blank" rel="noreferrer" class="text-pink-400 underline font-bold">MusicSync Audio ↗</a> • 🎓 <a href="https://scholar.google.com/citations?user=Grl9bo0AAAAJ&hl=en" target="_blank" rel="noreferrer" class="text-amber-300 underline font-bold">Google Scholar ↗</a></div>
                    </div>
                `;
                break;

            case 'contact':
                result = `
                    <div class="p-3 rounded-xl bg-white/[0.03] border border-white/10 text-xs space-y-1">
                        <div>📧 Email: <a href="mailto:ashinkoottala@gmail.com" class="text-cyan-400 underline">ashinkoottala@gmail.com</a></div>
                        <div>💼 LinkedIn: <a href="https://www.linkedin.com/in/ashinshanly/" target="_blank" rel="noreferrer" class="text-cyan-400 underline">linkedin.com/in/ashinshanly</a></div>
                        <div>🐙 GitHub: <a href="https://github.com/ashinshanly" target="_blank" rel="noreferrer" class="text-cyan-400 underline">github.com/ashinshanly</a></div>
                    </div>
                `;
                break;

            case 'tree':
                result = `<pre class="text-cyan-300 font-mono text-xs leading-snug">/home/ashin
├── about.md
├── resume.txt
├── IIT_GN/
│   ├── Thesis_Implicit_Neural_Representations.pdf
│   └── Directors_Silver_Medal_9.0_CGPA.txt
├── projects/
│   ├── Accelerated-Implicit-Neural-Representation
│   ├── Siamese-GCN-Image-Caption-Generator
│   ├── Lumina-Cosmic-Memory
│   └── MusicSync-Distributed-Audio
├── skills/ (PySpark, Distributed Systems, PyTorch, GCP, OCI)
└── languages/ (Python, C/C++, JavaScript, SQL, Terraform)</pre>`;
                break;

            case 'cat':
                if (!rest) {
                    result = 'usage: cat &lt;filename&gt; (try: <span class="text-cyan-300">cat about.md</span> or <span class="text-cyan-300">cat resume.txt</span>)';
                } else if (rest.toLowerCase().includes('about')) {
                    result = `<div class="p-2.5 rounded-lg bg-white/5 border border-white/10 text-xs"># Ashin Shanly<br/>Software Engineer III @ Google | M.Tech CSE @ IIT Gandhinagar (Silver Medalist)<br/>Building planetary-scale data systems, deep learning architectures &amp; interactive apps.</div>`;
                } else if (rest.toLowerCase().includes('resume')) {
                    result = `<div class="p-2.5 rounded-lg bg-white/5 border border-white/10 text-xs">📄 <a href="./files/AshinShanly_RESUME.pdf" target="_blank" rel="noreferrer" class="text-cyan-400 underline font-bold">Click here to open / download AshinShanly_RESUME.pdf ↗</a></div>`;
                } else {
                    result = `<div class="text-slate-300 text-xs">📄 ${this.xss(rest)} — Binary or document asset verified in ${this.current_directory}</div>`;
                }
                break;

            case 'top':
            case 'htop':
                result = `<pre class="text-emerald-300 font-mono text-xs leading-snug">PID   USER     PR  CPU%  MEM%   COMMAND
1042  ashin    20   4.2   8.1   google-fleet-telemetry-engine --workers=64
1108  ashin    20   2.8   6.4   pyspark-delta-lake-pipeline --mode=streaming
1290  ashin    20   1.9   5.2   orby-voice-assistant-daemon --shader=60fps
1412  ashin    20   0.7   2.1   ubuntu-24.04-gnome-compositor</pre>`;
                break;

            case 'weather':
                result = `<div class="text-cyan-300 text-xs">☀️ Bengaluru / Fleet HQ: 25°C • Clear Skies • Wind 11 km/h • Humidity 52%</div>`;
                break;

            case 'calc':
                if (!rest) {
                    result = 'usage: calc &lt;expression&gt; (e.g. calc 2**10 + 42)';
                } else if (/^[0-9+\-*/().%\s*]+$/.test(rest)) {
                    try {
                        // eslint-disable-next-line no-new-func
                        const val = Function(`"use strict"; return (${rest});`)();
                        result = `<span class="text-emerald-400 font-mono font-bold">${this.xss(rest)} = ${val}</span>`;
                    } catch {
                        result = 'calc: invalid arithmetic expression';
                    }
                } else {
                    result = 'calc: only numeric arithmetic operators (+, -, *, /, %, **) are allowed';
                }
                break;

            case 'fortune':
            case 'quote':
                result = `<div class="text-amber-300 italic text-xs">${QUOTES[Math.floor(Math.random() * QUOTES.length)]}</div>`;
                break;

            case 'cowsay': {
                const msg = this.xss(rest || 'Hire Ashin! 🐮');
                result = `<pre class="text-cyan-300 font-mono text-xs leading-tight">
  _${'_'.repeat(Math.min(36, msg.length))}_
 &lt; ${msg} &gt;
  -${'-'.repeat(Math.min(36, msg.length))}-
        \\   ^__^
         \\  (oo)\\_______
            (__)\\       )\\/\\
                ||----w |
                ||     ||</pre>`;
                break;
            }

            case 'history':
                result =
                    this.prev_commands.length === 0
                        ? 'No commands in history yet.'
                        : this.prev_commands
                              .map((c, idx) => `<div class="font-mono text-xs"><span class="text-slate-500 mr-2">${idx + 1}</span>${this.xss(c)}</div>`)
                              .join('');
                break;

            case 'date':
                result = `<span class="text-cyan-300 font-mono">${new Date().toString()}</span>`;
                break;

            case 'uptime': {
                const secs = Math.floor((Date.now() - this.sessionStart) / 1000);
                result = `<span class="text-emerald-300 font-mono">Session uptime: ${Math.floor(secs / 60)}m ${secs % 60}s • Load avg: 0.12, 0.08, 0.05</span>`;
                break;
            }

            case 'theme': {
                const key = rest.toLowerCase();
                if (TERMINAL_THEMES[key]) {
                    this.setState({ themeKey: key });
                    result = `<span class="text-cyan-300">Switched terminal theme to <b>${TERMINAL_THEMES[key].name}</b>.</span>`;
                } else {
                    result = `Available themes: <span class="text-cyan-300 font-mono">theme cyber</span>, <span class="text-cyan-300 font-mono">theme ubuntu</span>, <span class="text-cyan-300 font-mono">theme matrix</span>, <span class="text-cyan-300 font-mono">theme dracula</span>`;
                }
                break;
            }

            case 'orby':
            case 'voice':
                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('portfolio-open-orby'));
                }
                result = `<span class="text-cyan-300">🎙️ Launching Orby Interactive Voice Assistant...</span>`;
                break;

            case 'cd':
                if (words.length === 0 || rest === '' || rest === '~') {
                    this.current_directory = '~';
                    this.curr_dir_name = 'root';
                    break;
                }
                if (words.length > 1) {
                    result = 'too many arguments, arguments must be <1.';
                    break;
                }
                if (rest === 'personal-documents') {
                    result = `bash /${this.curr_dir_name} : Permission denied 😏`;
                    break;
                }
                if (rest === '..' || rest === '../') {
                    this.current_directory = '~';
                    this.curr_dir_name = 'root';
                    break;
                }
                if (rest === '.') {
                    break;
                }
                if ((this.child_directories[this.curr_dir_name] || []).includes(rest)) {
                    if (Object.prototype.hasOwnProperty.call(this.child_directories, rest)) {
                        this.current_directory += '/' + rest;
                        this.curr_dir_name = rest;
                    } else {
                        result = `bash: cd: ${rest}: Not a directory`;
                    }
                } else {
                    result = `bash: cd: ${words}: No such file or directory`;
                }
                break;

            case 'ls': {
                let target = words[0];
                if (target === '' || target === undefined || target === null) target = this.curr_dir_name;
                if (words.length > 1) {
                    result = 'too many arguments, arguments must be <1.';
                    break;
                }
                if (target in this.child_directories) {
                    result = this.childDirectories(target).join('');
                } else if (target === 'personal-documents') {
                    result = 'Nope! 🙃';
                    break;
                } else {
                    result = `ls: cannot access '${words}': No such file or directory`;
                }
                break;
            }

            case 'mkdir':
                if (words[0] !== undefined && words[0] !== '') {
                    if (typeof this.props.addFolder === 'function') {
                        this.props.addFolder(words[0]);
                    } else {
                        if (!this.child_directories.root.includes(words[0])) {
                            this.child_directories.root.push(words[0]);
                            this.child_directories[words[0]] = [];
                        }
                    }
                    result = `<span class="text-emerald-400">Created directory '${this.xss(words[0])}'</span>`;
                } else {
                    result = 'mkdir: missing operand';
                }
                break;

            case 'pwd': {
                let str = this.current_directory;
                result = str.replace('~', '/home/ashin');
                break;
            }

            case 'code':
                if (words[0] === '.' || words.length === 0) {
                    if (typeof this.props.openApp === 'function') this.props.openApp('vscode');
                } else {
                    result = availableCommandsMsg;
                }
                break;

            case 'echo':
                result = this.xss(words.join(' '));
                break;

            case 'spotify':
                if (words[0] === '.' || words.length === 0) {
                    if (typeof this.props.openApp === 'function') this.props.openApp('spotify');
                } else {
                    result = availableCommandsMsg;
                }
                break;

            case 'chrome':
                if (words[0] === '.' || words.length === 0) {
                    if (typeof this.props.openApp === 'function') this.props.openApp('chrome');
                } else {
                    result = availableCommandsMsg;
                }
                break;

            case 'trash':
                if (words[0] === '.' || words.length === 0) {
                    if (typeof this.props.openApp === 'function') this.props.openApp('trash');
                } else {
                    result = availableCommandsMsg;
                }
                break;

            case 'about-ashin':
                if (words[0] === '.' || words.length === 0) {
                    if (typeof this.props.openApp === 'function') this.props.openApp('about-ashin');
                } else {
                    result = availableCommandsMsg;
                }
                break;

            case 'terminal':
                if (words[0] === '.' || words.length === 0) {
                    if (typeof this.props.openApp === 'function') this.props.openApp('terminal');
                } else {
                    result = availableCommandsMsg;
                }
                break;

            case 'settings':
                if (words[0] === '.' || words.length === 0) {
                    if (typeof this.props.openApp === 'function') this.props.openApp('settings');
                } else {
                    result = availableCommandsMsg;
                }
                break;

            case 'sendmsg':
                if (words[0] === '.' || words.length === 0) {
                    if (typeof this.props.openApp === 'function') this.props.openApp('gedit');
                } else {
                    result = availableCommandsMsg;
                }
                break;

            case 'guestbook':
                if (typeof this.props.openApp === 'function') this.props.openApp('pixel-hud');
                result = 'Opening GuestBook Matrix...';
                break;

            case 'lumina':
                window.open('https://ashinshanly.github.io/lumina/', '_blank', 'noopener,noreferrer');
                result = 'Launching Lumina in a new tab...';
                break;

            case 'clear':
                this.reStartTerminal();
                return;

            case 'exit':
                this.closeTerminal();
                return;

            case 'matrix':
                this.startMatrix();
                return;

            case 'sudo':
                ReactGA.event({
                    category: 'Sudo Access',
                    action: 'lol',
                });
                result = "<img class='w-2/5 rounded-lg my-1' src='./images/memes/used-sudo-command.webp' alt='sudo meme' />";
                break;

            default:
                result = availableCommandsMsg;
        }

        const resultEl = document.getElementById(`row-result-${rowId}`);
        if (resultEl) {
            resultEl.innerHTML = result;
        }
        this.appendTerminalRow();
    };

    xss(str) {
        if (!str) return '';
        return str
            .split('')
            .map((char) => {
                switch (char) {
                    case '&':
                        return '&amp;';
                    case '<':
                        return '&lt;';
                    case '>':
                        return '&gt;';
                    case '"':
                        return '&quot;';
                    case "'":
                        return '&#x27;';
                    case '/':
                        return '&#x2F;';
                    default:
                        return char;
                }
            })
            .join('');
    }

    render() {
        const theme = TERMINAL_THEMES[this.state.themeKey] || TERMINAL_THEMES.cyber;
        const quickCommands = [
            'help',
            'neofetch',
            'whoami',
            'experience',
            'skills',
            'projects',
            'tree',
            'orby',
            'fortune',
            'matrix',
            'clear',
        ];

        return (
            <AnimatedBorder
                borderClassName="bg-opacity-40"
                containerClassName="rounded-b-none p-[1.5px]"
                className={`${theme.bg} flex flex-col h-full w-full overflow-hidden`}
            >
                {/* Modern Warp / Kitty Terminal Toolbar */}
                <div
                    className={`${theme.headerBg} border-b border-white/10 px-3 py-2 flex flex-wrap items-center justify-between gap-2 select-none flex-shrink-0`}
                >
                    <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-cyan-500/15 border border-cyan-400/30 text-[11px] font-mono text-cyan-300">
                            zsh • {this.state.currentDirDisplay}
                        </span>
                        <span className="hidden sm:inline text-[11px] text-slate-400 font-mono">
                            Tab auto-complete • ↑↓ History
                        </span>
                    </div>

                    {/* Theme Selector & Action Buttons */}
                    <div className="flex items-center gap-1.5">
                        {Object.keys(TERMINAL_THEMES).map((k) => (
                            <button
                                key={k}
                                type="button"
                                onClick={() => this.setState({ themeKey: k })}
                                className={`px-2 py-0.5 rounded text-[10px] font-mono transition cursor-pointer ${
                                    this.state.themeKey === k
                                        ? 'bg-cyan-500 text-slate-950 font-bold'
                                        : 'bg-white/5 text-slate-400 hover:text-white'
                                }`}
                            >
                                {TERMINAL_THEMES[k].name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Clickable Quick-Command Chips (Mobile & Desktop Friendly) */}
                <div className="px-3 py-1.5 bg-black/25 border-b border-white/5 flex items-center gap-1.5 overflow-x-auto scrollbar-hide flex-shrink-0 select-none">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mr-1 flex-shrink-0">
                        Quick Run:
                    </span>
                    {quickCommands.map((cmd) => (
                        <button
                            key={cmd}
                            type="button"
                            onClick={() => this.runQuickCommand(cmd)}
                            className="px-2.5 py-0.5 rounded-full bg-white/[0.06] hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-400/40 text-[11px] font-mono text-slate-200 hover:text-cyan-200 whitespace-nowrap transition cursor-pointer flex-shrink-0"
                        >
                            {cmd}
                        </button>
                    ))}
                </div>

                {/* Welcome Telemetry Banner */}
                <div className="px-3 pt-2.5 pb-1 text-xs font-mono text-slate-400 border-b border-white/5 select-none flex-shrink-0">
                    <span className="text-cyan-400 font-bold">Ashin-OS 24.04 LTS</span> — Type{' '}
                    <span className="text-cyan-300">help</span>, <span className="text-cyan-300">neofetch</span>, or{' '}
                    <span className="text-purple-300">orby</span> (or tap any chip above).
                </div>

                {/* Interactive Terminal Rows Viewport */}
                <div
                    className="flex-1 w-full text-white text-sm font-bold p-3 overflow-y-auto windowMainScreen relative"
                    id="terminal-body"
                    onClick={() => {
                        const activeRowId = this.terminal_rows - 2;
                        $(`input#terminal-input-${activeRowId}`).trigger('focus');
                    }}
                >
                    {this.state.terminal}
                </div>
            </AnimatedBorder>
        );
    }
}

export default Terminal;

export const displayTerminal = (addFolder, openApp) => {
    if (addFolder && typeof addFolder === 'object' && typeof addFolder !== 'function') {
        return <Terminal {...addFolder} />;
    }
    return <Terminal addFolder={addFolder} openApp={openApp} />;
};
