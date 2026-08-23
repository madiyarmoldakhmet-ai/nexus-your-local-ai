import React from 'react';
import { useChat } from '../context/ChatContext';
import './ChatList.css'; // optional styling

const ChatList = () => {
  const { chats, selectedChatId, selectChat } = useChat();

  return (
    <div className="chat-list" style={{ width: '250px', borderRight: '1px solid #e0e0e0', overflowY: 'auto' }}>
      <h3 style={{ padding: '0.5rem', margin: 0, background: '#f5f5f5' }}>Chats</h3>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {chats.map((chat) => (
          <li
            key={chat.id}
            onClick={() => selectChat(chat.id)}
            style={{
              padding: '0.75rem',
              cursor: 'pointer',
              background: chat.id === selectedChatId ? '#e6f7ff' : 'transparent',
            }}
          >
            {chat.isGroup ? chat.name : chat.participants?.join(', ')}
          </li>
        ))}
        {chats.length === 0 && <li style={{ padding: '0.75rem' }}>No chats yet.</li>}
      </ul>
    </div>
  );
};

export default ChatList;
