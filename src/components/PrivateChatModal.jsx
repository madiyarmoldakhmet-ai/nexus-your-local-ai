import React, { useState } from 'react';
import { X, MessageSquare, AlertCircle } from 'lucide-react';
import { useChat } from '../context/ChatContext';

const PrivateChatModal = ({ onClose }) => {
  const { createPrivateChatByEmail } = useChat();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e) => {
    if (e) e.preventDefault();
    if (!email.trim() || loading) return;
    setError('');
    setLoading(true);
    try {
      await createPrivateChatByEmail(email.trim());
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to start direct conversation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-content">
        <h2 className="modal-title">New Direct Chat</h2>
        <p style={{ color: 'var(--body)', fontSize: '14px', marginTop: '-12px', marginBottom: '20px' }}>
          Enter the registered user's email address to start messaging.
        </p>

        {error && (
          <div className="error-text" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertCircle size={15} /> {error}
          </div>
        )}

        <form onSubmit={handleCreate} className="auth-form">
          <label className="text-input">
            <span>Recipient Email</span>
            <input
              type="email"
              required
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
            />
          </label>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
            <button type="button" className="pill secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="pill primary" disabled={loading || !email.trim()}>
              {loading ? 'Searching...' : 'Start Chat'}
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

export default PrivateChatModal;

