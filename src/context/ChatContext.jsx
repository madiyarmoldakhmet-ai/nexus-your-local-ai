import React, { createContext, useContext, useEffect, useState } from 'react';
import { getFirestore, collection, query, where, onSnapshot, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useAuth } from './AuthContext';

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [messages, setMessages] = useState([]);

  // Load chats where the current user is a participant
  useEffect(() => {
    if (!user?.uid) {
      setChats([]);
      return;
    }
    const chatsRef = collection(db, 'chats');
    const q = query(chatsRef, where('participants', 'array-contains', user.uid));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setChats(data);
    });
    return () => unsub();
  }, [user]);

  // Load messages for the selected chat
  useEffect(() => {
    if (!selectedChatId) {
      setMessages([]);
      return;
    }
    const msgsRef = collection(db, `chats/${selectedChatId}/messages`);
    const q = query(msgsRef, orderBy('createdAt'));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMessages(data);
    });
    return () => unsub();
  }, [selectedChatId]);

  const createPrivateChat = async (otherUid) => {
    if (!user?.uid) return;
    const chatRef = await addDoc(collection(db, 'chats'), {
      isGroup: false,
      participants: [user.uid, otherUid],
      createdAt: serverTimestamp(),
    });
    setSelectedChatId(chatRef.id);
  };

  const createGroupChat = async (name) => {
    if (!user?.uid) return;
    const chatRef = await addDoc(collection(db, 'chats'), {
      isGroup: true,
      name,
      participants: [user.uid],
      createdAt: serverTimestamp(),
    });
    setSelectedChatId(chatRef.id);
  };

  const sendMessage = async (chatId, text) => {
    if (!user?.uid) return;
    const msgsCol = collection(db, `chats/${chatId}/messages`);
    await addDoc(msgsCol, {
      uid: user.uid,
      text,
      createdAt: serverTimestamp(),
    });
  };

  const value = {
    chats,
    selectedChatId,
    setSelectedChatId,
    messages,
    createPrivateChat,
    createGroupChat,
    sendMessage,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => useContext(ChatContext);
