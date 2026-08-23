// src/firebaseConfig.js
// Replace placeholder values with your Firebase project credentials.
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: "AIzaSyCUawwqj-pnaQzpjzGL3AsDorG9y7Ci4Ns",
  authDomain: "nexus-ai-3bbba.firebaseapp.com",
  projectId: "nexus-ai-3bbba",
  storageBucket: "nexus-ai-3bbba.firebasestorage.app",
  messagingSenderId: "23644631447",
  appId: "1:23644631447:web:c0bbf00dbf276885e8d4d2",
  measurementId: "G-77DBKKVYM1"
};

export const firebaseApp = initializeApp(firebaseConfig);
export const db = getFirestore(firebaseApp);
