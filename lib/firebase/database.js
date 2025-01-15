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

// Shooting game

export const createShootingGame = async (gameId) => {
  const gameRef = ref(db, `shooting_game/${gameId}`);
  await set(gameRef, {
    players: {},
    gameStatus: 'waiting',
    scores: {}
  });
  return gameId;
};

export const updatePlayerPosition = async (gameId, playerId, position) => {
  const playerRef = ref(db, `shooting_game/${gameId}/players/${playerId}`);
  await set(playerRef, {
    x: position.x,
    y: position.y,
    health: position.health
  });
};

export const registerShot = async (gameId, shooterId, targetId) => {
  const targetRef = ref(db, `shooting_game/${gameId}/players/${targetId}/health`);
  const scoreRef = ref(db, `shooting_game/${gameId}/scores/${shooterId}`);
  await set(targetRef, targetRef - 10);
  await set(scoreRef, scoreRef + 1);
};
