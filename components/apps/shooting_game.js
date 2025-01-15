import React, { Component } from 'react';

export class ShootingGame extends Component {
    constructor() {
        super();
        this.state = {
            score: 0
        };
        this.canvasRef = React.createRef();
        this.bullets = [];
        this.enemies = [];
        this.player = {
            x: 0,
            y: 0,
            size: 20
        };
    }

    componentDidMount() {
        const canvas = this.canvasRef.current;
        this.ctx = canvas.getContext('2d');
        this.initGame();
        this.gameLoop();
        document.addEventListener('mousemove', this.handleMouseMove);
        canvas.addEventListener('click', this.handleShoot);
    }

    componentWillUnmount() {
        document.removeEventListener('mousemove', this.handleMouseMove);
        this.canvasRef.current.removeEventListener('click', this.handleShoot);
        cancelAnimationFrame(this.animationFrame);
    }

    initGame = () => {
        this.player.x = this.canvasRef.current.width / 2;
        this.player.y = this.canvasRef.current.height - 30;
        
        // Create initial enemies
        for (let i = 0; i < 5; i++) {
            this.enemies.push({
                x: Math.random() * (this.canvasRef.current.width - 20),
                y: Math.random() * 200,
                speed: 2 + Math.random() * 2
            });
        }
    }

    handleMouseMove = (e) => {
        const rect = this.canvasRef.current.getBoundingClientRect();
        this.player.x = e.clientX - rect.left;
    }

    handleShoot = () => {
        this.bullets.push({
            x: this.player.x,
            y: this.player.y,
            speed: 7
        });
    }

    updateGame = () => {
        // Update bullets
        this.bullets = this.bullets.filter(bullet => {
            bullet.y -= bullet.speed;
            return bullet.y > 0;
        });

        // Update enemies
        this.enemies = this.enemies.filter(enemy => {
            enemy.y += enemy.speed;
            
            // Check collision with bullets
            this.bullets.forEach((bullet, bulletIndex) => {
                if (this.checkCollision(bullet, enemy)) {
                    this.bullets.splice(bulletIndex, 1);
                    this.setState(prev => ({ score: prev.score + 10 }));
                    return false;
                }
            });

            if (enemy.y > this.canvasRef.current.height) {
                enemy.y = 0;
                enemy.x = Math.random() * (this.canvasRef.current.width - 20);
            }
            return true;
        });
    }

    checkCollision = (bullet, enemy) => {
        return Math.abs(bullet.x - enemy.x) < 20 && Math.abs(bullet.y - enemy.y) < 20;
    }

    drawGame = () => {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.canvasRef.current.width, this.canvasRef.current.height);

        // Draw player
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(this.player.x - 10, this.player.y, 20, 20);

        // Draw bullets
        ctx.fillStyle = '#ffff00';
        this.bullets.forEach(bullet => {
            ctx.fillRect(bullet.x - 2, bullet.y, 4, 10);
        });

        // Draw enemies
        ctx.fillStyle = '#ff0000';
        this.enemies.forEach(enemy => {
            ctx.fillRect(enemy.x, enemy.y, 20, 20);
        });
    }

    gameLoop = () => {
        this.updateGame();
        this.drawGame();
        this.animationFrame = requestAnimationFrame(this.gameLoop);
    }

    render() {
        return (
            <div className="w-full h-full flex flex-col bg-ub-cool-grey text-white select-none">
                <div className="flex items-center justify-between p-2 bg-ub-warm-grey">
                    <span>Space Shooter</span>
                    <span>Score: {this.state.score}</span>
                </div>
                <div className="flex-grow relative">
                    <canvas 
                        ref={this.canvasRef}
                        width={800}
                        height={600}
                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black"
                    />
                </div>
            </div>
        );
    }
}

export const displayShootingGame = () => {
    return <ShootingGame />;
}
