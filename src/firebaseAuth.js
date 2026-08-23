// src/firebaseAuth.js
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, onAuthStateChanged, signOut } from 'firebase/auth';
import { firebaseApp } from './firebaseConfig';

const auth = getAuth(firebaseApp);

export const signUp = async (email, password) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  await sendEmailVerification(userCredential.user);
  return userCredential.user;
};

export const signIn = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

export const signOutUser = async () => {
  await signOut(auth);
};

export const observeAuthState = (callback) => {
  return onAuthStateChanged(auth, callback);
};
