import React, { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { db } from '../../config/firebase';
import { ref, onValue, set } from 'firebase/database';

export function ChessGame() {
    const [game, setGame] = useState(new Chess());
    const [gameId] = useState('shared-chess-game');

    useEffect(() => {
        // Set up real-time listener
        const gameRef = ref(db, `games/${gameId}`);
        const unsubscribe = onValue(gameRef, (snapshot) => {
            const data = snapshot.val();
            if (data && data.fen) {
                const newGame = new Chess();
                newGame.load(data.fen);
                setGame(newGame);
            }
        });

        // Initialize game if it doesn't exist
        set(gameRef, {
            fen: game.fen(),
            lastMove: Date.now()
        });

        return () => unsubscribe();
    }, []);

    function onDrop(sourceSquare, targetSquare) {
        const gameCopy = new Chess(game.fen());
        
        try {
            const move = gameCopy.move({
                from: sourceSquare,
                to: targetSquare,
                promotion: 'q'
            });

            if (move) {
                // Update Firebase immediately after valid move
                const gameRef = ref(db, `games/${gameId}`);
                set(gameRef, {
                    fen: gameCopy.fen(),
                    lastMove: Date.now()
                });
                
                setGame(gameCopy);
                return true;
            }
        } catch (error) {
            return false;
        }
        return false;
    }

    const resetGame = () => {
        const newGame = new Chess();
        const gameRef = ref(db, `games/${gameId}`);
        set(gameRef, {
            fen: newGame.fen(),
            lastMove: Date.now()
        });
        setGame(newGame);
    };

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

            <button 
                onClick={resetGame}
                className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
                New Game
            </button>
        </div>
    );
}

export const displayChessGame = () => {
    return <ChessGame />;
}
