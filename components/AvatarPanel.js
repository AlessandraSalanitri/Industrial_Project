import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { useUser } from '../context/UserContext';
import '../styles/avatar_panel.css';

export default function AvatarPanel({ onClose }) {
  const router = useRouter();
  const { user, logout } = useUser();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const avatarSrc = user?.avatar ? `/assets/avatars/${user.avatar}.png` : null;

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
        onClick={() => router.push("/child/create_avatar")}>Create Avatar </button>

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
            <span className="icon">&#x21B5;</span> Logout
          </button>
        </div>
      </div>
    </motion.div>
  );
}
