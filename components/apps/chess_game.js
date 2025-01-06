import React, { useState, useEffect } from 'react';
import { db } from '../../config/firebase';
import { subscribeToGame } from '../../lib/firebase/realtime';
import { createGame, updateGameState } from '../../lib/firebase/database';
import { isValidMove } from '../../lib/chess/validation';
import { isCheck, isCheckmate } from '../../lib/chess/moves';
import { getPieceColor } from '../../lib/chess/pieces';

const initialBoard = [
    ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
    ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
    Array(8).fill(null),
    Array(8).fill(null),
    Array(8).fill(null),
    Array(8).fill(null),
    ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
    ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
];

export function ChessGame() {
    const [gameState, setGameState] = useState({
        board: initialBoard,
        currentTurn: 'white',
        gameStatus: 'active'
    });
    const [selectedSquare, setSelectedSquare] = useState(null);
    const [gameId, setGameId] = useState(null);
    const [playerColor, setPlayerColor] = useState(null);

    useEffect(() => {
        const initGame = async () => {
            const urlGameId = window.location.hash.slice(1);
            const newGameId = urlGameId || Date.now().toString();
            setGameId(newGameId);
            
            if (!urlGameId) {
                await createGame(newGameId);
                setPlayerColor('white');
                window.location.hash = newGameId;
            } else {
                setPlayerColor('black');
            }

            const unsubscribe = subscribeToGame(newGameId, (gameData) => {
                if (gameData) setGameState(gameData);
            });

            return () => unsubscribe();
        };

        initGame();
    }, []);

    const handleSquareClick = async (x, y) => {
        if (gameState.gameStatus !== 'active') return;
        if (gameState.currentTurn !== playerColor) return;

        const clickedPiece = gameState.board[y][x];

        if (!selectedSquare) {
            if (clickedPiece && getPieceColor(clickedPiece) === playerColor) {
                setSelectedSquare({ x, y });
            }
            return;
        }

        if (selectedSquare.x !== x || selectedSquare.y !== y) {
            const piece = gameState.board[selectedSquare.y][selectedSquare.x];
            
            if (isValidMove(gameState.board, selectedSquare, { x, y }, piece)) {
                const newBoard = JSON.parse(JSON.stringify(gameState.board));
                newBoard[y][x] = piece;
                newBoard[selectedSquare.y][selectedSquare.x] = null;

                const nextTurn = playerColor === 'white' ? 'black' : 'white';
                let status = 'active';

                if (isCheck(newBoard, nextTurn)) {
                    if (isCheckmate(newBoard, nextTurn)) {
                        status = 'checkmate';
                    }
                }

                await updateGameState(gameId, {
                    board: newBoard,
                    currentTurn: nextTurn,
                    gameStatus: status
                });
            }
        }

        setSelectedSquare(null);
    };

    const resetGame = async () => {
        await updateGameState(gameId, {
            board: initialBoard,
            currentTurn: 'white',
            gameStatus: 'active'
        });
    };

    return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-800 p-4">
            <div className="mb-4 text-white text-xl">
                {gameState.gameStatus === 'active' 
                    ? `Current Turn: ${gameState.currentTurn}` 
                    : `Game Over - ${gameState.currentTurn === 'white' ? 'Black' : 'White'} Wins!`}
            </div>
            
            <div className="grid grid-cols-8 w-[560px] h-[560px] bg-gray-800">
                {gameState.board.map((row, y) => 
                    row.map((piece, x) => (
                        <div 
                            key={`${x}-${y}`}
                            className={`
                                w-[70px] h-[70px] 
                                flex items-center justify-center
                                ${(x + y) % 2 === 0 ? 'bg-white' : 'bg-gray-400'}
                                ${selectedSquare?.x === x && selectedSquare?.y === y ? 'bg-yellow-200' : ''}
                                cursor-pointer
                                border border-gray-600
                                transition-colors duration-200
                                hover:bg-yellow-100
                            `}
                            onClick={() => handleSquareClick(x, y)}
                        >
                            {piece && (
                                <span className="text-4xl select-none">
                                    {getPieceSymbol(piece)}
                                </span>
                            )}
                        </div>
                    ))
                )}
            </div>

            {gameState.gameStatus !== 'active' && (
                <button 
                    onClick={resetGame}
                    className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                    New Game
                </button>
            )}
            
            <div className="mt-4 text-white">
                Game ID: {gameId}
            </div>
        </div>
    );
}

function getPieceSymbol(piece) {
    const symbols = {
        'k': '♔', 'q': '♕', 'r': '♖', 'b': '♗', 'n': '♘', 'p': '♙',
        'K': '♚', 'Q': '♛', 'R': '♜', 'B': '♝', 'N': '♞', 'P': '♟'
    };
    return symbols[piece];
}

export const displayChessGame = () => {
    return <ChessGame />;
}
