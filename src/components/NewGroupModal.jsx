import React, { useState } from 'react';
import { useChat } from '../context/ChatContext';

const NewGroupModal = ({ onClose }) => {
  const { createGroupChat } = useChat();
  const [name, setName] = useState('');
  const [members, setMembers] = useState(''); // comma-separated UIDs

  const handleCreate = async () => {
    if (!name.trim()) return;
    const memberUids = members.split(',').map((uid) => uid.trim()).filter(Boolean);
    await createGroupChat(name.trim(), memberUids);
    onClose();
  };

  return (
    <div
      className="modal-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        className="modal"
        style={{
          background: '#fff',
          padding: '1rem',
          borderRadius: '8px',
          width: '320px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
        }}
      >
        <h3 style={{ marginTop: 0 }}>Create Group Chat</h3>
        <input
          type="text"
          placeholder="Group name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ width: '100%', marginBottom: '0.5rem', padding: '0.4rem' }}
        />
        <textarea
          placeholder="Member UIDs (comma separated)"
          value={members}
          onChange={(e) => setMembers(e.target.value)}
          rows={3}
          style={{ width: '100%', marginBottom: '0.5rem', padding: '0.4rem' }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ marginRight: '0.5rem' }}>
            Cancel
          </button>
          <button onClick={handleCreate} style={{ background: '#4a90e2', color: '#fff', border: 'none', borderRadius: '4px', padding: '0.4rem 0.8rem' }}>
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewGroupModal;
