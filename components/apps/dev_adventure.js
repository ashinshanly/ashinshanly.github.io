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
        if (e.code === 'Space' && !this.state.isJumping) {
            this.setState({ isJumping: true });
            this.velocity = this.jumpForce;
        }
    }

    updateGame = () => {
        this.setState(prevState => {
            const newY = prevState.playerPosition.y + this.velocity;
            this.velocity += this.gravity;

            // Ground collision
            if (newY >= 250) {
                this.velocity = 0;
                return {
                    playerPosition: { ...prevState.playerPosition, y: 250 },
                    isJumping: false
                };
            }

            return {
                playerPosition: { ...prevState.playerPosition, y: newY }
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
            </div>
        );
    }
}

export const displayDevAdventure = () => {
    return <DevAdventure />
}

