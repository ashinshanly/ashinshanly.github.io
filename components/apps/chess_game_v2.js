import React, { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { db } from '../../config/firebase';
import { subscribeToGame } from '../../lib/firebase/realtime';
import { createGame, updateGameState } from '../../lib/firebase/database';

export function ChessGame() {
    const [game, setGame] = useState(new Chess());
    const [gameId, setGameId] = useState(null);

    useEffect(() => {
        const initGame = async () => {
            const fixedGameId = 'shared-chess-game';
            setGameId(fixedGameId);
            
            const gameData = await getGameState(fixedGameId);
            if (!gameData) {
                await createGame(fixedGameId);
            }
    
            const unsubscribe = subscribeToGame(fixedGameId, (gameData) => {
                if (gameData && gameData.fen) {
                    const newGame = new Chess();
                    newGame.load(gameData.fen);
                    setGame(newGame);
                }
            });
    
            return () => unsubscribe();
        };
    
        initGame();
    }, []);

    function makeMove(move) {
        const gameCopy = new Chess(game.fen());
        
        try {
            const result = gameCopy.move(move);
            if (result) {
                setGame(gameCopy);
                updateGameState(gameId, { 
                    fen: gameCopy.fen(),
                    isGameOver: gameCopy.isGameOver(),
                    turn: gameCopy.turn()
                });
                return true;
            }
        } catch (error) {
            return false;
        }
        return false;
    }

    function onDrop(sourceSquare, targetSquare) {
        const move = makeMove({
            from: sourceSquare,
            to: targetSquare,
            promotion: 'q'
        });

        return move;
    }

    const resetGame = async () => {
        const newGame = new Chess();
        setGame(newGame);
        await updateGameState(gameId, {
            fen: newGame.fen(),
            isGameOver: false,
            turn: 'w'
        });
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
            
            <div className="mt-4 text-white">
                Game ID: {gameId}
            </div>
        </div>
    );
}

export const displayChessGame = () => {
    return <ChessGame />;
}
