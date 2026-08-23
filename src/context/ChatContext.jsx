import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, doc, setDoc, addDoc, onSnapshot, query, where, orderBy, serverTimestamp, getDocs } from 'firebase/firestore';
import { useAuth } from './AuthContext';

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isNewGroupModalOpen, setIsNewGroupModalOpen] = useState(false);

  // Load chats for the current user
  useEffect(() => {
    if (!user) return;
    const chatsRef = collection(db, 'chats');
    const q = query(chatsRef, where('participants', 'array-contains', user.uid), orderBy('updatedAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setChats(data);
    });
    return () => unsub();
  }, [user]);

  // Load messages for the selected chat
  useEffect(() => {
    if (!selectedChatId) return;
    const msgsRef = collection(db, 'chats', selectedChatId, 'messages');
    const q = query(msgsRef, orderBy('createdAt'));
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMessages(data);
    });
    return () => unsub();
  }, [selectedChatId]);

  const selectChat = (chatId) => setSelectedChatId(chatId);

  const sendMessage = async (content) => {
    if (!selectedChatId || !user) return;
    const msgsRef = collection(db, 'chats', selectedChatId, 'messages');
    await addDoc(msgsRef, {
      senderId: user.uid,
      content,
      createdAt: serverTimestamp(),
    });
    // Update chat's last message preview and timestamp
    const chatDoc = doc(db, 'chats', selectedChatId);
    await setDoc(chatDoc, { lastMessage: content, updatedAt: serverTimestamp() }, { merge: true });
  };

  const createPrivateChat = async (otherUid) => {
    if (!user) return;
    // Check if chat already exists
    const chatsRef = collection(db, 'chats');
    const q = query(chatsRef, where('participants', 'array-contains', user.uid));
    const snapshot = await getDocs(q);
    const existing = snapshot.docs.find((d) => {
      const participants = d.data().participants;
      return participants.includes(otherUid) && participants.length === 2;
    });
    if (existing) return existing.id;
    const newChat = await addDoc(chatsRef, {
      participants: [user.uid, otherUid],
      isGroup: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return newChat.id;
  };

  const createGroupChat = async (name, memberUids) => {
    if (!user) return;
    const chatsRef = collection(db, 'chats');
    const newChat = await addDoc(chatsRef, {
      name,
      participants: [user.uid, ...memberUids],
      isGroup: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return newChat.id;
  };

  return (
    <ChatContext.Provider
      value={{
        chats,
        selectedChatId,
        messages,
        selectChat,
        sendMessage,
        createPrivateChat,
        createGroupChat,
        isNewGroupModalOpen,
        openNewGroupModal: () => setIsNewGroupModalOpen(true),
        closeNewGroupModal: () => setIsNewGroupModalOpen(false),
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
