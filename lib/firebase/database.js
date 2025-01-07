import { ref, set, get } from 'firebase/database';
import { db } from '../../config/firebase';


export const initialBoard = [
    ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
    ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
    Array(8).fill(null),
    Array(8).fill(null),
    Array(8).fill(null),
    Array(8).fill(null),
    ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
    ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
];

export const createGame = async (gameId) => {
  const gameRef = ref(db, `games/${gameId}`);
  await set(gameRef, {
    board: initialBoard,
    currentTurn: 'white',
    gameStatus: 'active'
  });
  //return gameId;
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
