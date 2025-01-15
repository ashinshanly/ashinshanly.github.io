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
            fires: [],
            zombies: [],
            life: 3,
            score: 0,
            pause: true,
            showTitle: true,
            showTryAgain: false
        };
        this.canvasRef = React.createRef();
        this.gameLoop = null;
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
        if (canvas) {
            canvas.width = canvas.parentElement.clientWidth;
            canvas.height = canvas.parentElement.clientHeight;
        }
    }

    handleKeyDown = (evt) => {
        if (this.state.pause) {
            if (evt.keyCode === 32 || evt.keyCode === 13) {
                this.startGame();
            }
            return;
        }

        if (evt.keyCode === 32) {
            if (this.state.lastFire === 0 || 
                (performance.now() - this.state.lastFire > 300 && 
                 this.state.fires.length < 3)) {
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
        if (evt.keyCode === 37) {
            this.setState({ holdLeft: false });
        } else if (evt.keyCode === 39) {
            this.setState({ holdRight: false });
        }
    }

    startGame = () => {
        this.setState({
            time: performance.now(),
            holdLeft: false,
            holdRight: false,
            rotation: 0,
            lastFire: 0,
            summonSpd: 5000,
            summonTime: 0,
            fires: [],
            zombies: [],
            life: 3,
            score: 0,
            pause: false,
            showTitle: false,
            showTryAgain: false
        }, this.animate);
    }

    animate = () => {
        const now = performance.now();
        const deltaTime = now - this.state.time;

        if (this.state.holdLeft) {
            this.setState(prev => ({ rotation: Math.max(prev.rotation - 3, -60) }));
        }
        if (this.state.holdRight) {
            this.setState(prev => ({ rotation: Math.min(prev.rotation + 3, 60) }));
        }

        this.updateProjectiles();
        this.updateEnemies(now);
        this.checkCollisions();
        this.setState({ time: now });

        if (!this.state.pause) {
            requestAnimationFrame(this.animate);
        }
    }

    updateProjectiles = () => {
        this.setState(prev => ({
            fires: prev.fires.map(fire => ({
                x: fire.x + Math.sin(fire.angle * Math.PI / 180) * 8,
                y: fire.y - Math.cos(fire.angle * Math.PI / 180) * 8,
                angle: fire.angle
            })).filter(fire => fire.y > 0 && fire.y < this.canvasRef.current.height)
        }));
    }

    updateEnemies = (now) => {
        if (now - this.state.summonTime > this.state.summonSpd) {
            const canvas = this.canvasRef.current;
            const newZombie = {
                x: Math.random() * canvas.width,
                y: 0,
                speed: 2 + Math.random() * 2
            };
            this.setState(prev => ({
                zombies: [...prev.zombies, newZombie],
                summonTime: now,
                summonSpd: Math.max(prev.summonSpd * 0.95, 1000)
            }));
        }

        this.setState(prev => ({
            zombies: prev.zombies.map(zombie => ({
                ...zombie,
                y: zombie.y + zombie.speed
            }))
        }));
    }

    checkCollisions = () => {
        const { fires, zombies } = this.state;
        const canvas = this.canvasRef.current;

        fires.forEach(fire => {
            zombies.forEach(zombie => {
                const dx = fire.x - zombie.x;
                const dy = fire.y - zombie.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 25) {
                    this.setState(prev => ({
                        score: prev.score + 10,
                        fires: prev.fires.filter(f => f !== fire),
                        zombies: prev.zombies.filter(z => z !== zombie)
                    }));
                }
            });
        });

        zombies.forEach(zombie => {
            if (zombie.y > canvas.height) {
                this.setState(prev => ({
                    life: prev.life - 1,
                    zombies: prev.zombies.filter(z => z !== zombie)
                }), () => {
                    if (this.state.life <= 0) {
                        this.setState({ 
                            pause: true,
                            showTitle: true,
                            showTryAgain: true
                        });
                    }
                });
            }
        });
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

        this.setState(prev => ({
            fires: [...prev.fires, newFire]
        }));
    }

    startGameLoop = () => {
        const canvas = this.canvasRef.current;
        const ctx = canvas.getContext('2d');
        
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;

        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw game elements
            this.drawTurret(ctx);
            this.drawProjectiles(ctx);
            this.drawEnemies(ctx);
            
            if (this.state.showTitle) {
                this.drawTitle(ctx);
            }

            this.gameLoop = requestAnimationFrame(render);
        };

        render();
    }

    drawTurret = (ctx) => {
        const canvas = this.canvasRef.current;
        const turretX = canvas.width / 2;
        const turretY = canvas.height - 60;

        ctx.save();
        ctx.translate(turretX, turretY);
        ctx.rotate(this.state.rotation * Math.PI / 180);
        
        // Draw cannon
        ctx.fillStyle = '#1bad00';
        ctx.fillRect(-5, -25, 10, 25);
        
        // Draw base
        ctx.beginPath();
        ctx.arc(0, 0, 20, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }

    drawProjectiles = (ctx) => {
        ctx.fillStyle = '#e41435';
        this.state.fires.forEach(fire => {
            ctx.beginPath();
            ctx.arc(fire.x, fire.y, 5, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    drawEnemies = (ctx) => {
        ctx.fillStyle = '#000000';
        this.state.zombies.forEach(zombie => {
            ctx.beginPath();
            ctx.arc(zombie.x, zombie.y, 15, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    drawTitle = (ctx) => {
        const canvas = this.canvasRef.current;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(
            this.state.showTryAgain ? 'Game Over! Press Space to Try Again' : 'Press Space to Start',
            canvas.width / 2,
            canvas.height / 2
        );
    }

    render() {
        return (
            <div className="w-full h-full flex flex-col bg-ub-cool-grey text-white select-none">
                <div className="flex items-center justify-between p-2 bg-ub-warm-grey">
                    <span>Shooting Game</span>
                    <span>Score: {this.state.score} | Lives: {this.state.life}</span>
                </div>
                <div className={styles.gameContainer}>
                    <canvas 
                        ref={this.canvasRef}
                        className="w-full h-full"
                    />
                </div>
            </div>
        );
    }
}

export const displayShootingGame = () => {
    return <ShootingGame />;
}

export default ShootingGame;
