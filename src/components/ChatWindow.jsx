import React, { useRef, useEffect } from 'react';
import { useChat } from '../context/ChatContext';
import './ChatWindow.css'; // optional styling

const ChatWindow = () => {
  const { messages, selectedChatId, chats, currentUser } = useChat();
  const containerRef = useRef(null);

  // Auto scroll to bottom on new messages
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  const chat = chats?.find((c) => c.id === selectedChatId);
  const title = chat?.isGroup ? chat.name : 'Private Chat';

  return (
    <div className="chat-window" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: '0.5rem', borderBottom: '1px solid #e0e0e0', background: '#fafafa' }}>
        <h4 style={{ margin: 0 }}>{title}</h4>
      </header>
      <div
        ref={containerRef}
        className="messages"
        style={{ flex: 1, overflowY: 'auto', padding: '0.5rem', background: '#fff' }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              marginBottom: '0.5rem',
              textAlign: msg.senderId === currentUser?.uid ? 'right' : 'left',
            }}
          >
            <span
              style={{
                display: 'inline-block',
                padding: '0.4rem 0.6rem',
                borderRadius: '0.8rem',
                background: msg.senderId === currentUser?.uid ? '#e6f7ff' : '#f0f0f0',
                maxWidth: '70%',
                wordBreak: 'break-word',
              }}
            >
              {msg.content}
            </span>
          </div>
        ))}
        {messages.length === 0 && <p style={{ color: '#888' }}>No messages yet.</p>}
      </div>
    </div>
  );
};

export default ChatWindow;
