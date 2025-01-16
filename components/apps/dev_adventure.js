//Dev In-Progress

import React, { Component } from 'react';

export class DevAdventure extends Component {
    constructor() {
        super();
        this.state = {
            playerPosition: { x: 50, y: 0 },
            isJumping: false,
            score: 0,
            collectibles: [
                { type: 'React', x: 200, y: 150, collected: false },
                { type: 'Node.js', x: 400, y: 100, collected: false },
                { type: 'JavaScript', x: 600, y: 200, collected: false }
            ],
            obstacles: [
                { x: 300, y: 250 },
                { x: 500, y: 250 },
            ],
            gameOver: false
        };
        this.gameLoop = null;
        this.gravity = 0.5;
        this.jumpForce = -10;
        this.velocity = 0;
    }
    
    componentDidMount() {
        document.addEventListener('keydown', this.handleKeyPress);
        this.gameLoop = setInterval(this.updateGame, 20);
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.handleKeyPress);
        clearInterval(this.gameLoop);
    }

    handleKeyPress = (e) => {
        if (this.state.gameOver) return;
    
        switch(e.code) {
            case 'Space':
                if (!this.state.isJumping) {
                    this.setState({ isJumping: true });
                    this.velocity = this.jumpForce;
                }
                break;
            case 'ArrowLeft':
                this.setState(prevState => ({
                    playerPosition: {
                        ...prevState.playerPosition,
                        x: Math.max(0, prevState.playerPosition.x - 10)
                    }
                }));
                break;
            case 'ArrowRight':
                this.setState(prevState => ({
                    playerPosition: {
                        ...prevState.playerPosition,
                        x: Math.min(window.innerWidth - 40, prevState.playerPosition.x + 10)
                    }
                }));
                break;
        }
    }
    

    updateGame = () => {
        this.setState(prevState => {
            const newY = prevState.playerPosition.y + this.velocity;
            this.velocity += this.gravity;
    
            // Check collectible collisions
            const updatedCollectibles = prevState.collectibles.map(item => {
                if (!item.collected &&
                    Math.abs(prevState.playerPosition.x - item.x) < 30 &&
                    Math.abs(prevState.playerPosition.y - item.y) < 30) {
                    return { ...item, collected: true };
                }
                return item;
            });
    
            // Check obstacle collisions
            const hitObstacle = prevState.obstacles.some(obstacle =>
                Math.abs(prevState.playerPosition.x - obstacle.x) < 30 &&
                Math.abs(prevState.playerPosition.y - obstacle.y) < 30
            );
    
            if (hitObstacle) {
                return { ...prevState, gameOver: true };
            }
    
            // Ground collision
            if (newY >= 250) {
                this.velocity = 0;
                return {
                    playerPosition: { ...prevState.playerPosition, y: 250 },
                    isJumping: false,
                    collectibles: updatedCollectibles,
                    score: updatedCollectibles.filter(item => item.collected).length * 10
                };
            }
    
            return {
                playerPosition: { ...prevState.playerPosition, y: newY },
                collectibles: updatedCollectibles,
                score: updatedCollectibles.filter(item => item.collected).length * 10
            };
        });
    }
    
    render() {
        const { playerPosition, score, gameOver } = this.state;
        
        return (
            <div className="w-full h-full bg-ub-cool-grey relative overflow-hidden">
                <div className="absolute top-4 left-4 text-white text-xl">
                    Score: {score}
                </div>
                
                {/* Player */}
                <div 
                    className="absolute w-10 h-10 bg-ub-orange rounded"
                    style={{
                        left: `${playerPosition.x}px`,
                        top: `${playerPosition.y}px`
                    }}
                />

                {/* Ground */}
                <div className="absolute bottom-0 w-full h-16 bg-ub-grey" />

                {gameOver && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="text-white text-2xl">
                            Game Over! Score: {score}
                        </div>
                    </div>
                )}
                {/* Collectibles */}
                {this.state.collectibles.map((item, index) => (
                    !item.collected && (
                        <div
                            key={index}
                            className="absolute w-8 h-8 bg-blue-500 rounded-full"
                            style={{
                                left: `${item.x}px`,
                                top: `${item.y}px`
                            }}
                        >
                            <span className="text-xs text-white">{item.type}</span>
                        </div>
                    )
                ))}

                {/* Obstacles */}
                {this.state.obstacles.map((obstacle, index) => (
                    <div
                        key={index}
                        className="absolute w-12 h-20 bg-red-500"
                        style={{
                            left: `${obstacle.x}px`,
                            top: `${obstacle.y}px`
                        }}
                    />
                ))}

            </div>
        );
    }
}

export const displayDevAdventure = () => {
    return <DevAdventure />
}

