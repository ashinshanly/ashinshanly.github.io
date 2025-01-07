import { ref, set, get } from 'firebase/database';
import { db } from '../../config/firebase';

export const createGame = async (gameId) => {
  const gameRef = ref(db, `games/${gameId}`);
  await set(gameRef, {
    board: initialBoard,
    currentTurn: 'white',
    gameStatus: 'active'
  });
  return gameId;
};

export const updateGameState = async (gameId, gameState) => {
  const gameRef = ref(db, `games/${gameId}`);
  await set(gameRef, gameState);
};

export const getGameState = async (gameId) => {
  const gameRef = ref(db, `games/${gameId}`);
  const snapshot = await get(gameRef);
  return snapshot.val();
};
