import { ref, onValue } from 'firebase/database';
import { db } from '../../config/firebase';

export const subscribeToGame = (gameId, callback) => {
  const gameRef = ref(db, `games/${gameId}`);
  return onValue(gameRef, (snapshot) => {
    callback(snapshot.val());
  });
};

