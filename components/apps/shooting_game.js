import React, { Component } from 'react';
import styles from '../../styles/shooting_game.module.scss';

export class ShootingGame extends Component {
    constructor() {
        super();
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
            life: 3,
            score: 0,
            pause: true,
            showTitle: true,
            showTryAgain: false
        };
        this.canvasRef = React.createRef();
    }

    componentDidMount() {
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
        this.startGameLoop();
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
                (performance.now() - this.state.lastFire > 300 && 
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

    startGameLoop = () => {
        const canvas = this.canvasRef.current;
        const ctx = canvas.getContext('2d');

        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw turret
            ctx.fillStyle = '#00ff00';
            ctx.fillRect(385, 285, 30, 30);

            requestAnimationFrame(render);
        };

        render();
    }

    renderScore() {
        return this.state.score.toString().split('').map((digit, i) => (
            <div key={i} className={styles[`char-${digit}`]}></div>
        ));
    }

    renderLives() {
        return Array(this.state.life).fill(0).map((_, i) => (
            <div key={i} className={`${styles.heart} ${styles.full}`}></div>
        ));
    }

    render() {
        return (
            <div className="w-full h-full flex flex-col bg-ub-cool-grey text-white select-none">
                <div className="flex items-center justify-between p-2 bg-ub-warm-grey">
                    <span>Shooting Game</span>
                </div>
                <div className={styles.example_game}>
                    <div className={styles.screen}>
                        <canvas 
                            ref={this.canvasRef}
                            width={800}
                            height={600}
                            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                        />
                        <div className={styles.turret}>
                            <div className={styles.gun}></div>
                            <div className={styles.body}></div>
                        </div>
                        <div className={styles.life}>
                            {this.renderLives()}
                        </div>
                        <div className={styles.score}>
                            {this.renderScore()}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export const displayShootingGame = () => {
    return <ShootingGame />;
}

export default ShootingGame;
