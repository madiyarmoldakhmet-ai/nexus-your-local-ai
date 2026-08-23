// src/firebaseMessaging.js
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { firebaseApp } from './firebaseConfig';

export const messaging = getMessaging(firebaseApp);

export const requestFCMToken = async (setTokenCallback) => {
  try {
    const token = await getToken(messaging, {
      vapidKey: 'YOUR_PUBLIC_VAPID_KEY', // Replace with your VAPID key if needed
    });
    if (token) {
      setTokenCallback(token);
    }
  } catch (err) {
    console.error('FCM token error', err);
  }
};

export const onForegroundMessage = (handler) => {
  return onMessage(messaging, (payload) => {
    console.log('Message received.', payload);
    handler(payload);
  });
};
