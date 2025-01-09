import React, { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { db } from '../../config/firebase';
import { ref, onValue, set } from 'firebase/database';

export function ChessGame() {
    const [game, setGame] = useState(new Chess());
    const [gameMode, setGameMode] = useState('home'); // 'home', 'computer', 'online'
    const [gameId] = useState('shared-chess-game');

    useEffect(() => {
        if (gameMode === 'online') {
            const gameRef = ref(db, `games/${gameId}`);
            const unsubscribe = onValue(gameRef, (snapshot) => {
                const data = snapshot.val();
                if (data && data.fen) {
                    const newGame = new Chess();
                    newGame.load(data.fen);
                    setGame(newGame);
                }
            });

            set(gameRef, {
                fen: game.fen(),
                lastMove: Date.now()
            });

            return () => unsubscribe();
        }
    }, [gameMode]);

    function makeComputerMove() {
        const gameCopy = new Chess(game.fen());
        const moves = gameCopy.moves();
        
        if (moves.length > 0) {
            const move = moves[Math.floor(Math.random() * moves.length)];
            gameCopy.move(move);
            setGame(gameCopy);
        }
    }

    function onDrop(sourceSquare, targetSquare) {
        const gameCopy = new Chess(game.fen());
        
        try {
            const move = gameCopy.move({
                from: sourceSquare,
                to: targetSquare,
                promotion: 'q'
            });

            if (move) {
                setGame(gameCopy);
                
                if (gameMode === 'online') {
                    const gameRef = ref(db, `games/${gameId}`);
                    set(gameRef, {
                        fen: gameCopy.fen(),
                        lastMove: Date.now()
                    });
                } else if (gameMode === 'computer') {
                    setTimeout(makeComputerMove, 250);
                }
                return true;
            }
        } catch (error) {
            return false;
        }
        return false;
    }

    const resetGame = () => {
        const newGame = new Chess();
        setGame(newGame);
        if (gameMode === 'online') {
            const gameRef = ref(db, `games/${gameId}`);
            set(gameRef, {
                fen: newGame.fen(),
                lastMove: Date.now()
            });
        }
    };

    if (gameMode === 'home') {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-800 p-4 space-y-6">
                <h1 className="text-3xl font-bold text-white mb-4">Chess Game</h1>
                <button 
                    onClick={() => setGameMode('computer')}
                    className="w-64 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                    Play vs Computer
                </button>
                <button 
                    onClick={() => setGameMode('online')}
                    className="w-64 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                    Play Online
                </button>
            </div>
        );
    }

    return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-800 p-4">
            <div className="mb-4 text-white text-xl">
                {`Current Turn: ${game.turn() === 'w' ? 'White' : 'Black'}`}
            </div>
            
            <div className="w-[560px]">
                <Chessboard 
                    position={game.fen()}
                    onPieceDrop={onDrop}
                    boardWidth={560}
                    customBoardStyle={{
                        borderRadius: '4px',
                        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.5)'
                    }}
                />
            </div>

            <div className="mt-4 space-x-4">
                <button 
                    onClick={resetGame}
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                    New Game
                </button>
                <button 
                    onClick={() => setGameMode('home')}
                    className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                    Back to Menu
                </button>
            </div>
        </div>
    );
}

export const displayChessGame = () => {
    return <ChessGame />;
}
