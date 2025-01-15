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
        window.addEventListener('resize', this.handleResize);
        this.startGameLoop();
    }

    componentWillUnmount() {
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('keyup', this.handleKeyUp);
        window.removeEventListener('resize', this.handleResize);
        cancelAnimationFrame(this.gameLoop);
    }

    handleResize = () => {
        const canvas = this.canvasRef.current;
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
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
        
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;

        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            const turretX = canvas.width / 2 - 15;
            const turretY = canvas.height - 60;
            
            // Draw turret base
            ctx.fillStyle = '#1bad00';
            ctx.beginPath();
            ctx.arc(turretX + 15, turretY + 15, 20, 0, Math.PI * 2);
            ctx.fill();

            // Draw turret cannon
            ctx.save();
            ctx.translate(turretX + 15, turretY + 15);
            ctx.rotate(this.state.rotation * Math.PI / 180);
            ctx.fillRect(-5, -25, 10, 25);
            ctx.restore();

            // Draw projectiles
            this.state.fires.forEach(fire => {
                ctx.fillStyle = '#e41435';
                ctx.beginPath();
                ctx.arc(fire.x, fire.y, 5, 0, Math.PI * 2);
                ctx.fill();
            });

            // Draw enemies
            this.state.zombies.forEach(zombie => {
                ctx.fillStyle = '#000000';
                ctx.beginPath();
                ctx.arc(zombie.x, zombie.y, 15, 0, Math.PI * 2);
                ctx.fill();
            });

            this.gameLoop = requestAnimationFrame(render);
        };

        render();
    }

    throwFire = () => {
        const canvas = this.canvasRef.current;
        const turretX = canvas.width / 2;
        const turretY = canvas.height - 60;
        
        const newFire = {
            x: turretX,
            y: turretY,
            angle: this.state.rotation
        };

        this.setState(prevState => ({
            fires: [...prevState.fires, newFire]
        }));
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
                            className="absolute top-0 left-0 w-full h-full"
                        />
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
