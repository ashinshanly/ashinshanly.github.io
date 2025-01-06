import React, { useState, useEffect } from 'react';
import { db } from '../../config/firebase';
import { subscribeToGame } from '../../lib/firebase/realtime';
import { createGame, updateGameState } from '../../lib/firebase/database';

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
    const [possibleMoves, setPossibleMoves] = useState([]);
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

    const getPieceColor = (piece) => {
        if (!piece) return null;
        return piece === piece.toLowerCase() ? 'black' : 'white';
    };

    const calculatePossibleMoves = (piece, startX, startY) => {
        const moves = [];
        const pieceType = piece.toLowerCase();
        const pieceColor = getPieceColor(piece);
        
        switch(pieceType) {
            case 'p': // Pawn
                const direction = pieceColor === 'black' ? 1 : -1;
                const startRow = pieceColor === 'black' ? 1 : 6;
                
                // Forward move
                if (!gameState.board[startY + direction]?.[startX]) {
                    moves.push([startX, startY + direction]);
                    // Initial two-square move
                    if (startY === startRow && !gameState.board[startY + 2 * direction]?.[startX]) {
                        moves.push([startX, startY + 2 * direction]);
                    }
                }
                
                // Captures
                [[startX - 1, startY + direction], [startX + 1, startY + direction]].forEach(([x, y]) => {
                    if (gameState.board[y]?.[x] && getPieceColor(gameState.board[y][x]) !== pieceColor) {
                        moves.push([x, y]);
                    }
                });
                break;
                
            case 'r': // Rook
                [[0, 1], [0, -1], [1, 0], [-1, 0]].forEach(([dx, dy]) => {
                    let x = startX + dx;
                    let y = startY + dy;
                    while (x >= 0 && x < 8 && y >= 0 && y < 8) {
                        if (!gameState.board[y][x]) {
                            moves.push([x, y]);
                        } else {
                            if (getPieceColor(gameState.board[y][x]) !== pieceColor) {
                                moves.push([x, y]);
                            }
                            break;
                        }
                        x += dx;
                        y += dy;
                    }
                });
                break;

            case 'n': // Knight
                [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]].forEach(([dx, dy]) => {
                    const x = startX + dx;
                    const y = startY + dy;
                    if (x >= 0 && x < 8 && y >= 0 && y < 8) {
                        if (!gameState.board[y][x] || getPieceColor(gameState.board[y][x]) !== pieceColor) {
                            moves.push([x, y]);
                        }
                    }
                });
                break;

            case 'b': // Bishop
                [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([dx, dy]) => {
                    let x = startX + dx;
                    let y = startY + dy;
                    while (x >= 0 && x < 8 && y >= 0 && y < 8) {
                        if (!gameState.board[y][x]) {
                            moves.push([x, y]);
                        } else {
                            if (getPieceColor(gameState.board[y][x]) !== pieceColor) {
                                moves.push([x, y]);
                            }
                            break;
                        }
                        x += dx;
                        y += dy;
                    }
                });
                break;

            case 'q': // Queen (combination of Rook and Bishop moves)
                [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]].forEach(([dx, dy]) => {
                    let x = startX + dx;
                    let y = startY + dy;
                    while (x >= 0 && x < 8 && y >= 0 && y < 8) {
                        if (!gameState.board[y][x]) {
                            moves.push([x, y]);
                        } else {
                            if (getPieceColor(gameState.board[y][x]) !== pieceColor) {
                                moves.push([x, y]);
                            }
                            break;
                        }
                        x += dx;
                        y += dy;
                    }
                });
                break;

            case 'k': // King
                [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]].forEach(([dx, dy]) => {
                    const x = startX + dx;
                    const y = startY + dy;
                    if (x >= 0 && x < 8 && y >= 0 && y < 8) {
                        if (!gameState.board[y][x] || getPieceColor(gameState.board[y][x]) !== pieceColor) {
                            moves.push([x, y]);
                        }
                    }
                });
                break;
        }
        
        return moves;
    };

    const handleSquareClick = (x, y) => {
        if (!selectedSquare) {
            // First click - select the piece
            const piece = gameState.board[y][x];
            if (piece) {
                setSelectedSquare({ x, y });
                const moves = calculatePossibleMoves(piece, x, y);
                setPossibleMoves(moves);
            }
        } else {
            // Second click - move the piece if it's a valid move
            const isValidMove = possibleMoves.some(([moveX, moveY]) => moveX === x && moveY === y);
            
            if (isValidMove) {
                const newBoard = JSON.parse(JSON.stringify(gameState.board));
                // Move the piece
                newBoard[y][x] = gameState.board[selectedSquare.y][selectedSquare.x];
                newBoard[selectedSquare.y][selectedSquare.x] = null;
                
                // Update the game state
                setGameState(prevState => ({
                    ...prevState,
                    board: newBoard,
                    currentTurn: prevState.currentTurn === 'white' ? 'black' : 'white'
                }));
            }
            
            // Reset selection
            setSelectedSquare(null);
            setPossibleMoves([]);
        }
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
                {`Current Turn: ${gameState.currentTurn}`}
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
                                ${possibleMoves.some(([moveX, moveY]) => moveX === x && moveY === y) ? 'bg-green-200' : ''}
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
