import React, { Component } from 'react';
import styles from '../../styles/shooting_game.module.scss'

export class ShootingGame extends Component {
    constructor(props) {
        super(props);

        // Game constants
        this.fps = 1000 / 30;
        this.rotateSpd = 4;
        this.fireInterval = 300;
        this.fireSpd = 0.15;
        this.zombieSpd = 0.025;
        this.zombieDelay = 2000;
        this.lifeCount = 3;
        this.screen = { width: 8, height: 8 };
        this.center = { x: 4, y: 4 };

        this.state = {
            time: performance.now(),
            holdLeft: false,
            holdRight: false,
            rotation: 0,
            lastFire: 0,
            summonSpd: 5000,
            summonTime: 0,
            turret: [],
            fires: [],
            zombies: [],
            life: this.lifeCount,
            score: 0,
            pause: true,
            showTitle: true,
            showTryAgain: false
        };
    }

    componentDidMount() {
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
        
        this.setState({
            turret: [{
                x: this.center.x - 0.4,
                y: this.center.y - 0.4
            }]
        });
    }

    componentWillUnmount() {
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('keyup', this.handleKeyUp);
        cancelAnimationFrame(this.gameLoop);
    }

    handleKeyDown = (evt) => {
        if (this.state.pause) return;

        if (evt.keyCode === 32) {
            if (this.state.lastFire === 0 || 
                (performance.now() - this.state.lastFire > this.fireInterval && 
                 this.state.fires.length < 2)) {
                this.setState({ lastFire: performance.now() });
                this.throwFire();
            }
        } else if (evt.keyCode === 37) {
            this.setState({ holdLeft: true });
        } else if (evt.keyCode === 39) {
            this.setState({ holdRight: true });
        }
    }

    handleKeyUp = (evt) => {
        if (evt.keyCode === 32 || evt.keyCode === 13) {
            if (this.state.showTitle) {
                if (!this.state.showTryAgain) {
                    this.setState({ 
                        showTitle: false,
                        pause: false 
                    }, this.animate);
                } else {
                    this.restartGame();
                }
            }
        } else if (evt.keyCode === 37) {
            this.setState({ holdLeft: false });
        } else if (evt.keyCode === 39) {
            this.setState({ holdRight: false });
        }
    }

    animate = () => {
        this.gameLoop = requestAnimationFrame(this.animate);
        
        if (this.state.pause) {
            cancelAnimationFrame(this.gameLoop);
            return;
        }

        if (performance.now() - this.state.time > this.fps) {
            this.setState({ time: performance.now() });
            this.animateRotation();
            this.animateFire();
            this.animateZombie();
            this.summonZombieTrigger();
        }
    }

    render() {
        return (
            <div className="w-full h-full flex flex-col bg-ub-cool-grey text-white select-none">
                <div className="flex items-center justify-between p-2 bg-ub-warm-grey">
                    <span>Shooting Game</span>
                    <span>Game ID: {this.state.gameId}</span>
                </div>
                <div id="example_game">
                    <div className="screen">
                        <canvas 
                            ref={this.canvasRef}
                            width={800}
                            height={600}
                            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                        />
                        <div className="turret">
                            <div className="gun"></div>
                            <div className="body"></div>
                        </div>
                        <div className="life">
                            {/* Add hearts here */}
                        </div>
                        <div className="score">
                            {/* Add score display here */}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    renderScore() {
        const score = this.state.scores[this.state.currentPlayer] || 0;
        return score.toString().split('').map((digit, i) => (
            <div key={i} className={`char-${digit}`}></div>
        ));
    }

    renderLives() {
        const health = this.state.players[this.state.currentPlayer]?.health || 100;
        const hearts = Math.ceil(health / 20); // 5 hearts total
        return Array(5).fill(0).map((_, i) => (
            <div key={i} className={`heart ${i < hearts ? 'full' : 'empty'}`}></div>
        ));
    }
    
    
}

export const displayShootingGame = () => {
    return <ShootingGame />;
}
