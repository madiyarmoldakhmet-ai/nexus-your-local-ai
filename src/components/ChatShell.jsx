import React from 'react';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';
import MessageInput from './MessageInput';
import NewGroupModal from './NewGroupModal';
import PrivateChatModal from './PrivateChatModal';
import { useChat } from '../context/ChatContext';
import { X, MessageSquare, Plus } from 'lucide-react';

const ChatShell = ({ onClose }) => {
  const {
    selectedChatId,
    isNewGroupModalOpen,
    closeNewGroupModal,
    isPrivateChatModalOpen,
    closePrivateChatModal,
    openPrivateChatModal,
    currentUser,
  } = useChat();

  const isChatOpen = !!selectedChatId;

  return (
    <div className="messenger-workspace-overlay">
      <div className="messenger-workspace-container">
        <header className="messenger-main-nav">
          <div className="messenger-nav-brand">
            <span className="llama-mark small" aria-hidden="true">
              <span>◡</span>
              <i></i>
              <b></b>
            </span>
            <span>Nexus Messenger</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '13px', color: 'var(--mute)' }}>
              Logged in as <strong>{currentUser?.email}</strong>
            </span>
            <button className="icon-button" onClick={onClose} aria-label="Close Messenger">
              <X size={18} />
            </button>
          </div>
        </header>

        <div className="messenger-body">
          <ChatList />
          <div className="messenger-conversation-pane">
            {isChatOpen ? (
              <>
                <ChatWindow />
                <MessageInput />
              </>
            ) : (
              <div className="messenger-welcome-screen">
                <div className="llama-mark" style={{ marginBottom: '16px' }} />
                <h3>Select a conversation or start a new one</h3>
                <p>Private end-to-end cloud messaging synced via Firebase Firestore.</p>
                <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                  <button className="pill primary" onClick={openPrivateChatModal}>
                    <Plus size={15} /> Direct Message
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {isNewGroupModalOpen && <NewGroupModal onClose={closeNewGroupModal} />}
        {isPrivateChatModalOpen && <PrivateChatModal onClose={closePrivateChatModal} />}
      </div>
    </div>
  );
};

export default ChatShell;

