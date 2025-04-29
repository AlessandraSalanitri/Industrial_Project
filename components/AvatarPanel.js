import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { useUser } from '../context/UserContext';
import { useState } from 'react';
import { EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { firebaseAuth } from '../firebase/firebaseConfig';
import ErrorModal from './ErrorModal';
import '../styles/avatar_panel.css';

export default function AvatarPanel({ onClose }) {
  const { user, logout, exitChildMode } = useUser();
  const router = useRouter();
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [parentPassword, setParentPassword] = useState('');
  const [triesLeft, setTriesLeft] = useState(5);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [lockout, setLockout] = useState(false);

  const isSimulatedChild = user?.isSimulated;
  const avatarSrc = user?.avatar ? `/assets/avatars/${user.avatar}.png` : null;

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // If user enter wrong password, show error modal and decrement tries left but don't authenticate yet
  // if password field is empty show modal but don't authenticate yet
  // if password is correct, authenticate and exit child mode
  // if tries left is 0, show lockout message and don't authenticate
  const handleExitToParent = async () => {
    if (triesLeft <= 0) {
      setLockout(true);
      return;
    }
  
    try {
      const currentUser = firebaseAuth.currentUser;
      if (!currentUser || !parentPassword) throw new Error("Missing user or password");
  
      const credential = EmailAuthProvider.credential(currentUser.email, parentPassword);
      await reauthenticateWithCredential(currentUser, credential);
  
      // Successful reauth: Exit simulated mode
      exitChildMode();
      setTriesLeft(5); // Reset tries
      setTimeout(() => {
        router.replace('/parent/dashboard');
        setTimeout(() => window.location.reload(), 300);
      }, 300);
  
    } catch (error) {
      console.error("Error exiting to parent:", error.message || error);
      setTriesLeft((prev) => prev - 1);
      setErrorModalVisible(true); // Show feedback
    }
  };
  

  return (
    <motion.div
      className="avatar-panel"
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ duration: 0.5 }}
    >
      <div className="avatar-header">
        <button onClick={onClose}>X</button>
      </div>

      <div className="avatar-content">
        <button
          className="button button-secondary"
          onClick={() => router.push("/child/create_avatar")}
        >
          Create Avatar
        </button>

        <Image
          src={avatarSrc}
          alt="Avatar"
          width={140}
          height={140}
          className="avatar-img"
        />

        <div className="username">{user?.email}</div>

        <div className="avatar-actions">
          <button className="button button-primary" onClick={handleLogout}>
            <span className="icon">↵</span> Logout
          </button>

          {isSimulatedChild && (
            <>
              <button
                className="button button-secondary"
                onClick={() => setShowPasswordInput(true)}
              >
                Exit to Parent Dashboard
              </button>

              {showPasswordInput && (
                <div style={{ marginTop: '10px' }}>
                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={parentPassword}
                    onChange={(e) => setParentPassword(e.target.value)}
                    style={{ padding: '8px', marginBottom: '10px', width: '100%' }}
                  />
                  <button
                    className="button button-primary"
                    onClick={handleExitToParent}
                  >
                    Confirm Exit
                  </button>
                  <button
                    className="button button-secondary"
                    onClick={() => setShowPasswordInput(false)}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Error Modal */}
      {errorModalVisible && (
        <ErrorModal
          triesLeft={triesLeft}
          onClose={() => setErrorModalVisible(false)}
        />
      )}

      {/* Lockout Message */}
      {lockout && (
        <div className="lockout-message">
          <p>You are temporarily locked out due to too many failed attempts.</p>
        </div>
      )}
    </motion.div>
  );
}
