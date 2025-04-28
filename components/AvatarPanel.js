
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { useUser } from '../context/UserContext';
import { useState } from 'react';
import { EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { firebaseAuth } from '../firebase/firebaseConfig';
import '../styles/avatar_panel.css';

export default function AvatarPanel({ onClose }) {
  const { user, logout, exitChildMode } = useUser();
  const router = useRouter();
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [parentPassword, setParentPassword] = useState('');

  const isSimulatedChild = user?.isSimulated;

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleExitToParent = async () => {
    try {
      const currentUser = firebaseAuth.currentUser;
      const credential = EmailAuthProvider.credential(currentUser.email, parentPassword);
      await reauthenticateWithCredential(currentUser, credential);

      exitChildMode(); //  safely update context

      setTimeout(() => {
        router.replace('/parent/dashboard'); //  clean replace
        setTimeout(() => {
          window.location.reload(); //  clean reload after
        }, 300);
      }, 300);

      } catch (error) {
        console.error("Error exiting to parent:", error);
        alert('Wrong password. Please try again.');
      }
    };

    const avatarSrc = user?.avatar ? `/assets/avatars/${user.avatar}.png` : null;

    if (process.env.NODE_ENV === "development") {
      console.log("User email in AvatarPanel:", user?.email);
      console.log("Is Simulated Child:", isSimulatedChild);
    }
  
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

          {/* Only show exit for simulated child access */}
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
    </motion.div>
  );
}