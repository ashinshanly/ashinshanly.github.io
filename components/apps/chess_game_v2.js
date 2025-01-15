import React, { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { db } from '../../config/firebase';
import { ref, onValue, set, get } from 'firebase/database';

//Do this next - Viewer count is not updating correctly. Everytime a piece movement is done, the viewer count is going to zero. Also play with computer and play online game states are not independent.

export function ChessGame() {
    const [game, setGame] = useState(new Chess());
    const [gameMode, setGameMode] = useState('home');
    const [gameId] = useState('shared-chess-game');
    const [playerColor, setPlayerColor] = useState('w');
    const [gameStatus, setGameStatus] = useState('');
    const [viewerCount, setViewerCount] = useState(0);

    useEffect(() => {
        if (gameMode === 'online') {
            const gameRef = ref(db, `games/${gameId}`);
            
            const fetchGameState = async () => {
                const snapshot = await get(gameRef);
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    const newGame = new Chess();
                    newGame.load(data.board);
                    setGame(newGame);
                    setGameStatus(`Current Turn: ${data.currentTurn === 'white' ? 'White' : 'Black'}`);
                }
            };
            
            fetchGameState();
    
            const unsubscribe = onValue(gameRef, (snapshot) => {
                const data = snapshot.val();
                if (data && data.board) {
                    const newGame = new Chess();
                    newGame.load(data.board);
                    setGame(newGame);
                    setGameStatus(`Current Turn: ${data.currentTurn === 'white' ? 'White' : 'Black'}`);
                }
            });
    
            return () => unsubscribe();
        } else if (gameMode === 'computer') {
            const newGame = new Chess();
            setGame(newGame);
            setPlayerColor('w');
        }
    }, [gameMode, gameId]);
    
    useEffect(() => {
        if (gameMode === 'computer' && game.turn() === 'b') {
            setTimeout(makeComputerMove, 500);
        }
    }, [game, gameMode]);

    useEffect(() => {
        if (gameMode === 'online') {
            const viewersRef = ref(db, `games/${gameId}/viewers`);
            const sessionId = Math.random().toString(36).substr(2, 9);
            
            // Add viewer
            set(ref(db, `games/${gameId}/viewers/${sessionId}`), true);
            
            // Remove viewer on disconnect
            onValue(viewersRef, (snapshot) => {
                if (snapshot.exists()) {
                    setViewerCount(Object.keys(snapshot.val()).length);
                } else {
                    setViewerCount(0);
                }
            });
    
            return () => {
                set(ref(db, `games/${gameId}/viewers/${sessionId}`), null);
            };
        }
    }, [gameMode, gameId]);
    
    useEffect(() => {
        if (game.isCheckmate()) {
            const winner = game.turn() === 'w' ? 'Black' : 'White';
            setGameStatus(`Checkmate! ${winner} wins!`);
        } else if (game.isStalemate()) {
            setGameStatus('Game drawn by stalemate');
        } else if (game.isInsufficientMaterial()) {
            setGameStatus('Game drawn by insufficient material');
        } else if (game.isThreefoldRepetition()) {
            setGameStatus('Game drawn by threefold repetition');
        }
    }, [game]);
    

    function makeComputerMove() {
        if (game.isGameOver() || game.turn() !== 'b') return;

        const possibleMoves = game.moves({ verbose: true });
        if (possibleMoves.length > 0) {
            const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
            const gameCopy = new Chess(game.fen());
            gameCopy.move(randomMove);
            setGame(gameCopy);
        }
    }

    function onDrop(sourceSquare, targetSquare) {
        // Prevent moves during computer's turn in computer mode
        if (gameMode === 'computer' && game.turn() !== playerColor) return false;
        
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
                        board: gameCopy.fen(),
                        currentTurn: gameCopy.turn() === 'w' ? 'white' : 'black',
                        gameStatus: gameCopy.isCheckmate() ? 'checkmate' : gameCopy.isCheck() ? 'check' : 'active'
                    });
                }
                
                if (gameCopy.isCheckmate()) {
                    const winner = gameCopy.turn() === 'w' ? 'Black' : 'White';
                    setGameStatus(`Checkmate! ${winner} wins!`);
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
        if (gameMode === 'online') {
            const gameRef = ref(db, `games/${gameId}`);
            set(gameRef, {
                board: newGame.fen(),
                currentTurn: 'white',
                gameStatus: 'active'
            });
        }
        setGame(newGame);
        setGameStatus('');
    };

    const startOnlineGame = () => {
        setGameMode('online');
        const gameRef = ref(db, `games/${gameId}`);
        
        get(gameRef).then((snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const newGame = new Chess();
                newGame.load(data.board);
                setGame(newGame);
            } else {
                // Only initialize a new game if no existing game is found
                const newGame = new Chess();
                set(gameRef, {
                    board: newGame.fen(),
                    currentTurn: 'white',
                    gameStatus: 'active'
                });
                setGame(newGame);
            }
        });
    };
    
     

    if (gameMode === 'home') {
        return (
            <div 
                className="w-full h-full flex flex-col items-center justify-center p-4 space-y-6"
                style={{
                    backgroundImage: "url('./themes/Yaru/apps/chess-bg.png')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                }}
            >
                <h1 className="text-3xl font-bold text-white mb-4 drop-shadow-lg">Chess Game</h1>
                <button 
                    onClick={() => setGameMode('computer')}
                    className="w-64 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-lg"
                >
                    Play Online vs Bot
                </button>
                <button 
                    onClick={startOnlineGame}
                    className="w-64 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow-lg"
                >
                    Play Online vs Random Player
                </button>
            </div>
        );
    }


    return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-800 p-4">
            <div className="mb-4 text-white text-xl">
                {gameMode === 'online' ? (
                    gameStatus
                ) : (
                    `Current Turn: ${game.turn() === 'w' ? 'White' : 'Black'}`
                )}
                {gameMode === 'computer' && (
                    <span className="ml-4">
                        {game.turn() === playerColor ? "Your turn" : "Computer thinking..."}
                    </span>
                )}
                {gameMode === 'online' && (
                    <div className="text-sm text-gray-300 mt-2 flex items-center justify-center">
                        👥 {viewerCount} {viewerCount === 1 ? 'viewer' : 'viewers'} online
                    </div>
                )}               
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
            
            {gameMode === 'online' && (
                <div className="mt-4 text-white">
                    Game ID: {gameId}
                </div>
            )}
        </div>
    );
}

export const displayChessGame = () => {
    return <ChessGame />;
}
