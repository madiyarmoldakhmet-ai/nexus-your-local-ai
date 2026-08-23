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
  const [usersMap, setUsersMap] = useState({});
  const [isNewGroupModalOpen, setIsNewGroupModalOpen] = useState(false);
  const [isPrivateChatModalOpen, setIsPrivateChatModalOpen] = useState(false);

  // Load all users to display friendly names and avatars
  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(collection(db, 'users'), (snapshot) => {
      const map = {};
      snapshot.docs.forEach((d) => {
        map[d.id] = d.data();
      });
      setUsersMap(map);
    });
    return () => unsub();
  }, [user]);

  // Load chats for the current user
  useEffect(() => {
    if (!user) return;
    const chatsRef = collection(db, 'chats');
    const q = query(chatsRef, where('participants', 'array-contains', user.uid), orderBy('updatedAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setChats(data);
    }, (err) => {
      console.warn('Chats snapshot warning (indexing or missing):', err);
      // Fallback query without sorting in case index is creating
      const fallbackQuery = query(chatsRef, where('participants', 'array-contains', user.uid));
      onSnapshot(fallbackQuery, (snapshot) => {
        const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setChats(data);
      });
    });
    return () => unsub();
  }, [user]);

  // Load messages for the selected chat
  useEffect(() => {
    if (!selectedChatId) return;
    const msgsRef = collection(db, 'chats', selectedChatId, 'messages');
    const q = query(msgsRef, orderBy('createdAt', 'asc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMessages(data);
    });
    return () => unsub();
  }, [selectedChatId]);

  const selectChat = (chatId) => setSelectedChatId(chatId);

  const sendMessage = async (chatId, content) => {
    const activeId = chatId || selectedChatId;
    if (!activeId || !user || !content.trim()) return;
    const msgsRef = collection(db, 'chats', activeId, 'messages');
    await addDoc(msgsRef, {
      senderId: user.uid,
      senderEmail: user.email,
      content: content.trim(),
      createdAt: serverTimestamp(),
    });
    // Update chat's last message preview and timestamp
    const chatDoc = doc(db, 'chats', activeId);
    await setDoc(chatDoc, {
      lastMessage: content.trim(),
      lastSenderId: user.uid,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  };

  const createPrivateChatByEmail = async (targetEmail) => {
    if (!user) throw new Error('You must be signed in.');
    const cleanEmail = targetEmail.trim().toLowerCase();
    if (cleanEmail === user.email.toLowerCase()) {
      throw new Error('You cannot start a direct chat with yourself.');
    }

    // Find target user by email
    const usersRef = collection(db, 'users');
    const uq = query(usersRef, where('email', '==', cleanEmail));
    const uSnap = await getDocs(uq);
    let targetUid = null;
    let targetData = null;

    if (!uSnap.empty) {
      targetUid = uSnap.docs[0].id;
      targetData = uSnap.docs[0].data();
    } else {
      // If user not registered in `users` collection yet, generate placeholder or error
      throw new Error(`User with email "${cleanEmail}" was not found. Ask them to sign in first.`);
    }

    // Check if chat already exists
    const chatsRef = collection(db, 'chats');
    const q = query(chatsRef, where('participants', 'array-contains', user.uid));
    const snapshot = await getDocs(q);
    const existing = snapshot.docs.find((d) => {
      const data = d.data();
      const p = data.participants || [];
      return !data.isGroup && p.includes(targetUid) && p.length === 2;
    });

    if (existing) {
      setSelectedChatId(existing.id);
      return existing.id;
    }

    const newChat = await addDoc(chatsRef, {
      participants: [user.uid, targetUid],
      participantEmails: [user.email.toLowerCase(), cleanEmail],
      isGroup: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    setSelectedChatId(newChat.id);
    return newChat.id;
  };

  const createGroupChat = async (name, memberEmails) => {
    if (!user || !name.trim()) return;
    const cleanEmails = memberEmails.map((e) => e.trim().toLowerCase()).filter(Boolean);
    const memberUids = [];

    for (const em of cleanEmails) {
      const uq = query(collection(db, 'users'), where('email', '==', em));
      const uSnap = await getDocs(uq);
      if (!uSnap.empty) {
        memberUids.push(uSnap.docs[0].id);
      }
    }

    const allUids = Array.from(new Set([user.uid, ...memberUids]));
    const chatsRef = collection(db, 'chats');
    const newChat = await addDoc(chatsRef, {
      name: name.trim(),
      participants: allUids,
      participantEmails: Array.from(new Set([user.email.toLowerCase(), ...cleanEmails])),
      isGroup: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    setSelectedChatId(newChat.id);
    return newChat.id;
  };

  return (
    <ChatContext.Provider
      value={{
        chats,
        selectedChatId,
        messages,
        usersMap,
        selectChat,
        sendMessage,
        createPrivateChatByEmail,
        createGroupChat,
        isNewGroupModalOpen,
        openNewGroupModal: () => setIsNewGroupModalOpen(true),
        closeNewGroupModal: () => setIsNewGroupModalOpen(false),
        isPrivateChatModalOpen,
        openPrivateChatModal: () => setIsPrivateChatModalOpen(true),
        closePrivateChatModal: () => setIsPrivateChatModalOpen(false),
        currentUser: user,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);

