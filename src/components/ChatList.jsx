import React from 'react';
import { useChat } from '../context/ChatContext';
import { MessageSquarePlus, Users, User } from 'lucide-react';

const ChatList = () => {
  const {
    chats,
    selectedChatId,
    selectChat,
    usersMap,
    currentUser,
    openPrivateChatModal,
    openNewGroupModal,
  } = useChat();

  const getChatTitle = (chat) => {
    if (chat.isGroup) return chat.name || 'Group Chat';
    const otherUid = chat.participants?.find((uid) => uid !== currentUser?.uid);
    if (otherUid && usersMap[otherUid]?.email) {
      return usersMap[otherUid].displayName || usersMap[otherUid].email;
    }
    const otherEmail = chat.participantEmails?.find((e) => e !== currentUser?.email?.toLowerCase());
    if (otherEmail) return otherEmail;
    return 'Direct Chat';
  };

  const getChatSubtitle = (chat) => {
    if (chat.lastMessage) return chat.lastMessage;
    if (chat.isGroup) return `${chat.participants?.length || 0} members`;
    return 'No messages yet';
  };

  return (
    <div className="messenger-sidebar">
      <div className="messenger-sidebar-header">
        <div>
          <h3>Messages</h3>
          <span className="messenger-count">{chats.length} conversations</span>
        </div>
        <div className="messenger-header-actions">
          <button
            className="icon-button"
            onClick={openPrivateChatModal}
            title="New Direct Message"
            aria-label="New Direct Message"
          >
            <User size={16} />
          </button>
          <button
            className="icon-button"
            onClick={openNewGroupModal}
            title="New Group Chat"
            aria-label="New Group Chat"
          >
            <Users size={16} />
          </button>
        </div>
      </div>

      <div className="messenger-chat-items">
        {chats.length === 0 ? (
          <div className="messenger-empty-state">
            <p>No conversations yet.</p>
            <button className="pill secondary" onClick={openPrivateChatModal} style={{ marginTop: '8px' }}>
              Start a chat
            </button>
          </div>
        ) : (
          chats.map((chat) => {
            const isSelected = chat.id === selectedChatId;
            const title = getChatTitle(chat);
            const sub = getChatSubtitle(chat);
            const initial = (title[0] || 'C').toUpperCase();

            return (
              <div
                key={chat.id}
                onClick={() => selectChat(chat.id)}
                className={`messenger-chat-row ${isSelected ? 'active' : ''}`}
              >
                <div className="messenger-row-avatar">
                  {chat.isGroup ? <Users size={15} /> : initial}
                </div>
                <div className="messenger-row-info">
                  <div className="messenger-row-title">{title}</div>
                  <div className="messenger-row-sub">{sub}</div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ChatList;

