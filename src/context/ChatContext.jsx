import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, orderBy, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useAuth } from './AuthContext';

const ChatContext = createContext();

export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Listen to user's chats
  useEffect(() => {
    if (!user) return;
    const chatsRef = collection(db, 'chats');
    const q = query(chatsRef, where('participants', 'array-contains', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatList = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
      setChats(chatList);
      setLoading(false);
    });
    return unsubscribe;
  }, [user]);

  // Listen to messages of the selected chat
  useEffect(() => {
    if (!selectedChatId) {
      setMessages([]);
      return;
    }
    const messagesRef = collection(db, 'chats', selectedChatId, 'messages');
    const q = query(messagesRef, orderBy('createdAt'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
      setMessages(msgs);
    });
    return unsubscribe;
  }, [selectedChatId]);

  const sendMessage = useCallback(async (chatId, content) => {
    if (!user) return;
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    await addDoc(messagesRef, {
      senderId: user.uid,
      content,
      createdAt: serverTimestamp(),
    });
  }, [user]);

  const createPrivateChat = useCallback(async (otherUid) => {
    if (!user) return null;
    // Check for existing private chat between the two participants
    const existing = chats.find(
      (c) => !c.isGroup && c.participants.includes(otherUid) && c.participants.includes(user.uid)
    );
    if (existing) {
      setSelectedChatId(existing.id);
      return existing.id;
    }
    const chatDoc = await addDoc(collection(db, 'chats'), {
      participants: [user.uid, otherUid],
      isGroup: false,
      createdAt: serverTimestamp(),
    });
    setSelectedChatId(chatDoc.id);
    return chatDoc.id;
  }, [user, chats]);

  const createGroupChat = useCallback(async (name) => {
    if (!user) return null;
    const chatDoc = await addDoc(collection(db, 'chats'), {
      name,
      participants: [user.uid],
      isGroup: true,
      createdAt: serverTimestamp(),
    });
    setSelectedChatId(chatDoc.id);
    return chatDoc.id;
  }, [user]);

  const value = {
    chats,
    selectedChatId,
    setSelectedChatId,
    messages,
    sendMessage,
    createPrivateChat,
    createGroupChat,
    loading,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
