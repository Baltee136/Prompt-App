import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeFirestore } from 'firebase/firestore';

// 1. Go to https://console.firebase.google.com -> Create project
// 2. Project settings -> General -> Add app -> Web (</>) -> copy the config below
// 3. Build a Firestore Database (production mode) in the same project
// 4. Paste your real values here, or better: load from environment variables
//    using something like react-native-dotenv or expo-constants (see README).
const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_PROJECT_ID.firebaseapp.com',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_PROJECT_ID.appspot.com',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId: 'YOUR_APP_ID',
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Firestore has built-in offline persistence on React Native automatically
// (no extra config needed like on web), which backs up our manual cache layer.
const db = initializeFirestore(app, {});

export { app, db };
