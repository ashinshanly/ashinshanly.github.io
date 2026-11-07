import React, { Component } from 'react';
import $ from 'jquery';
import ReactGA from 'react-ga4';
import emailjs from '@emailjs/browser';
import { db } from '../../config/firebase';
import { ref, push } from 'firebase/database';

const OWNER_EMAIL = 'ashinkoottala@gmail.com';

export class Gedit extends Component {

    constructor() {
        super();
        this.state = {
            sending: false,
            statusMessage: null,
            statusType: null,
        }
    }

    componentDidMount() {
        if (process.env.NEXT_PUBLIC_USER_ID) {
            emailjs.init(process.env.NEXT_PUBLIC_USER_ID);
        }
    }

    closeWindow = () => {
        const closeBtn = $("#close-gedit");
        if (closeBtn.length > 0) {
            closeBtn.trigger("click");
        } else if (typeof this.props.onClose === "function") {
            this.props.onClose();
        }
    }

    sendMessage = async () => {
        let name = $("#sender-name").val() || "";
        let subject = $("#sender-subject").val() || "";
        let message = $("#sender-message").val() || "";

        name = name.trim();
        subject = subject.trim();
        message = message.trim();

        let error = false;

        if (name.length === 0) {
            $("#sender-name").val('');
            $("#sender-name").attr("placeholder", "Name must not be Empty!");
            error = true;
        }

        if (message.length === 0) {
            $("#sender-message").val('');
            $("#sender-message").attr("placeholder", "Message must not be Empty!");
            error = true;
        }
        if (error) return;

        this.setState({ sending: true, statusMessage: null, statusType: null });

        const serviceID = process.env.NEXT_PUBLIC_SERVICE_ID;
        const templateID = process.env.NEXT_PUBLIC_TEMPLATE_ID;
        const templateParams = {
            'name': name,
            'subject': subject,
            'message': message,
        }

        // Save backup copy to Firebase RTDB if available
        if (db) {
            try {
                await push(ref(db, 'chainreaction/contact_inbox'), {
                    name,
                    subject: subject || 'Portfolio Contact',
                    message,
                    timestamp: Date.now()
                });
            } catch {
                // Non-blocking backup
            }
        }

        const triggerMailtoFallback = () => {
            const mailSubject = encodeURIComponent(subject || `Portfolio Contact from ${name}`);
            const mailBody = encodeURIComponent(`From: ${name}\n\n${message}`);
            if (typeof window !== 'undefined') {
                window.open(`mailto:${OWNER_EMAIL}?subject=${mailSubject}&body=${mailBody}`, '_self');
            }
            this.setState({
                sending: false,
                statusType: 'success',
                statusMessage: `Message saved & mail client opened for ${OWNER_EMAIL}!`
            });
            setTimeout(() => {
                this.closeWindow();
            }, 1400);
        };

        if (!serviceID || !templateID) {
            triggerMailtoFallback();
            return;
        }

        emailjs.send(serviceID, templateID, templateParams).then(() => {
            this.setState({
                sending: false,
                statusType: 'success',
                statusMessage: 'Message sent successfully!'
            });
            setTimeout(() => {
                this.closeWindow();
            }, 900);
        }).catch(() => {
            triggerMailtoFallback();
        })

        ReactGA.event({
            category: "Send Message",
            action: `${name}, ${subject}, ${message}`
        });

    }

    render() {
        return (
            <div className="w-full h-full relative flex flex-col bg-ub-cool-grey text-white select-none">
                <div className="flex items-center justify-between w-full bg-ub-gedit-light bg-opacity-60 border-b border-t border-blue-400 text-sm">
                    <span className="font-bold ml-2">Send a Message to Me</span>
                    <div className="flex">
                        <div onClick={this.sendMessage} className="border border-black bg-black bg-opacity-50 px-3 py-0.5 my-1 mx-1 rounded hover:bg-opacity-80 cursor-pointer">Send</div>
                    </div>
                </div>
                {this.state.statusMessage && (
                    <div
                        className={`px-3 py-1.5 text-xs font-medium flex items-center justify-between ${
                            this.state.statusType === 'success'
                                ? 'bg-green-700/80 text-white'
                                : 'bg-red-700/80 text-white'
                        }`}
                    >
                        <span>{this.state.statusMessage}</span>
                        <button
                            type="button"
                            onClick={() => this.setState({ statusMessage: null, statusType: null })}
                            className="ml-2 text-white/80 hover:text-white font-bold"
                        >
                            ✕
                        </button>
                    </div>
                )}
                <div className="relative flex-grow flex flex-col bg-ub-gedit-dark font-normal windowMainScreen">
                    <div className="absolute left-0 top-0 h-full px-2 bg-ub-gedit-darker"></div>
                    <div className="relative">
                        <input id="sender-name" className=" w-full text-ubt-gedit-orange focus:bg-ub-gedit-light outline-none font-medium text-sm pl-6 py-0.5 bg-transparent" placeholder="Your Email / Name :" spellCheck="false" autoComplete="off" type="text" />
                        <span className="absolute left-1 top-1/2 transform -translate-y-1/2 font-bold light text-sm text-ubt-gedit-blue">1</span>
                    </div>
                    <div className="relative">
                        <input id="sender-subject" className=" w-full my-1 text-ubt-gedit-blue focus:bg-ub-gedit-light gedit-subject outline-none text-sm font-normal pl-6 py-0.5 bg-transparent" placeholder="subject (may be a feedback for this website!)" spellCheck="false" autoComplete="off" type="text" />
                        <span className="absolute left-1 top-1/2 transform -translate-y-1/2 font-bold  text-sm text-ubt-gedit-blue">2</span>
                    </div>
                    <div className="relative flex-grow">
                        <textarea id="sender-message" className=" w-full gedit-message font-light text-sm resize-none h-full windowMainScreen outline-none tracking-wider pl-6 py-1 bg-transparent" placeholder="Message" spellCheck="false" autoComplete="none" type="text" />
                        <span className="absolute left-1 top-1 font-bold  text-sm text-ubt-gedit-blue">3</span>
                    </div>
                </div>
                {
                    (this.state.sending
                        ?
                        <div className="flex justify-center items-center animate-pulse h-full w-full bg-gray-400 bg-opacity-30 absolute top-0 left-0">
                            <img className={" w-8 absolute animate-spin"} src="./themes/Yaru/status/process-working-symbolic.svg" alt="Ubuntu Process Symbol" />
                        </div>
                        : null
                    )
                }
            </div>
        )
    }
}

export default Gedit;

export const displayGedit = (props) => {
    return <Gedit {...(props && typeof props === 'object' ? props : {})} />;
}
