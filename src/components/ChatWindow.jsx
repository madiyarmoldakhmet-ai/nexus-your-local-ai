import React, { useRef, useEffect } from 'react';
import { useChat } from '../context/ChatContext';
import { Users, User, Clock } from 'lucide-react';

const ChatWindow = () => {
  const { messages, selectedChatId, chats, currentUser, usersMap } = useChat();
  const containerRef = useRef(null);

  // Auto scroll to bottom on new messages
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  const chat = chats?.find((c) => c.id === selectedChatId);

  const getChatTitle = () => {
    if (!chat) return '';
    if (chat.isGroup) return chat.name || 'Group Conversation';
    const otherUid = chat.participants?.find((uid) => uid !== currentUser?.uid);
    if (otherUid && usersMap[otherUid]?.email) {
      return usersMap[otherUid].displayName || usersMap[otherUid].email;
    }
    const otherEmail = chat.participantEmails?.find((e) => e !== currentUser?.email?.toLowerCase());
    if (otherEmail) return otherEmail;
    return 'Direct Conversation';
  };

  const getSenderName = (senderId, senderEmail) => {
    if (senderId === currentUser?.uid) return 'You';
    if (usersMap[senderId]?.displayName) return usersMap[senderId].displayName;
    if (usersMap[senderId]?.email) return usersMap[senderId].email;
    if (senderEmail) return senderEmail;
    return 'Member';
  };

  const formatTime = (ts) => {
    if (!ts) return '';
    try {
      const date = ts.toDate ? ts.toDate() : new Date(ts);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="messenger-window">
      <header className="messenger-window-header">
        <div className="messenger-header-left">
          <div className="messenger-avatar">
            {chat?.isGroup ? <Users size={16} /> : <User size={16} />}
          </div>
          <div>
            <h4>{getChatTitle()}</h4>
            <span className="messenger-header-status">
              {chat?.isGroup ? `${chat.participants?.length || 0} participants` : 'Direct message'}
            </span>
          </div>
        </div>
      </header>

      <div ref={containerRef} className="messenger-messages-container">
        {messages.length === 0 ? (
          <div className="messenger-no-messages">
            <p>No messages yet. Send a greeting to start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMine = msg.senderId === currentUser?.uid;
            return (
              <div key={msg.id} className={`messenger-message-row ${isMine ? 'mine' : 'theirs'}`}>
                {!isMine && (
                  <div className="messenger-msg-avatar">
                    {(getSenderName(msg.senderId, msg.senderEmail)[0] || 'U').toUpperCase()}
                  </div>
                )}
                <div className="messenger-bubble-wrapper">
                  {!isMine && (
                    <span className="messenger-sender-label">
                      {getSenderName(msg.senderId, msg.senderEmail)}
                    </span>
                  )}
                  <div className="messenger-bubble">
                    <p>{msg.content}</p>
                  </div>
                  {msg.createdAt && (
                    <span className="messenger-time-label">
                      {formatTime(msg.createdAt)}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ChatWindow;

