// src/firebaseAuth.js
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { firebaseApp, db } from './firebaseConfig';

const auth = getAuth(firebaseApp);

export const signUp = async (email, password) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  // Save user profile in Firestore
  await setDoc(doc(db, 'users', user.uid), {
    uid: user.uid,
    email: user.email.toLowerCase(),
    displayName: email.split('@')[0],
    createdAt: serverTimestamp(),
  }, { merge: true });
  
  try {
    await sendEmailVerification(user);
  } catch (err) {
    console.log('Verification email notice:', err);
  }
  return user;
};

export const signIn = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  // Ensure user profile in Firestore
  await setDoc(doc(db, 'users', user.uid), {
    uid: user.uid,
    email: user.email.toLowerCase(),
    displayName: email.split('@')[0],
    lastLogin: serverTimestamp(),
  }, { merge: true });
  return user;
};

export const signOutUser = async () => {
  await signOut(auth);
};

export const observeAuthState = (callback) => {
  return onAuthStateChanged(auth, callback);
};

