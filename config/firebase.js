import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
    apiKey: "AIzaSyC3Br7iDX-2irFrN9dLE6vjtsuWFQzfo2U",
    authDomain: "portfolio-chess.firebaseapp.com",
    projectId: "portfolio-chess",
    storageBucket: "portfolio-chess.firebasestorage.app",
    messagingSenderId: "5157075220",
    appId: "1:5157075220:web:68efc5fed277db42f8ea01",
    measurementId: "G-NJVP8F749N"
  };


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database and get a reference to the service
export const db = getDatabase(app);

// Export the initialized app instance
export default app;