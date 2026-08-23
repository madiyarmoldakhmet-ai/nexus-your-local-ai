import React, { useState } from 'react';
import { X } from 'lucide-react';
import { signUp, signIn } from '../firebaseAuth';
import { useAuth } from '../context/AuthContext';

const AuthModal = ({ onClose }) => {
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (mode === 'signup') {
        await signUp(email, password);
        // verification email sent automatically by signUp
      } else {
        await signIn(email, password);
      }
      // after successful auth, modal will close via onClose when user state updates
    } catch (err) {
      setError(err.message || 'Authentication failed');
    }
  };

  // If the user is already logged in, close the modal automatically
  if (user) {
    if (onClose) onClose();
    return null;
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-content">
        <h2 className="modal-title">{mode === 'signin' ? 'Sign In' : 'Create Account'}</h2>
        {error && <p className="error-text">{error}</p>}
        <form onSubmit={handleSubmit} className="auth-form">
          <label className="text-input">
            <span>Email</span>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label className="text-input">
            <span>Password</span>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
          <button type="submit" className="pill primary">
            {mode === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
        <p className="switch-auth">
          {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}
          <button type="button" className="pill secondary" onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}>
            {mode === 'signin' ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
        <button type="button" className="icon-button close-modal" onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>
      </div>
    </div>
  );
};

export default AuthModal;
