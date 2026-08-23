import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { useChat } from '../context/ChatContext';

const MessageInput = () => {
  const { sendMessage, selectedChatId } = useChat();
  const [text, setText] = useState('');

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!text.trim() || !selectedChatId) return;
    const content = text.trim();
    setText('');
    await sendMessage(selectedChatId, content);
  };

  const handleKeyDown = async (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      await handleSend();
    }
  };

  return (
    <form className="messenger-input-area" onSubmit={handleSend}>
      <div className="messenger-composer">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Write a message... (Enter to send)"
          rows={1}
        />
        <button
          type="submit"
          className="messenger-send-btn"
          disabled={!text.trim() || !selectedChatId}
          aria-label="Send message"
        >
          <Send size={15} />
        </button>
      </div>
    </form>
  );
};

export default MessageInput;

