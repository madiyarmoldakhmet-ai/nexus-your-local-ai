import React, { useState } from 'react';
import { X, Users, AlertCircle } from 'lucide-react';
import { useChat } from '../context/ChatContext';

const NewGroupModal = ({ onClose }) => {
  const { createGroupChat } = useChat();
  const [name, setName] = useState('');
  const [members, setMembers] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e) => {
    if (e) e.preventDefault();
    if (!name.trim() || loading) return;
    const memberEmails = members.split(/[,;\n]+/).map((e) => e.trim()).filter(Boolean);
    setError('');
    setLoading(true);
    try {
      await createGroupChat(name.trim(), memberEmails);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-content">
        <h2 className="modal-title">Create Group Chat</h2>
        <p style={{ color: 'var(--body)', fontSize: '14px', marginTop: '-12px', marginBottom: '20px' }}>
          Create a collaboration channel with multiple members.
        </p>

        {error && (
          <div className="error-text" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertCircle size={15} /> {error}
          </div>
        )}

        <form onSubmit={handleCreate} className="auth-form">
          <label className="text-input">
            <span>Group Name</span>
            <input
              type="text"
              placeholder="e.g. AI Engineering Core"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </label>

          <label className="text-input">
            <span>Member Emails (comma separated)</span>
            <textarea
              placeholder="alex@example.com, john@example.com"
              value={members}
              onChange={(e) => setMembers(e.target.value)}
              rows={3}
              style={{
                borderRadius: '12px',
                border: '1px solid var(--hairline-strong)',
                background: 'var(--soft)',
                color: 'var(--ink)',
                padding: '10px 14px',
                fontFamily: 'inherit',
                fontSize: '14px',
                resize: 'none',
                outline: 'none',
              }}
            />
          </label>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
            <button type="button" className="pill secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="pill primary" disabled={loading || !name.trim()}>
              {loading ? 'Creating...' : 'Create Group'}
            </button>
          </div>
        </form>

        <button type="button" className="icon-button close-modal" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

export default NewGroupModal;

