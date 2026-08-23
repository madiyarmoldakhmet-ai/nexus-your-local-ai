import React, { useState } from 'react';
import { useChat } from '../context/ChatContext';

const MessageInput = () => {
  const { sendMessage, selectedChatId } = useChat();
  const [text, setText] = useState('');

  const handleSend = async () => {
    if (!text.trim() || !selectedChatId) return;
    await sendMessage(selectedChatId, text.trim());
    setText('');
  };

  const handleKeyPress = async (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      await handleSend();
    }
  };

  return (
    <div style={{ display: 'flex', padding: '0.5rem', borderTop: '1px solid #e0e0e0' }}>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Type a message..."
        rows={1}
        style={{ flex: 1, resize: 'none', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
      />
      <button
        onClick={handleSend}
        style={{ marginLeft: '0.5rem', padding: '0.5rem 1rem', background: '#000', color: '#fff', border: 'none', borderRadius: '9999px' }}
      >
        Send
      </button>
    </div>
  );
};

export default MessageInput;
