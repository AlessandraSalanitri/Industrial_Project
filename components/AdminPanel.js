import { motion } from 'framer-motion';
import Image from 'next/image';
import { useUser } from '../context/UserContext';
import { useRouter } from 'next/router';
import '../styles/admin_panel.css';

export default function AdminPanel({ onClose }) {
  const { user, logout } = useUser();
  const router = useRouter();

  const handlePersonalDetails = () => {
    router.push('/parent/personal_details');
  };

  const handleSubscription = () => {
    router.push('/parent/subscription');
  };

  const handleSettings = () => {
    router.push('/parent/settings');
  };

  const goToDashboard = () => {
    router.push('/parent/dashboard');
  };

  
  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <motion.div
      className="admin-panel"
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ duration: 0.4 }}
    >
      <div className="admin-header">
        <button onClick={onClose}>X</button>
      </div>

      <div className="admin-content">
        <div className="admin-avatar" onClick={goToDashboard} style={{ cursor: "pointer" }}>
            <Image
            src="/assets/account.png"
            alt="Profile"
            width={100}
            height={100}
            />

        <div className="admin-username">{user?.email}</div>
        </div>

        <div className="admin-links">
        <button className="admin-btn" onClick={handlePersonalDetails}>
            <i className="icon">👤</i> Personal details
        </button>
        
        <button className="admin-btn" onClick={handleSubscription}>
            <i className="icon">🧾</i> Subscription
        </button>
        
        <button className="admin-btn" onClick={handleSettings}>
            <i className="icon">⚙️</i> Settings
        </button>
        
        <button className="admin-btn logout" onClick={handleLogout}>
            <i className="icon">🔒</i> Logout
        </button>
        </div>
      </div>
    </motion.div>
  );
}
