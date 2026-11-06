import { ref, get, update } from 'firebase/database';
import { db } from '../../config/firebase';

const INITIAL_BOARD_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export const createGame = async (gameId, initialBoard = INITIAL_BOARD_FEN) => {
  if (!db) return gameId;
  const gameRef = ref(db, `games/${gameId}`);
  await update(gameRef, {
    board: initialBoard,
    currentTurn: 'white',
    gameStatus: 'active'
  });
  return gameId;
};

export const updateGameState = async (gameId, gameState) => {
  if (!db) return;
  const gameRef = ref(db, `games/${gameId}`);
  await update(gameRef, gameState);
};

export const getGameState = async (gameId) => {
  if (!db) return null;
  const gameRef = ref(db, `games/${gameId}`);
  const snapshot = await get(gameRef);
  return snapshot.val();
};
