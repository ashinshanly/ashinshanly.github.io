import React, { Component } from 'react';
import { subscribeToShootingGame } from '../../lib/firebase/realtime';
import { updatePlayerPosition, registerShot, createShootingGame } from '../../lib/firebase/database';

export class ShootingGame extends Component {
    constructor() {
        super();
        this.state = {
            gameId: null,
            players: {},
            scores: {},
            currentPlayer: `player-${Math.random().toString(36).substr(2, 9)}`
        };
        this.canvasRef = React.createRef();
    }

    componentDidMount() {
        this.initGame();
        this.setupEventListeners();
        this.startGameLoop();
    }

    componentWillUnmount() {
        this.cleanup();
    }

    initGame = async () => {
        const gameId = 'game-' + Math.random().toString(36).substr(2, 9);
        await createShootingGame(gameId);
        
        this.unsubscribe = subscribeToShootingGame(gameId, (gameState) => {
            if (gameState) {
                this.setState({
                    players: gameState.players || {},
                    scores: gameState.scores || {}
                });
            }
        });

        this.setState({ gameId });
    }

    setupEventListeners = () => {
        document.addEventListener('keydown', this.handleMovement);
        if (this.canvasRef.current) {
            this.canvasRef.current.addEventListener('click', this.handleShot);
        }
    }

    handleMovement = (e) => {
        const { currentPlayer, players } = this.state;
        const currentPosition = players[currentPlayer] || { x: 100, y: 100, health: 100 };
        let newX = currentPosition.x;
        let newY = currentPosition.y;

        switch(e.key) {
            case 'ArrowLeft': newX -= 10; break;
            case 'ArrowRight': newX += 10; break;
            case 'ArrowUp': newY -= 10; break;
            case 'ArrowDown': newY += 10; break;
            default: return;
        }

        updatePlayerPosition(this.state.gameId, currentPlayer, {
            x: newX,
            y: newY,
            health: currentPosition.health
        });
    }

    handleShot = (e) => {
        const rect = this.canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        Object.entries(this.state.players).forEach(([playerId, player]) => {
            if (playerId !== this.state.currentPlayer) {
                if (this.checkCollision(x, y, player)) {
                    registerShot(this.state.gameId, this.state.currentPlayer, playerId);
                }
            }
        });
    }

    checkCollision = (x, y, player) => {
        return x >= player.x && 
               x <= player.x + 30 && 
               y >= player.y && 
               y <= player.y + 30;
    }

    startGameLoop = () => {
        const canvas = this.canvasRef.current;
        const ctx = canvas.getContext('2d');

        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            Object.entries(this.state.players).forEach(([playerId, player]) => {
                ctx.fillStyle = playerId === this.state.currentPlayer ? '#00ff00' : '#ff0000';
                ctx.fillRect(player.x, player.y, 30, 30);
                
                // Health bar
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(player.x, player.y - 10, 30 * (player.health / 100), 5);
            });

            requestAnimationFrame(render);
        };

        render();
    }

    cleanup = () => {
        document.removeEventListener('keydown', this.handleMovement);
        if (this.canvasRef.current) {
            this.canvasRef.current.removeEventListener('click', this.handleShot);
        }
        if (this.unsubscribe) {
            this.unsubscribe();
        }
    }

    render() {
        return (
            <div className="w-full h-full flex flex-col bg-ub-cool-grey text-white select-none">
                <div className="flex items-center justify-between p-2 bg-ub-warm-grey">
                    <span>Shooting Game</span>
                    <span>Game ID: {this.state.gameId}</span>
                </div>
                <div className="flex-grow relative">
                    <canvas 
                        ref={this.canvasRef}
                        width={800}
                        height={600}
                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black"
                    />
                </div>
                <div className="p-2 bg-ub-warm-grey">
                    <div>Scores: {JSON.stringify(this.state.scores)}</div>
                </div>
            </div>
        );
    }
}

export default ShootingGame;
