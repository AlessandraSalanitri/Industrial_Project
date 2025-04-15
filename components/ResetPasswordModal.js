import { useState } from 'react';
import { resetPassword } from '../firebase/auth/resetPassword'; // Make sure this exists
import '../styles/reset_modal.css';

export default function ResetPasswordModal({ onClose }) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleReset = async () => {
    const trimmedEmail = email.trim().toLowerCase(); // sanitize here too (optional)
    const { success, error } = await resetPassword(trimmedEmail);
    setMessage(success ? 'Reset email sent!' : error?.message || 'Error occurred.');
  };

  return (
    <div className="modal-backdrop">
      <div className="reset-modal">
        <button className="close-btn" onClick={onClose}>X</button>
        <h3>Reset Password</h3>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button className="button button-primary" onClick={handleReset}>
          Send Reset Link
        </button>
        {message && <p className="reset-message">{message}</p>}
      </div>
    </div>
  );
}
