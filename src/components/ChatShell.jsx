import React from 'react';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';
import MessageInput from './MessageInput';
import NewGroupModal from './NewGroupModal';
import { useChat } from '../context/ChatContext';

const ChatShell = () => {
  const { selectedChatId, isNewGroupModalOpen, openNewGroupModal, closeNewGroupModal } = useChat();
  const isChatOpen = !!selectedChatId;

  return (
    <div className="chat-shell" style={{ display: 'flex', height: '100%' }}>
      <ChatList />
      {isChatOpen ? (
        <div className="chat-main" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <ChatWindow />
          <MessageInput />
        </div>
      ) : (
        <div className="chat-welcome" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p>Select or create a chat to start messaging.</p>
        </div>
      )}
      <button onClick={openNewGroupModal} style={{ position: 'absolute', top: 10, right: 10 }}>
        New Group
      </button>
      {isNewGroupModalOpen && <NewGroupModal onClose={closeNewGroupModal} />}
    </div>
  );
};

export default ChatShell;
